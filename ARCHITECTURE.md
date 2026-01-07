# Health Optimizer - iOS Health Optimization Application

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              iOS Application                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Expo Router (Navigation)                     │   │
│  │   ┌─────────┐ ┌──────────────┐ ┌───────┐ ┌───────────┐ ┌──────────┐│   │
│  │   │  Home   │ │Health Profile│ │ Plans │ │ Assistant │ │ Settings ││   │
│  │   └────┬────┘ └──────┬───────┘ └───┬───┘ └─────┬─────┘ └────┬─────┘│   │
│  └────────┼─────────────┼─────────────┼───────────┼────────────┼──────┘   │
│           │             │             │           │            │          │
│  ┌────────▼─────────────▼─────────────▼───────────▼────────────▼──────┐   │
│  │                        State Management (Zustand)                   │   │
│  │   ┌──────────────┐ ┌────────────┐ ┌───────────┐ ┌────────────────┐ │   │
│  │   │ User Store   │ │Health Store│ │Plans Store│ │ Assistant Store│ │   │
│  │   └──────────────┘ └────────────┘ └───────────┘ └────────────────┘ │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│  ┌─────────────────────────────────▼──────────────────────────────────┐   │
│  │                          Service Layer                              │   │
│  │  ┌──────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │   │
│  │  │HealthKit Svc │ │LLM Provider Svc │ │ Recommendation Engine   │  │   │
│  │  └──────┬───────┘ └────────┬────────┘ └────────────┬────────────┘  │   │
│  └─────────┼──────────────────┼───────────────────────┼───────────────┘   │
│            │                  │                       │                    │
│  ┌─────────▼──────────────────▼───────────────────────▼───────────────┐   │
│  │                     LLM Provider Abstraction                        │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────────┐   │   │
│  │  │OpenAI Provider│ │Gemini Provider│ │ Local Provider (Core ML) │   │   │
│  │  └──────────────┘ └──────────────┘ └───────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌────────────┐ ┌───────────────┐ ┌────────────────┐
            │Apple Health│ │  Convex DB    │ │ External APIs  │
            │    Kit     │ │  (Backend)    │ │(OpenAI/Gemini) │
            └────────────┘ └───────────────┘ └────────────────┘
```

## Directory Structure

```
health-optimizer/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── index.tsx             # Home tab
│   │   ├── profile.tsx           # Health Profile tab
│   │   ├── plans.tsx             # Plans tab
│   │   ├── assistant.tsx         # LLM Assistant tab
│   │   └── settings.tsx          # Settings tab
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── onboarding.tsx
│   ├── intake/                   # Health intake wizard
│   │   ├── _layout.tsx
│   │   ├── conditions.tsx
│   │   ├── medications.tsx
│   │   ├── allergies.tsx
│   │   ├── goals.tsx
│   │   └── review.tsx
│   ├── plan/                     # Individual plan views
│   │   ├── diet/[id].tsx
│   │   ├── exercise/[id].tsx
│   │   └── supplements/[id].tsx
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   └── scroll-area.tsx
│   ├── health/                   # Health-specific components
│   │   ├── ConditionInput.tsx
│   │   ├── ConditionBadge.tsx
│   │   ├── SeveritySlider.tsx
│   │   └── HealthKitSyncStatus.tsx
│   ├── plans/                    # Plan components
│   │   ├── RecommendationCard.tsx
│   │   ├── MealCard.tsx
│   │   ├── ExerciseCard.tsx
│   │   ├── SupplementCard.tsx
│   │   └── ProgressChart.tsx
│   ├── assistant/                # Chat components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── ContextPanel.tsx
│   └── settings/                 # Settings components
│       ├── LLMProviderSelector.tsx
│       └── HealthKitPermissions.tsx
├── services/                     # Business logic services
│   ├── llm/                      # LLM provider abstraction
│   │   ├── types.ts
│   │   ├── provider-factory.ts
│   │   ├── openai-provider.ts
│   │   ├── gemini-provider.ts
│   │   ├── local-provider.ts
│   │   └── fallback-chain.ts
│   ├── healthkit/                # HealthKit integration
│   │   ├── types.ts
│   │   ├── healthkit-service.ts
│   │   ├── permissions.ts
│   │   └── sync-scheduler.ts
│   ├── recommendations/          # Recommendation engines
│   │   ├── diet-engine.ts
│   │   ├── exercise-engine.ts
│   │   ├── supplement-engine.ts
│   │   └── lifestyle-engine.ts
│   └── personalization/          # Personalization logic
│       ├── profile-analyzer.ts
│       ├── interaction-checker.ts
│       └── scoring-engine.ts
├── stores/                       # Zustand state stores
│   ├── user-store.ts
│   ├── health-store.ts
│   ├── plans-store.ts
│   ├── assistant-store.ts
│   └── settings-store.ts
├── convex/                       # Convex backend
│   ├── _generated/
│   ├── schema.ts                 # Database schema
│   ├── users.ts                  # User functions
│   ├── healthProfiles.ts         # Health profile functions
│   ├── healthKitSync.ts          # HealthKit sync functions
│   ├── dietPlans.ts              # Diet plan functions
│   ├── exercisePlans.ts          # Exercise plan functions
│   ├── supplementPlans.ts        # Supplement plan functions
│   ├── conversations.ts          # Chat functions
│   ├── content/                  # Content management
│   │   ├── exercises.ts
│   │   ├── recipes.ts
│   │   └── supplements.ts
│   └── auth.ts                   # Authentication
├── hooks/                        # Custom React hooks
│   ├── useHealthKit.ts
│   ├── useLLM.ts
│   ├── useRecommendations.ts
│   └── useAuth.ts
├── utils/                        # Utility functions
│   ├── constants.ts
│   ├── validation.ts
│   ├── formatters.ts
│   └── health-calculations.ts
├── types/                        # TypeScript types
│   ├── health.ts
│   ├── recommendations.ts
│   ├── llm.ts
│   └── healthkit.ts
├── assets/                       # Static assets
│   ├── images/
│   └── fonts/
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── convex.json
├── .env.example
└── README.md
```

## Navigation Structure

```
Root Navigator
├── Auth Stack (unauthenticated)
│   ├── Sign In (Apple Sign-In)
│   └── Onboarding (first-time setup)
├── Intake Stack (post-auth, first time)
│   ├── Conditions
│   ├── Medications
│   ├── Allergies
│   ├── Goals
│   └── Review
└── Main Tabs (authenticated)
    ├── Home Tab
    │   └── Dashboard with quick actions
    ├── Health Profile Tab
    │   ├── Profile Summary
    │   ├── Edit Conditions
    │   ├── HealthKit Data View
    │   └── Goals & Progress
    ├── Plans Tab
    │   ├── Diet Plan
    │   ├── Exercise Plan
    │   ├── Supplement Plan
    │   └── Lifestyle Plan
    ├── Assistant Tab
    │   ├── Chat Interface
    │   └── Conversation History
    └── Settings Tab
        ├── LLM Provider Config
        ├── HealthKit Permissions
        ├── Privacy & Data
        └── Account
