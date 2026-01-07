// HealthKit Types - Apple HealthKit integration data models

export type HealthKitPermissionStatus = 'notDetermined' | 'authorized' | 'denied' | 'sharingDenied';

export type HealthKitDataType =
  // Activity
  | 'stepCount'
  | 'distanceWalkingRunning'
  | 'activeEnergyBurned'
  | 'basalEnergyBurned'
  | 'flightsClimbed'
  | 'appleExerciseTime'
  // Body Measurements
  | 'bodyMass'
  | 'bodyFatPercentage'
  | 'height'
  | 'leanBodyMass'
  | 'waistCircumference'
  // Heart
  | 'heartRate'
  | 'heartRateVariabilitySDNN'
  | 'restingHeartRate'
  | 'walkingHeartRateAverage'
  // Sleep
  | 'sleepAnalysis'
  // Vitals
  | 'bloodPressureSystolic'
  | 'bloodPressureDiastolic'
  | 'respiratoryRate'
  | 'bodyTemperature'
  | 'oxygenSaturation'
  // Nutrition
  | 'dietaryEnergyConsumed'
  | 'dietaryProtein'
  | 'dietaryCarbohydrates'
  | 'dietaryFat'
  | 'dietaryWater'
  // Workouts
  | 'workout';

export interface HealthKitPermission {
  dataType: HealthKitDataType;
  status: HealthKitPermissionStatus;
  isRead: boolean;
  isWrite: boolean;
}

export interface HealthKitAuthorization {
  userId: string;
  readPermissions: HealthKitPermission[];
  writePermissions: HealthKitPermission[];
  lastRequestedAt: string;
  lastSyncAt?: string;
}

export interface HealthKitSyncLog {
  id: string;
  userId: string;
  dataType: HealthKitDataType;
  recordCount: number;
  syncTimestamp: string;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

// Step data
export interface StepData {
  date: string;
  count: number;
  source: string;
}

// Heart rate data
export interface HeartRateData {
  timestamp: string;
  value: number; // bpm
  context?: 'rest' | 'workout' | 'walking' | 'unknown';
  source: string;
}

// HRV data
export interface HRVData {
  timestamp: string;
  value: number; // SDNN in ms
  source: string;
}

// Sleep data
export interface SleepData {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  stages: SleepStage[];
  source: string;
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: string;
  endTime: string;
  duration: number; // minutes
}

// Workout data
export interface WorkoutData {
  id: string;
  type: WorkoutType;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  caloriesBurned: number;
  distance?: number; // meters
  averageHeartRate?: number;
  maxHeartRate?: number;
  source: string;
}

export type WorkoutType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'strength_training'
  | 'yoga'
  | 'hiit'
  | 'pilates'
  | 'elliptical'
  | 'rowing'
  | 'stair_climbing'
  | 'hiking'
  | 'other';

// Daily biometric snapshot (aggregated data)
export interface BiometricSnapshot {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  
  // Activity
  steps: number;
  activeCalories: number;
  basalCalories: number;
  totalCalories: number;
  exerciseMinutes: number;
  distanceMeters: number;
  flightsClimbed: number;
  
  // Sleep
  sleepHours: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  sleepDeepMinutes?: number;
  sleepRemMinutes?: number;
  
  // Heart
  restingHeartRate?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  hrv?: number; // SDNN average
  
  // Body
  weightKg?: number;
  bodyFatPercentage?: number;
  
  // Vitals
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  dataSources: string[];
}

// Weekly summary for trends
export interface WeeklyHealthSummary {
  weekStartDate: string;
  weekEndDate: string;
  
  averageSteps: number;
  totalActiveCalories: number;
  totalExerciseMinutes: number;
  workoutCount: number;
  
  averageSleepHours: number;
  averageSleepQuality: number; // 0-100
  
  averageRestingHeartRate?: number;
  averageHrv?: number;
  
  weightTrend: 'up' | 'down' | 'stable';
  weightChangeKg?: number;
}

// Sync result
export interface HealthKitSyncResult {
  success: boolean;
  dataTypes: HealthKitDataType[];
  recordsProcessed: number;
  errors: string[];
  syncedAt: string;
}
