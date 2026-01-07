// Re-export types from the main types file
export * from '@/types/llm';

// Additional service-specific types

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface CompletionResult {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  latencyMs: number;
  provider: string;
  model: string;
}

export interface HealthCheckResult {
  provider: string;
  available: boolean;
  latencyMs?: number;
  error?: string;
  modelLoaded?: boolean;
}
