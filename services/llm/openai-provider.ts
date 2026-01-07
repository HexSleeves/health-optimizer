import OpenAI from 'openai';
import {
  LLMProvider,
  LLMConfig,
  LLMContext,
  LLMModelInfo,
  StreamChunk,
  LLMError,
  OPENAI_MODELS,
} from '@/types/llm';
import { buildSystemPrompt } from './prompt-builder';

export class OpenAIProvider implements LLMProvider {
  type = 'openai' as const;
  name = 'OpenAI';
  config: LLMConfig;
  private client: OpenAI | null = null;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = {
      provider: 'openai',
      model: config.model || 'gpt-4o',
      apiKey: config.apiKey,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2048,
      topP: config.topP,
      frequencyPenalty: config.frequencyPenalty,
      presencePenalty: config.presencePenalty,
    };

    if (this.config.apiKey) {
      this.initClient();
    }
  }

  private initClient(): void {
    if (this.config.apiKey) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
      });
    }
  }

  setConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.apiKey) {
      this.initClient();
    }
  }

  getAvailableModels(): LLMModelInfo[] {
    return OPENAI_MODELS;
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
      // Simple test call
      await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      });
      return {
        available: true,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
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
        'OpenAI client not initialized. Please configure API key.',
        'API_KEY_MISSING',
        'openai',
        false
      );
    }

    const systemPrompt = buildSystemPrompt(context);
    const messages = this.buildMessages(systemPrompt, prompt, context);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError(
          'No content in response',
          'PROVIDER_ERROR',
          'openai',
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
        error: 'OpenAI client not initialized. Please configure API key.',
      };
      return;
    }

    const systemPrompt = buildSystemPrompt(context);
    const messages = this.buildMessages(systemPrompt, prompt, context);

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        const finishReason = chunk.choices[0]?.finish_reason;

        if (content) {
          yield { type: 'content', content };
        }

        if (finishReason) {
          yield {
            type: 'done',
            finishReason: finishReason as StreamChunk['finishReason'],
          };
        }
      }
    } catch (error: any) {
      yield {
        type: 'error',
        error: error.message || 'Streaming error',
      };
    }
  }

  private buildMessages(
    systemPrompt: string,
    userPrompt: string,
    context: LLMContext
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (limited to avoid context overflow)
    const historyLimit = context.maxHistoryMessages || 10;
    const recentHistory = context.conversationHistory.slice(-historyLimit);
    
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: userPrompt });

    return messages;
  }

  private handleError(error: any): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    // OpenAI specific error handling
    if (error.status === 401) {
      return new LLMError(
        'Invalid API key',
        'API_KEY_INVALID',
        'openai',
        false
      );
    }

    if (error.status === 429) {
      return new LLMError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        'openai',
        true
      );
    }

    if (error.status === 400 && error.message?.includes('context_length')) {
      return new LLMError(
        'Message too long. Please shorten your message.',
        'CONTEXT_TOO_LONG',
        'openai',
        false
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new LLMError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        'openai',
        true
      );
    }

    return new LLMError(
      error.message || 'Unknown error',
      'PROVIDER_ERROR',
      'openai',
      true
    );
  }
}
