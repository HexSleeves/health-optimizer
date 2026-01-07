import { LLMProvider, LLMProviderType, LLMConfig, LLMProviderInfo, OPENAI_MODELS, GEMINI_MODELS, LOCAL_MODELS } from '@/types/llm';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { LocalProvider } from './local-provider';

// Singleton instances
let openaiProvider: OpenAIProvider | null = null;
let geminiProvider: GeminiProvider | null = null;
let localProvider: LocalProvider | null = null;

/**
 * Get or create a provider instance
 */
export function getProvider(type: LLMProviderType, config?: Partial<LLMConfig>): LLMProvider {
  switch (type) {
    case 'openai':
      if (!openaiProvider || config) {
        openaiProvider = new OpenAIProvider(config);
      }
      return openaiProvider;
      
    case 'gemini':
      if (!geminiProvider || config) {
        geminiProvider = new GeminiProvider(config);
      }
      return geminiProvider;
      
    case 'local':
      if (!localProvider || config) {
        localProvider = new LocalProvider(config);
      }
      return localProvider;
      
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

/**
 * Get all provider information
 */
export function getAllProviderInfo(): LLMProviderInfo[] {
  return [
    {
      type: 'openai',
      name: 'OpenAI',
      description: 'GPT-4o and GPT-3.5 models. Best quality responses.',
      models: OPENAI_MODELS,
      isConfigured: !!openaiProvider?.config.apiKey,
      requiresApiKey: true,
      supportsStreaming: true,
      supportsOffline: false,
      iconName: 'sparkles',
    },
    {
      type: 'gemini',
      name: 'Google Gemini',
      description: 'Gemini Pro models. Good alternative to OpenAI.',
      models: GEMINI_MODELS,
      isConfigured: !!geminiProvider?.config.apiKey,
      requiresApiKey: true,
      supportsStreaming: true,
      supportsOffline: false,
      iconName: 'bot',
    },
    {
      type: 'local',
      name: 'Local Model',
      description: 'On-device inference. Works offline but limited capabilities.',
      models: LOCAL_MODELS,
      isConfigured: false, // TODO: Check if model is downloaded
      requiresApiKey: false,
      supportsStreaming: false,
      supportsOffline: true,
      iconName: 'smartphone',
    },
  ];
}

/**
 * Update provider configuration
 */
export function updateProviderConfig(type: LLMProviderType, config: Partial<LLMConfig>): void {
  const provider = getProvider(type);
  provider.setConfig(config);
}

/**
 * Check if a provider is available
 */
export async function isProviderAvailable(type: LLMProviderType): Promise<boolean> {
  try {
    const provider = getProvider(type);
    return await provider.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Get the best available provider based on configuration and availability
 */
export async function getBestAvailableProvider(
  preferredOrder: LLMProviderType[] = ['openai', 'gemini', 'local']
): Promise<LLMProvider | null> {
  for (const type of preferredOrder) {
    const provider = getProvider(type);
    if (await provider.isAvailable()) {
      return provider;
    }
  }
  return null;
}

/**
 * Reset all provider instances (useful for testing or config changes)
 */
export function resetProviders(): void {
  openaiProvider = null;
  geminiProvider = null;
  localProvider = null;
}
