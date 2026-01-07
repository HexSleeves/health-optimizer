// Health Types - Core data models for user health information

export type ConditionCategory =
  | 'cardiovascular'
  | 'metabolic'
  | 'digestive'
  | 'respiratory'
  | 'musculoskeletal'
  | 'neurological'
  | 'autoimmune'
  | 'mental_health'
  | 'hormonal'
  | 'other';

export type ConditionSeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export type GoalCategory =
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_building'
  | 'endurance'
  | 'flexibility'
  | 'energy'
  | 'sleep'
  | 'stress_management'
  | 'disease_management'
  | 'longevity'
  | 'other';

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'low_carb'
  | 'low_fat'
  | 'gluten_free'
  | 'dairy_free'
  | 'halal'
  | 'kosher'
  | 'none';

export type FitnessLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type MobilityLevel = 'full' | 'limited_upper' | 'limited_lower' | 'wheelchair' | 'bedridden';

// Condition model
export interface HealthCondition {
  id: string;
  name: string;
  category: ConditionCategory;
  severity: ConditionSeverity;
  diagnosedDate?: string; // ISO date
  notes?: string;
  isManaged: boolean;
  managedWith?: string[]; // Medications, treatments, etc.
}

// Medication model
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  purpose?: string;
  startDate?: string;
  prescribedBy?: string;
  sideEffects?: string[];
}

// Allergy model
export interface Allergy {
  id: string;
  allergen: string;
  type: 'food' | 'drug' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  reactions?: string[];
  diagnosedDate?: string;
}

// Health Goal model
export interface HealthGoal {
  id: string;
  category: GoalCategory;
  title: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string;
  currentValue?: number;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
}

// User preferences for health recommendations
export interface HealthPreferences {
  dietaryRestrictions: DietaryRestriction[];
  fitnessLevel: FitnessLevel;
  mobilityLevel: MobilityLevel;
  preferredWorkoutDuration: number; // minutes
  preferredWorkoutDays: number; // days per week
  mealsPerDay: number;
  sleepGoalHours: number;
  wakeUpTime?: string; // HH:mm
  bedTime?: string; // HH:mm
  avoidedFoods: string[];
  favoredFoods: string[];
  supplementBudget?: number; // monthly budget in cents
}

// Baseline metrics from user input
export interface BaselineMetrics {
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  bodyFatPercentage?: number;
  waistCircumferenceCm?: number;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  fastingGlucose?: number;
  cholesterolTotal?: number;
  cholesterolLDL?: number;
  cholesterolHDL?: number;
  triglycerides?: number;
}

// Complete Health Profile
export interface HealthProfile {
  id: string;
  userId: string;
  conditions: HealthCondition[];
  medications: Medication[];
  allergies: Allergy[];
  goals: HealthGoal[];
  preferences: HealthPreferences;
  baselineMetrics: BaselineMetrics;
  familyHistory?: string[];
  lifestyleFactors?: {
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
    caffeineConsumption: 'none' | 'low' | 'moderate' | 'high';
    stressLevel: 'low' | 'moderate' | 'high' | 'very_high';
  };
  createdAt: string;
  updatedAt: string;
}

// Condition database entry (for autocomplete/selection)
export interface ConditionEntry {
  id: string;
  name: string;
  aliases: string[];
  category: ConditionCategory;
  icdCode?: string;
  description: string;
  commonSymptoms: string[];
  relatedConditions: string[];
}

// Medication database entry
export interface MedicationEntry {
  id: string;
  brandName: string;
  genericName: string;
  drugClass: string;
  commonUses: string[];
  commonDosages: string[];
  interactions: string[];
  contraindications: string[];
}
