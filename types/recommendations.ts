// Recommendation Types - Diet, Exercise, Supplements, Lifestyle

import { HealthCondition, HealthGoal, DietaryRestriction } from './health';

// ===================
// DIET RECOMMENDATIONS
// ===================

export interface MacroRatios {
  protein: number; // percentage
  carbohydrates: number;
  fat: number;
}

export interface NutritionInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  potassiumMg?: number;
  cholesterolMg?: number;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  calories?: number;
  substitutes?: string[];
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  nutrition: NutritionInfo;
  dietaryFlags: DietaryRestriction[];
  allergenWarnings: string[];
  imageUrl?: string;
}

export interface DailyMealPlan {
  date: string;
  meals: Meal[];
  totalNutrition: NutritionInfo;
  hydrationGoalMl: number;
  notes?: string[];
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  
  // Targets
  dailyCalories: number;
  macroRatios: MacroRatios;
  fiberGoalG: number;
  waterGoalMl: number;
  
  // Restrictions & Preferences
  restrictions: DietaryRestriction[];
  avoidedFoods: string[];
  allergens: string[];
  
  // Meals
  weeklyPlan: DailyMealPlan[];
  alternativeMeals: Meal[];
  
  // Condition-specific adjustments
  conditionAdjustments: {
    condition: string;
    adjustment: string;
    rationale: string;
  }[];
  
  // Shopping
  shoppingList?: ShoppingListItem[];
  
  // Metadata
  generatedAt: string;
  generatedBy: 'openai' | 'gemini' | 'local' | 'rule_based';
  validUntil: string;
  isActive: boolean;
}

export interface ShoppingListItem {
  name: string;
  amount: number;
  unit: string;
  category: 'produce' | 'protein' | 'dairy' | 'grains' | 'pantry' | 'frozen' | 'other';
  isPurchased: boolean;
}

// ======================
// EXERCISE RECOMMENDATIONS
// ======================

export type ExerciseCategory =
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'balance'
  | 'hiit'
  | 'recovery'
  | 'sports';

export type IntensityLevel = 'low' | 'moderate' | 'high' | 'very_high';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  intensity: IntensityLevel;
  
  // Execution
  sets?: number;
  reps?: string; // "8-12" or "to failure"
  durationSeconds?: number;
  restSeconds?: number;
  
  // Instructions
  instructions: string[];
  tips: string[];
  commonMistakes: string[];
  
  // Modifications
  modifications: {
    condition: string;
    modification: string;
  }[];
  
  // Equipment
  equipment: string[];
  alternatives: string[]; // Exercise IDs
  
  // Media
  videoUrl?: string;
  imageUrls?: string[];
  
  // Metrics
  caloriesPerMinute: number;
  difficultyScore: number; // 1-10
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises: {
    exercise: Exercise;
    order: number;
    targetSets: number;
    targetReps: string;
    targetWeight?: number;
    notes?: string;
  }[];
  totalDurationMinutes: number;
  estimatedCalories: number;
  warmup?: Exercise[];
  cooldown?: Exercise[];
}

export interface ExercisePlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  
  // Schedule
  weeklySchedule: {
    dayOfWeek: number; // 0 = Sunday
    session: WorkoutSession | null;
    isRestDay: boolean;
  }[];
  
  // Configuration
  daysPerWeek: number;
  sessionDurationMinutes: number;
  intensityLevel: IntensityLevel;
  fitnessGoal: string;
  
  // Progression
  progressionModel: {
    type: 'linear' | 'undulating' | 'block';
    incrementPerWeek: number;
    deloadWeek: number;
  };
  
  // Condition modifications
  conditionModifications: {
    condition: string;
    exercisesToAvoid: string[];
    exerciseSubstitutions: { original: string; substitute: string }[];
    intensityAdjustment: string;
  }[];
  
  // Metadata
  generatedAt: string;
  generatedBy: 'openai' | 'gemini' | 'local' | 'rule_based';
  currentWeek: number;
  isActive: boolean;
}

// ========================
// SUPPLEMENT RECOMMENDATIONS
// ========================

