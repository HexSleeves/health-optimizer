import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HealthProfile,
  HealthCondition,
  Medication,
  Allergy,
  HealthGoal,
  HealthPreferences,
  BaselineMetrics,
} from '@/types/health';
import { BiometricSnapshot, HealthKitSyncResult } from '@/types/healthkit';
import { healthKitService } from '@/services/healthkit';

interface HealthState {
  // Profile data
  profile: HealthProfile | null;
  conditions: HealthCondition[];
  medications: Medication[];
  allergies: Allergy[];
  goals: HealthGoal[];
  preferences: HealthPreferences | null;
  baselineMetrics: BaselineMetrics | null;

  // HealthKit data
  healthKitAuthorized: boolean;
  healthKitData: BiometricSnapshot[];
  lastSyncAt: string | null;
  isSyncing: boolean;
  syncError: string | null;

  // Intake flow state
  intakeStep: number;
  intakeData: Partial<{
    conditions: HealthCondition[];
    medications: Medication[];
    allergies: Allergy[];
    goals: HealthGoal[];
    preferences: HealthPreferences;
    baselineMetrics: BaselineMetrics;
  }>;
}

interface HealthActions {
  // Profile actions
  setProfile: (profile: HealthProfile) => void;
  updateProfile: (updates: Partial<HealthProfile>) => void;

  // Conditions
  addCondition: (condition: HealthCondition) => void;
  updateCondition: (id: string, updates: Partial<HealthCondition>) => void;
  removeCondition: (id: string) => void;
  setConditions: (conditions: HealthCondition[]) => void;

  // Medications
  addMedication: (medication: Medication) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  setMedications: (medications: Medication[]) => void;

  // Allergies
  addAllergy: (allergy: Allergy) => void;
  removeAllergy: (id: string) => void;
  setAllergies: (allergies: Allergy[]) => void;

  // Goals
  addGoal: (goal: HealthGoal) => void;
  updateGoal: (id: string, updates: Partial<HealthGoal>) => void;
  removeGoal: (id: string) => void;
  setGoals: (goals: HealthGoal[]) => void;

  // Preferences
  setPreferences: (preferences: HealthPreferences) => void;
  updatePreferences: (updates: Partial<HealthPreferences>) => void;

  // Baseline Metrics
  setBaselineMetrics: (metrics: BaselineMetrics) => void;
  updateBaselineMetrics: (updates: Partial<BaselineMetrics>) => void;

  // HealthKit
  requestHealthKitPermissions: () => Promise<boolean>;
  syncHealthKit: () => Promise<HealthKitSyncResult>;
  setHealthKitData: (data: BiometricSnapshot[]) => void;

  // Intake flow
  setIntakeStep: (step: number) => void;
  updateIntakeData: (data: Partial<HealthState['intakeData']>) => void;
  completeIntake: () => void;
  resetIntake: () => void;

  // Reset
  resetHealthData: () => void;
}

const initialState: HealthState = {
  profile: null,
  conditions: [],
  medications: [],
  allergies: [],
  goals: [],
  preferences: null,
  baselineMetrics: null,
  healthKitAuthorized: false,
  healthKitData: [],
  lastSyncAt: null,
  isSyncing: false,
  syncError: null,
  intakeStep: 0,
  intakeData: {},
};

export const useHealthStore = create<HealthState & HealthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Profile actions
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      // Conditions
      addCondition: (condition) =>
        set((state) => ({ conditions: [...state.conditions, condition] })),
      updateCondition: (id, updates) =>
        set((state) => ({
          conditions: state.conditions.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeCondition: (id) =>
        set((state) => ({
          conditions: state.conditions.filter((c) => c.id !== id),
        })),
      setConditions: (conditions) => set({ conditions }),

      // Medications
      addMedication: (medication) =>
        set((state) => ({ medications: [...state.medications, medication] })),
      updateMedication: (id, updates) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        })),
      setMedications: (medications) => set({ medications }),

      // Allergies
      addAllergy: (allergy) =>
        set((state) => ({ allergies: [...state.allergies, allergy] })),
      removeAllergy: (id) =>
        set((state) => ({
          allergies: state.allergies.filter((a) => a.id !== id),
        })),
      setAllergies: (allergies) => set({ allergies }),

      // Goals
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      removeGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
      setGoals: (goals) => set({ goals }),

      // Preferences
      setPreferences: (preferences) => set({ preferences }),
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, ...updates }
            : null,
        })),

      // Baseline Metrics
      setBaselineMetrics: (metrics) => set({ baselineMetrics: metrics }),
      updateBaselineMetrics: (updates) =>
        set((state) => ({
          baselineMetrics: state.baselineMetrics
            ? { ...state.baselineMetrics, ...updates }
            : null,
        })),

      // HealthKit
      requestHealthKitPermissions: async () => {
        try {
          const permissions = await healthKitService.requestPermissions();
          const authorized = permissions.some((p) => p.status === 'authorized');
          set({ healthKitAuthorized: authorized });
          return authorized;
        } catch (error) {
          console.error('Failed to request HealthKit permissions:', error);
          return false;
        }
      },

      syncHealthKit: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const snapshots = await healthKitService.fetchSnapshots(7);
          set({
            healthKitData: snapshots,
            lastSyncAt: new Date().toISOString(),
            isSyncing: false,
          });
          return {
            success: true,
            dataTypes: [],
            recordsProcessed: snapshots.length,
            errors: [],
            syncedAt: new Date().toISOString(),
          };
        } catch (error: any) {
          const errorMessage = error.message || 'Sync failed';
          set({ isSyncing: false, syncError: errorMessage });
          return {
            success: false,
            dataTypes: [],
            recordsProcessed: 0,
            errors: [errorMessage],
            syncedAt: new Date().toISOString(),
          };
        }
      },

      setHealthKitData: (data) => set({ healthKitData: data }),

      // Intake flow
      setIntakeStep: (step) => set({ intakeStep: step }),
      updateIntakeData: (data) =>
        set((state) => ({
          intakeData: { ...state.intakeData, ...data },
        })),
      completeIntake: () => {
        const { intakeData } = get();
        set({
          conditions: intakeData.conditions || [],
          medications: intakeData.medications || [],
          allergies: intakeData.allergies || [],
          goals: intakeData.goals || [],
          preferences: intakeData.preferences || null,
          baselineMetrics: intakeData.baselineMetrics || null,
          intakeStep: 0,
          intakeData: {},
        });
      },
      resetIntake: () =>
        set({
          intakeStep: 0,
          intakeData: {},
        }),

      // Reset
      resetHealthData: () => set(initialState),
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conditions: state.conditions,
        medications: state.medications,
        allergies: state.allergies,
        goals: state.goals,
        preferences: state.preferences,
        baselineMetrics: state.baselineMetrics,
        healthKitAuthorized: state.healthKitAuthorized,
        healthKitData: state.healthKitData,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);
