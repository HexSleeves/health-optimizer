import {
  LLMProvider,
  LLMProviderType,
  LLMConfig,
  LLMContext,
  LLMModelInfo,
  StreamChunk,
  LLMError,
} from '@/types/llm';
import { getProvider, isProviderAvailable } from './provider-factory';

/**
 * FallbackChain implements LLMProvider with automatic fallback between providers
 */
export class FallbackChain implements LLMProvider {
  type: LLMProviderType = 'openai'; // Primary provider
  name = 'Fallback Chain';
  config: LLMConfig;

  private providerOrder: LLMProviderType[];
  private lastSuccessfulProvider: LLMProviderType | null = null;

  constructor(
    providerOrder: LLMProviderType[] = ['openai', 'gemini', 'local'],
    config?: Partial<LLMConfig>
  ) {
    this.providerOrder = providerOrder;
    this.config = {
      provider: providerOrder[0] || 'openai',
      model: config?.model || 'gpt-4o',
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2048,
    };
  }

  setConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setProviderOrder(order: LLMProviderType[]): void {
    this.providerOrder = order;
  }

  getAvailableModels(): LLMModelInfo[] {
    // Return models from the primary provider
    const primaryProvider = getProvider(this.providerOrder[0]);
    return primaryProvider.getAvailableModels();
  }

  async isAvailable(): Promise<boolean> {
    // Available if any provider in the chain is available
    for (const providerType of this.providerOrder) {
      if (await isProviderAvailable(providerType)) {
        return true;
      }
    }
    return false;
  }

  async healthCheck(): Promise<{ available: boolean; latencyMs?: number; error?: string }> {
    const results: { provider: string; available: boolean; latencyMs?: number }[] = [];

    for (const providerType of this.providerOrder) {
      const provider = getProvider(providerType);
      const result = await provider.healthCheck();
      results.push({
        provider: providerType,
        available: result.available,
        latencyMs: result.latencyMs,
      });

      if (result.available) {
        return {
          available: true,
          latencyMs: result.latencyMs,
        };
      }
    }

    return {
      available: false,
      error: 'No providers available in fallback chain',
    };
  }

  async complete(prompt: string, context: LLMContext): Promise<string> {
    const errors: { provider: string; error: string }[] = [];

    // If we have a last successful provider, try it first
    const orderedProviders = this.lastSuccessfulProvider
      ? [this.lastSuccessfulProvider, ...this.providerOrder.filter(p => p !== this.lastSuccessfulProvider)]
      : this.providerOrder;

    for (const providerType of orderedProviders) {
      const provider = getProvider(providerType);

      try {
        // Check if provider is available
        if (!await provider.isAvailable()) {
          console.log(`Provider ${providerType} not available, trying next...`);
          continue;
        }

        // Try to get completion
        const result = await provider.complete(prompt, context);
        this.lastSuccessfulProvider = providerType;
        return result;

      } catch (error: any) {
        console.warn(`Provider ${providerType} failed:`, error.message);
        errors.push({
          provider: providerType,
          error: error.message || 'Unknown error',
        });

        // If error is not retryable (e.g., content filtered), don't try other providers
        if (error instanceof LLMError && !error.retryable) {
          throw error;
        }
      }
    }

    // All providers failed
    const errorMessages = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
    throw new LLMError(
      `All providers failed: ${errorMessages}`,
      'PROVIDER_ERROR',
      'openai',
      false
    );
  }

  async *streamComplete(
    prompt: string,
    context: LLMContext
  ): AsyncIterable<StreamChunk> {
    const orderedProviders = this.lastSuccessfulProvider
      ? [this.lastSuccessfulProvider, ...this.providerOrder.filter(p => p !== this.lastSuccessfulProvider)]
      : this.providerOrder;

    for (const providerType of orderedProviders) {
      const provider = getProvider(providerType);

      try {
        if (!await provider.isAvailable()) {
          console.log(`Provider ${providerType} not available for streaming, trying next...`);
          continue;
        }

        // Try to stream from this provider
        let hasContent = false;
        for await (const chunk of provider.streamComplete(prompt, context)) {
          if (chunk.type === 'error') {
            throw new Error(chunk.error);
          }
          hasContent = true;
          yield chunk;
        }

        if (hasContent) {
          this.lastSuccessfulProvider = providerType;
          return;
        }

      } catch (error: any) {
        console.warn(`Provider ${providerType} streaming failed:`, error.message);
        // Continue to next provider
      }
    }

    // All providers failed
    yield {
      type: 'error',
      error: 'All providers failed. Please check your configuration.',
    };
  }

  /**
   * Get the status of all providers in the chain
   */
  async getChainStatus(): Promise<{
    provider: LLMProviderType;
    available: boolean;
    latencyMs?: number;
  }[]> {
    const results = [];

    for (const providerType of this.providerOrder) {
      const provider = getProvider(providerType);
      const health = await provider.healthCheck();
      results.push({
        provider: providerType,
        available: health.available,
        latencyMs: health.latencyMs,
      });
    }

    return results;
  }
}

// Singleton instance
let fallbackChainInstance: FallbackChain | null = null;

export function getFallbackChain(
  providerOrder?: LLMProviderType[],
  config?: Partial<LLMConfig>
): FallbackChain {
  if (!fallbackChainInstance || providerOrder || config) {
    fallbackChainInstance = new FallbackChain(providerOrder, config);
  }
  return fallbackChainInstance;
}

export function resetFallbackChain(): void {
  fallbackChainInstance = null;
}