export type SupplementCategory =
  | 'vitamin'
  | 'mineral'
  | 'amino_acid'
  | 'fatty_acid'
  | 'probiotic'
  | 'herbal'
  | 'performance'
  | 'other';

export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'preliminary';

export interface Supplement {
  id: string;
  name: string;
  category: SupplementCategory;
  description: string;
  
  // Benefits
  primaryBenefits: string[];
  secondaryBenefits: string[];
  targetConditions: string[];
  
  // Dosage
  standardDosage: string;
  dosageRange: { min: number; max: number; unit: string };
  timing: string; // "with meals", "empty stomach", etc.
  
  // Safety
  sideEffects: string[];
  contraindications: string[];
  drugInteractions: {
    drug: string;
    interaction: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
  
  // Evidence
  evidenceLevel: EvidenceLevel;
  studyReferences?: string[];
  
  // Quality
  qualityMarkers: string[]; // "Third-party tested", "GMP certified"
  recommendedBrands?: string[];
}

export interface SupplementRecommendation {
  supplement: Supplement;
  recommendedDosage: string;
  timing: string;
  rationale: string;
  priority: 'essential' | 'recommended' | 'optional';
  targetConditions: string[];
  potentialInteractions: {
    type: 'drug' | 'supplement' | 'food';
    item: string;
    warning: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
}

export interface SupplementPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  
  // Recommendations
  supplements: SupplementRecommendation[];
  
  // Daily schedule
  dailySchedule: {
    timing: 'morning' | 'with_breakfast' | 'midday' | 'with_lunch' | 'afternoon' | 'with_dinner' | 'evening' | 'bedtime';
    supplements: { name: string; dosage: string }[];
  }[];
  
  // Interactions
  interactionWarnings: {
    supplements: string[];
    warning: string;
  }[];
  
  // Cost
  estimatedMonthlyCost?: number;
  
  // Metadata
  generatedAt: string;
  generatedBy: 'openai' | 'gemini' | 'local' | 'rule_based';
  reviewDate: string;
  isActive: boolean;
}

// ========================
// LIFESTYLE RECOMMENDATIONS
// ========================

export interface SleepRecommendation {
  targetHours: number;
  bedtimeWindow: { start: string; end: string };
  wakeTimeWindow: { start: string; end: string };
  preBedroutine: string[];
  environmentTips: string[];
  thingsToAvoid: string[];
  conditionSpecific: { condition: string; tip: string }[];
}

export interface StressManagementRecommendation {
  technique: string;
  description: string;
  durationMinutes: number;
  frequency: string;
  benefits: string[];
  instructions: string[];
  resources?: string[];
}

export interface HydrationRecommendation {
  dailyGoalMl: number;
  adjustmentFactors: { factor: string; adjustment: string }[];
  timing: string[];
  tips: string[];
}

export interface EnvironmentRecommendation {
  category: 'sunlight' | 'air_quality' | 'temperature' | 'noise' | 'lighting';
  recommendation: string;
  rationale: string;
  actionItems: string[];
}

export interface LifestylePlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  
  sleep: SleepRecommendation;
  stressManagement: StressManagementRecommendation[];
  hydration: HydrationRecommendation;
  environment: EnvironmentRecommendation[];
  
  // Daily habits
  morningRoutine: string[];
  eveningRoutine: string[];
  
  // Tracking targets
  dailyTargets: {
    metric: string;
    target: number;
    unit: string;
  }[];
  
  // Metadata
  generatedAt: string;
  generatedBy: 'openai' | 'gemini' | 'local' | 'rule_based';
  isActive: boolean;
}

// ========================
// RECOMMENDATION SCORING
// ========================

export interface RecommendationScore {
  relevanceScore: number; // 0-100: How relevant to user's conditions/goals
  safetyScore: number; // 0-100: Safety considering interactions
  evidenceScore: number; // 0-100: Evidence quality
  feasibilityScore: number; // 0-100: How realistic/achievable
  overallScore: number; // Weighted average
}

export interface PersonalizedRecommendation {
  type: 'diet' | 'exercise' | 'supplement' | 'lifestyle';
  title: string;
  description: string;
  score: RecommendationScore;
  targetConditions: string[];
  targetGoals: string[];
  warnings: string[];
  actionItems: string[];
}
