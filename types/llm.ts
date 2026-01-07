// LLM Types - Provider abstraction and chat interfaces

import { HealthProfile } from './health';
import { BiometricSnapshot } from './healthkit';

// ===================
// PROVIDER TYPES
// ===================

export type LLMProviderType = 'openai' | 'gemini' | 'local';

export interface LLMConfig {
  provider: LLMProviderType;
  model: string;
  apiKey?: string;
  endpoint?: string;
  localModelPath?: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface LLMProviderInfo {
  type: LLMProviderType;
  name: string;
  description: string;
  models: LLMModelInfo[];
  isConfigured: boolean;
  requiresApiKey: boolean;
  supportsStreaming: boolean;
  supportsOffline: boolean;
  iconName: string;
}

export interface LLMModelInfo {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kTokens?: number; // For cloud providers
  isDefault: boolean;
}

// Available models per provider
export const OPENAI_MODELS: LLMModelInfo[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable model, best for complex health queries',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.005,
    isDefault: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and affordable, good for most queries',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kTokens: 0.00015,
    isDefault: false,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Legacy model, fastest response times',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    costPer1kTokens: 0.0005,
    isDefault: false,
  },
];

export const GEMINI_MODELS: LLMModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast and efficient, latest generation',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kTokens: 0.0001,
    isDefault: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Previous generation flash model',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kTokens: 0.0001,
    isDefault: false,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable Gemini model',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kTokens: 0.00125,
    isDefault: false,
  },
];

export const LOCAL_MODELS: LLMModelInfo[] = [
  {
    id: 'llama-3-8b-health',
    name: 'Llama 3 8B (Health)',
    description: 'Local model fine-tuned for health queries',
    contextWindow: 8192,
    maxOutputTokens: 2048,
    isDefault: true,
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    description: 'Small but capable local model',
    contextWindow: 4096,
    maxOutputTokens: 1024,
    isDefault: false,
  },
];

// ===================
// CONTEXT TYPES
// ===================

export interface LLMContext {
  // System configuration
  systemPrompt: string;
  safetyGuidelines: string[];
  
  // User health context
  healthProfile: HealthProfile | null;
  recentHealthKitData: BiometricSnapshot[];
  currentPlans: {
    hasDietPlan: boolean;
    hasExercisePlan: boolean;
    hasSupplementPlan: boolean;
  };
  
  // Conversation context
  conversationHistory: Message[];
  maxHistoryMessages: number;
  
  // Session context
  sessionStartTime: string;
  lastInteractionTime: string;
}

// ===================
// CHAT TYPES
// ===================

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  llmProviderUsed: LLMProviderType;
  modelUsed: string;
  tags?: string[];
  isArchived: boolean;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  
  // Context at time of message
  contextSnapshot?: {
    recentSteps?: number;
    recentSleep?: number;
    activeConditions?: string[];
  };
  
  // Safety
  safetyFlags: SafetyFlag[];
  
  // Metadata
  tokensUsed?: number;
  latencyMs?: number;
  providerUsed?: LLMProviderType;
  modelUsed?: string;
}

export interface SafetyFlag {
  type: 'emergency' | 'medical_advice' | 'self_harm' | 'dangerous_recommendation';
  description: string;
  triggered: boolean;
  action: 'block' | 'warn' | 'log';
}

// ===================
// STREAMING TYPES
// ===================

export interface StreamChunk {
  type: 'content' | 'error' | 'done';
  content?: string;
  error?: string;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

// ===================
// PROVIDER INTERFACE
// ===================

export interface LLMProvider {
  type: LLMProviderType;
  name: string;
  config: LLMConfig;
  
  // Core methods
  complete(prompt: string, context: LLMContext): Promise<string>;
  streamComplete(prompt: string, context: LLMContext): AsyncIterable<StreamChunk>;
  
  // Health checks
  isAvailable(): Promise<boolean>;
  healthCheck(): Promise<{ available: boolean; latencyMs?: number; error?: string }>;
  
  // Configuration
  setConfig(config: Partial<LLMConfig>): void;
  getAvailableModels(): LLMModelInfo[];
}

// ===================
// SYSTEM PROMPTS
// ===================

export interface SystemPromptTemplate {
  id: string;
  name: string;
  basePrompt: string;
  healthProfileInjection: string;
  healthKitDataInjection: string;
  safetyBoundaries: string;
  responseGuidelines: string;
}

export const DEFAULT_SYSTEM_PROMPT_TEMPLATE: SystemPromptTemplate = {
  id: 'default',
  name: 'Health Optimizer Assistant',
  basePrompt: `You are a knowledgeable health and wellness assistant within the Health Optimizer app. Your role is to provide personalized guidance on diet, exercise, supplementation, and lifestyle based on the user's health profile.`,
  
  healthProfileInjection: `
## User Health Profile
{{#if conditions}}
### Health Conditions:
{{#each conditions}}
- {{name}} ({{severity}} severity){{#if notes}}: {{notes}}{{/if}}
{{/each}}
{{/if}}

{{#if medications}}
### Current Medications:
{{#each medications}}
- {{name}} {{dosage}} - {{frequency}}
{{/each}}
{{/if}}

{{#if allergies}}
### Allergies:
{{#each allergies}}
- {{allergen}} ({{severity}})
{{/each}}
{{/if}}

{{#if goals}}
### Health Goals:
{{#each goals}}
- {{title}} ({{priority}} priority)
{{/each}}
{{/if}}
`,
  
  healthKitDataInjection: `
## Recent Health Data (Last 7 Days)
- Average daily steps: {{avgSteps}}
- Average sleep: {{avgSleep}} hours
- Resting heart rate: {{restingHR}} bpm
- HRV: {{hrv}} ms
- Exercise sessions: {{exerciseCount}}
`,
  
  safetyBoundaries: `
## Important Boundaries
- You are NOT a medical professional. Always recommend consulting healthcare providers for medical decisions.
- Do not diagnose conditions or prescribe medications.
- If the user mentions emergency symptoms (chest pain, difficulty breathing, severe bleeding, suicidal thoughts), immediately recommend they seek emergency medical care.
- Be cautious with supplement recommendations that may interact with the user's medications.
- Provide evidence-based information when possible.
`,
  
  responseGuidelines: `
## Response Guidelines
- Be conversational but professional.
- Personalize responses based on the user's profile.
- When recommending exercises, consider the user's mobility level and conditions.
- When discussing diet, respect dietary restrictions and allergies.
- Provide actionable, specific advice rather than generic suggestions.
- Use metric units by default, but can convert if asked.
- Keep responses concise but thorough.
`,
};

// ===================
// ERROR TYPES
// ===================

export class LLMError extends Error {
  constructor(
    message: string,
    public code: LLMErrorCode,
    public provider: LLMProviderType,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export type LLMErrorCode =
  | 'API_KEY_INVALID'
  | 'API_KEY_MISSING'
  | 'RATE_LIMITED'
  | 'CONTEXT_TOO_LONG'
  | 'MODEL_NOT_AVAILABLE'
  | 'NETWORK_ERROR'
  | 'PROVIDER_ERROR'
  | 'CONTENT_FILTERED'
  | 'LOCAL_MODEL_NOT_LOADED'
  | 'UNKNOWN';
