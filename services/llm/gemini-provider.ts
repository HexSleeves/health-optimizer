import { GoogleGenAI } from '@google/genai/web';
import {
  LLMProvider,
  LLMConfig,
  LLMContext,
  LLMModelInfo,
  StreamChunk,
  LLMError,
  GEMINI_MODELS,
} from '@/types/llm';
import { buildSystemPrompt } from './prompt-builder';

export class GeminiProvider implements LLMProvider {
  type = 'gemini' as const;
  name = 'Google Gemini';
  config: LLMConfig;
  private client: GoogleGenAI | null = null;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = {
      provider: 'gemini',
      model: config.model || 'gemini-2.5-flash',
      apiKey: config.apiKey,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2048,
      topP: config.topP,
    };

    if (this.config.apiKey) {
      this.initClient();
    }
  }

  private initClient(): void {
    if (this.config.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.config.apiKey });
    }
  }

  setConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.apiKey) {
      this.initClient();
    }
  }

  getAvailableModels(): LLMModelInfo[] {
    return GEMINI_MODELS;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.client || !this.config.apiKey) {
      return false;
    }
    try {
      const result = await this.healthCheck();
      return result.available;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{ available: boolean; latencyMs?: number; error?: string }> {
    if (!this.client || !this.config.apiKey) {
      return { available: false, error: 'API key not configured' };
    }

    const startTime = Date.now();
    try {
      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: 'Hi',
      });
      console.log('Gemini health check response:', response.text);
      return {
        available: true,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('Gemini health check error:', error);
      return {
        available: false,
        latencyMs: Date.now() - startTime,
        error: error.message || 'Unknown error',
      };
    }
  }

  async complete(prompt: string, context: LLMContext): Promise<string> {
    if (!this.client) {
      throw new LLMError(
        'Gemini client not initialized. Please configure API key.',
        'API_KEY_MISSING',
        'gemini',
        false
      );
    }

    const systemPrompt = buildSystemPrompt(context);
    const fullPrompt = this.buildPrompt(systemPrompt, prompt, context);

    try {
      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: fullPrompt,
        config: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          topP: this.config.topP,
        },
      });

      const content = response.text;

      if (!content) {
        throw new LLMError(
          'No content in response',
          'PROVIDER_ERROR',
          'gemini',
          true
        );
      }

      return content;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async *streamComplete(
    prompt: string,
    context: LLMContext
  ): AsyncIterable<StreamChunk> {
    if (!this.client) {
      yield {
        type: 'error',
        error: 'Gemini client not initialized. Please configure API key.',
      };
      return;
    }

    const systemPrompt = buildSystemPrompt(context);
    const fullPrompt = this.buildPrompt(systemPrompt, prompt, context);

    try {
      const response = await this.client.models.generateContentStream({
        model: this.config.model,
        contents: fullPrompt,
        config: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          topP: this.config.topP,
        },
      });

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          yield { type: 'content', content: text };
        }
      }

      yield { type: 'done', finishReason: 'stop' };
    } catch (error: any) {
      yield {
        type: 'error',
        error: error.message || 'Streaming error',
      };
    }
  }

  private buildPrompt(
    systemPrompt: string,
    userPrompt: string,
    context: LLMContext
  ): string {
    // Gemini doesn't have a separate system message, so we include it in the prompt
    let fullPrompt = `Instructions for this conversation:\n${systemPrompt}\n\n`;

    // Add conversation history
    const historyLimit = context.maxHistoryMessages || 10;
    const recentHistory = context.conversationHistory.slice(-historyLimit);

    if (recentHistory.length > 0) {
      fullPrompt += 'Previous conversation:\n';
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        fullPrompt += `${role}: ${msg.content}\n`;
      }
      fullPrompt += '\n';
    }

    // Add current user message
    fullPrompt += `User: ${userPrompt}\n\nAssistant:`;

    return fullPrompt;
  }

  private handleError(error: any): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    // Gemini specific error handling
    const message = error.message || '';

    if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
      return new LLMError(
        'Invalid API key',
        'API_KEY_INVALID',
        'gemini',
        false
      );
    }

    if (message.includes('RATE_LIMIT') || message.includes('quota')) {
      return new LLMError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        'gemini',
        true
      );
    }

    if (message.includes('SAFETY') || message.includes('blocked')) {
      return new LLMError(
        'Content was filtered by safety settings.',
        'CONTENT_FILTERED',
        'gemini',
        false
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new LLMError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        'gemini',
        true
      );
    }

    return new LLMError(
      error.message || 'Unknown error',
      'PROVIDER_ERROR',
      'gemini',
      true
    );
  }
}
