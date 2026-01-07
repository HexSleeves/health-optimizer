import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Reusable validators
const conditionSeverity = v.union(
  v.literal('mild'),
  v.literal('moderate'),
  v.literal('severe'),
  v.literal('critical')
);

const conditionCategory = v.union(
  v.literal('cardiovascular'),
  v.literal('metabolic'),
  v.literal('digestive'),
  v.literal('respiratory'),
  v.literal('musculoskeletal'),
  v.literal('neurological'),
  v.literal('autoimmune'),
  v.literal('mental_health'),
  v.literal('hormonal'),
  v.literal('other')
);

const llmProvider = v.union(
  v.literal('openai'),
  v.literal('gemini'),
  v.literal('local')
);

const messageRole = v.union(
  v.literal('user'),
  v.literal('assistant'),
  v.literal('system')
);

export default defineSchema({
  // ===================
  // USER TABLES
  // ===================

  users: defineTable({
    // Authentication
    email: v.string(),
    appleUserId: v.optional(v.string()),
    name: v.optional(v.string()),

    // Profile
    avatarUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),

    // Onboarding
    hasCompletedOnboarding: v.boolean(),
    hasCompletedIntake: v.boolean(),

    // Subscription (future)
    subscriptionStatus: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_apple_user_id', ['appleUserId']),

  // LLM Configuration per user
  llmConfigs: defineTable({
    userId: v.id('users'),
    provider: llmProvider,
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),

    // API Keys (encrypted in production)
    openaiApiKey: v.optional(v.string()),
    geminiApiKey: v.optional(v.string()),

    // Local model settings
    localModelEnabled: v.boolean(),
    localModelName: v.optional(v.string()),

    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // ===================
  // HEALTH PROFILE TABLES
  // ===================

  healthProfiles: defineTable({
    userId: v.id('users'),

    // Baseline metrics
    age: v.optional(v.number()),
    sex: v.optional(v.union(v.literal('male'), v.literal('female'), v.literal('other'))),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    bodyFatPercentage: v.optional(v.number()),

    // Fitness & Mobility
    fitnessLevel: v.optional(v.string()),
    mobilityLevel: v.optional(v.string()),

    // Lifestyle
    smokingStatus: v.optional(v.string()),
    alcoholConsumption: v.optional(v.string()),
    stressLevel: v.optional(v.string()),

    // Preferences
    dietaryRestrictions: v.array(v.string()),
    avoidedFoods: v.array(v.string()),
    preferredWorkoutDuration: v.optional(v.number()),
    preferredWorkoutDays: v.optional(v.number()),
    sleepGoalHours: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Health Conditions
  healthConditions: defineTable({
    userId: v.id('users'),
    name: v.string(),
    category: conditionCategory,
    severity: conditionSeverity,
    diagnosedDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    isManaged: v.boolean(),
    managedWith: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_category', ['userId', 'category']),

  // Medications
  medications: defineTable({
    userId: v.id('users'),
    name: v.string(),
    genericName: v.optional(v.string()),
    dosage: v.string(),
    frequency: v.string(),
    purpose: v.optional(v.string()),
    startDate: v.optional(v.string()),
    prescribedBy: v.optional(v.string()),
    sideEffects: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Allergies
  allergies: defineTable({
    userId: v.id('users'),
    allergen: v.string(),
    type: v.union(
      v.literal('food'),
      v.literal('drug'),
      v.literal('environmental'),
      v.literal('other')
    ),
    severity: v.union(
      v.literal('mild'),
      v.literal('moderate'),
      v.literal('severe'),
      v.literal('anaphylactic')
    ),
    reactions: v.optional(v.array(v.string())),
    diagnosedDate: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // Health Goals
  healthGoals: defineTable({
    userId: v.id('users'),
    category: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    targetUnit: v.optional(v.string()),
    currentValue: v.optional(v.number()),
    deadline: v.optional(v.string()),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // ===================
  // HEALTHKIT SYNC TABLES
  // ===================

  healthKitAuthorizations: defineTable({
    userId: v.id('users'),
    readPermissions: v.array(v.string()),
    writePermissions: v.array(v.string()),
    lastRequestedAt: v.number(),
    lastSyncAt: v.optional(v.number()),
  }).index('by_user', ['userId']),

  healthKitSyncLogs: defineTable({
    userId: v.id('users'),
    dataType: v.string(),
    recordCount: v.number(),
    syncTimestamp: v.number(),
    status: v.union(v.literal('success'), v.literal('partial'), v.literal('failed')),
    errorMessage: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_type', ['userId', 'dataType']),

  // Daily biometric snapshots
  biometricSnapshots: defineTable({
    userId: v.id('users'),
    date: v.string(), // YYYY-MM-DD

    // Activity
    steps: v.optional(v.number()),
    activeCalories: v.optional(v.number()),
    basalCalories: v.optional(v.number()),
    exerciseMinutes: v.optional(v.number()),
    distanceMeters: v.optional(v.number()),
    flightsClimbed: v.optional(v.number()),

    // Sleep
    sleepHours: v.optional(v.number()),
    sleepQuality: v.optional(v.string()),
    sleepDeepMinutes: v.optional(v.number()),
    sleepRemMinutes: v.optional(v.number()),

    // Heart
    restingHeartRate: v.optional(v.number()),
    averageHeartRate: v.optional(v.number()),
    hrv: v.optional(v.number()),

    // Body
    weightKg: v.optional(v.number()),
    bodyFatPercentage: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_date', ['userId', 'date']),

  // ===================
  // RECOMMENDATION TABLES
  // ===================

  dietPlans: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),

    // Targets
    dailyCalories: v.number(),
    proteinRatio: v.number(),
    carbsRatio: v.number(),
    fatRatio: v.number(),
    fiberGoalG: v.optional(v.number()),
    waterGoalMl: v.optional(v.number()),

    // Restrictions
    restrictions: v.array(v.string()),
    avoidedFoods: v.array(v.string()),
    allergens: v.array(v.string()),

    // Plan content (JSON stored as string for flexibility)
    weeklyPlan: v.string(), // JSON
    shoppingList: v.optional(v.string()), // JSON
    conditionAdjustments: v.optional(v.string()), // JSON

    // Metadata
    generatedAt: v.number(),
    generatedBy: llmProvider,
    validUntil: v.number(),
    isActive: v.boolean(),
  }).index('by_user', ['userId']),

  exercisePlans: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),

    // Configuration
    daysPerWeek: v.number(),
    sessionDurationMinutes: v.number(),
    intensityLevel: v.string(),
    fitnessGoal: v.string(),

    // Plan content
    weeklySchedule: v.string(), // JSON
    progressionModel: v.optional(v.string()), // JSON
    conditionModifications: v.optional(v.string()), // JSON

    // Progress
    currentWeek: v.number(),

    // Metadata
    generatedAt: v.number(),
    generatedBy: llmProvider,
    isActive: v.boolean(),
  }).index('by_user', ['userId']),

  supplementPlans: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),

    // Plan content
    supplements: v.string(), // JSON
    dailySchedule: v.string(), // JSON
    interactionWarnings: v.optional(v.string()), // JSON

    // Cost
    estimatedMonthlyCost: v.optional(v.number()),

    // Metadata
    generatedAt: v.number(),
    generatedBy: llmProvider,
    reviewDate: v.number(),
    isActive: v.boolean(),
  }).index('by_user', ['userId']),

  lifestylePlans: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),

    // Plan content
    sleepRecommendation: v.string(), // JSON
    stressManagement: v.string(), // JSON
    hydration: v.string(), // JSON
    environment: v.optional(v.string()), // JSON
    morningRoutine: v.optional(v.array(v.string())),
    eveningRoutine: v.optional(v.array(v.string())),
    dailyTargets: v.optional(v.string()), // JSON

    // Metadata
    generatedAt: v.number(),
    generatedBy: llmProvider,
    isActive: v.boolean(),
  }).index('by_user', ['userId']),

  // ===================
  // ASSISTANT/CHAT TABLES
  // ===================

  conversations: defineTable({
    userId: v.id('users'),
    title: v.string(),
    messageCount: v.number(),
    llmProviderUsed: llmProvider,
    modelUsed: v.string(),
    tags: v.optional(v.array(v.string())),
    isArchived: v.boolean(),
    createdAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_date', ['userId', 'lastMessageAt']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    role: messageRole,
    content: v.string(),

    // Context snapshot
    contextSnapshot: v.optional(v.string()), // JSON

    // Safety
    safetyFlags: v.optional(v.array(v.string())),

    // Metadata
    tokensUsed: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    providerUsed: v.optional(llmProvider),
    modelUsed: v.optional(v.string()),

    timestamp: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_conversation_and_time', ['conversationId', 'timestamp']),

  // ===================
  // CONTENT TABLES
  // ===================

  exercises: defineTable({
    name: v.string(),
    category: v.string(),
    muscleGroups: v.array(v.string()),
    intensity: v.string(),

    // Execution
    defaultSets: v.optional(v.number()),
    defaultReps: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    restSeconds: v.optional(v.number()),

    // Instructions
    instructions: v.array(v.string()),
    tips: v.optional(v.array(v.string())),
    commonMistakes: v.optional(v.array(v.string())),

    // Modifications for conditions
    modifications: v.optional(v.string()), // JSON

    // Equipment
    equipment: v.array(v.string()),
    alternatives: v.optional(v.array(v.string())),

    // Media
    videoUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),

    // Metrics
    caloriesPerMinute: v.number(),
    difficultyScore: v.number(),
  })
    .index('by_category', ['category'])
    .index('by_intensity', ['intensity']),

  recipes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // Ingredients
    ingredients: v.string(), // JSON
    instructions: v.array(v.string()),

    // Time
    prepTimeMinutes: v.number(),
    cookTimeMinutes: v.number(),
    servings: v.number(),

    // Nutrition (per serving)
    calories: v.number(),
    proteinG: v.number(),
    carbsG: v.number(),
    fatG: v.number(),
    fiberG: v.optional(v.number()),

    // Tags
    dietaryFlags: v.array(v.string()),
    mealType: v.array(v.string()),
    allergenWarnings: v.array(v.string()),
    cuisineType: v.optional(v.string()),

    // Media
    imageUrl: v.optional(v.string()),
  })
    .index('by_meal_type', ['mealType'])
    .index('by_calories', ['calories']),

  supplements: defineTable({
    name: v.string(),
    category: v.string(),
    description: v.string(),

    // Benefits
    primaryBenefits: v.array(v.string()),
    targetConditions: v.array(v.string()),

    // Dosage
    standardDosage: v.string(),
    dosageRangeMin: v.number(),
    dosageRangeMax: v.number(),
    dosageUnit: v.string(),
    timing: v.string(),

    // Safety
    sideEffects: v.array(v.string()),
    contraindications: v.array(v.string()),
    drugInteractions: v.optional(v.string()), // JSON

    // Evidence
    evidenceLevel: v.string(),

    // Quality
    qualityMarkers: v.optional(v.array(v.string())),
  })
    .index('by_category', ['category'])
    .index('by_condition', ['targetConditions']),

  // Condition guidelines for recommendations
  conditionGuidelines: defineTable({
    conditionName: v.string(),
    category: conditionCategory,

    // Recommendations
    dietaryRecommendations: v.array(v.string()),
    dietaryRestrictions: v.array(v.string()),
    exerciseRecommendations: v.array(v.string()),
    exerciseRestrictions: v.array(v.string()),
    supplementRecommendations: v.array(v.string()),
    supplementWarnings: v.array(v.string()),
    lifestyleRecommendations: v.array(v.string()),

    // Warnings
    generalWarnings: v.array(v.string()),
    emergencySymptoms: v.optional(v.array(v.string())),

    // Sources
    evidenceSources: v.optional(v.array(v.string())),
    lastUpdated: v.number(),
  }).index('by_name', ['conditionName']),
});