```

## State Management

Using Zustand for client state with persistence:

```typescript
// User Store - Authentication and user data
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
}

// Health Store - Health profile and HealthKit data
interface HealthStore {
  profile: HealthProfile | null;
  conditions: HealthCondition[];
  medications: Medication[];
  allergies: Allergy[];
  healthKitData: BiometricSnapshot[];
  lastSyncAt: Date | null;
  updateProfile: (profile) => void;
  syncHealthKit: () => Promise<void>;
}

// Plans Store - Recommendation plans
interface PlansStore {
  dietPlan: DietPlan | null;
  exercisePlan: ExercisePlan | null;
  supplementPlan: SupplementPlan | null;
  lifestylePlan: LifestylePlan | null;
  isGenerating: boolean;
  generatePlans: () => Promise<void>;
}

// Assistant Store - Chat state
interface AssistantStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  createConversation: () => void;
}

// Settings Store - App configuration
interface SettingsStore {
  llmProvider: 'openai' | 'gemini' | 'local';
  llmModel: string;
  healthKitPermissions: PermissionStatus[];
  setLLMProvider: (provider) => void;
}
```

## LLM Provider Abstraction

```typescript
// Provider Interface
interface LLMProvider {
  name: string;
  models: string[];
  isAvailable: () => Promise<boolean>;
  streamComplete(prompt: string, context: LLMContext): AsyncIterable<string>;
  complete(prompt: string, context: LLMContext): Promise<string>;
  healthCheck(): Promise<boolean>;
}

// Context for health-aware responses
interface LLMContext {
  systemPrompt: string;
  healthProfile: HealthProfile;
  recentHealthKitData: BiometricSnapshot[];
  conversationHistory: Message[];
  safetyGuidelines: string[];
}

// Provider Factory
function getProvider(type: 'openai' | 'gemini' | 'local'): LLMProvider;

// Fallback Chain
class FallbackChain implements LLMProvider {
  providers: LLMProvider[];
  async complete(prompt, context) {
    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          return await provider.complete(prompt, context);
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next...`);
      }
    }
    return this.getFallbackResponse();
  }
}
```

## Environment Configuration

```bash
# .env.example

# Convex
CONVEX_URL=https://your-deployment.convex.cloud

# LLM Providers
LLM_DEFAULT_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-pro
LOCAL_MODEL_ENABLED=false
LOCAL_MODEL_NAME=llama-3-8b-health

# Feature Flags
ENABLE_HEALTHKIT=true
ENABLE_OFFLINE_MODE=true
ENABLE_LOCAL_LLM=false

# Environment
ENVIRONMENT=development
```

## Security & Privacy Architecture

1. **Data Classification**
   - PHI (Protected Health Information): Encrypted at rest, never sent without consent
   - PII (Personally Identifiable Information): Encrypted, minimal retention
   - Usage Data: Anonymized analytics only

2. **Storage Strategy**
   - Sensitive data: expo-secure-store (encrypted keychain)
   - Health data: Local-first, sync to Convex only with explicit consent
   - API keys: expo-secure-store, never in plain text

3. **HealthKit Privacy**
   - Request minimal permissions needed
   - Data stays on device by default
   - Explicit consent for cloud sync
   - Clear data export/deletion options

4. **LLM Safety**
   - No raw health data sent to LLM without anonymization
   - Emergency detection with appropriate responses
   - Clear "not medical advice" disclaimers
   - Logging of safety-flagged conversations

## Performance Optimizations

1. **LLM Responses**: Streaming for perceived speed
2. **HealthKit Sync**: Background fetch with intelligent scheduling
3. **Offline Mode**: AsyncStorage cache with Convex sync queue
4. **Images**: Lazy loading, proper caching
5. **Local Model**: Memory management, unload when inactive
6. **Bundle Size**: Code splitting, dynamic imports for heavy features
