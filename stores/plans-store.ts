import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DietPlan,
  ExercisePlan,
  SupplementPlan,
  LifestylePlan,
} from '@/types/recommendations';

interface PlansState {
  // Active plans
  dietPlan: DietPlan | null;
  exercisePlan: ExercisePlan | null;
  supplementPlan: SupplementPlan | null;
  lifestylePlan: LifestylePlan | null;

  // Plan history
  dietPlanHistory: DietPlan[];
  exercisePlanHistory: ExercisePlan[];
  supplementPlanHistory: SupplementPlan[];
  lifestylePlanHistory: LifestylePlan[];

  // Generation state
  isGenerating: boolean;
  generatingType: 'diet' | 'exercise' | 'supplement' | 'lifestyle' | 'all' | null;
  generationProgress: number;
  generationError: string | null;

  // Last generated timestamps
  lastDietPlanAt: string | null;
  lastExercisePlanAt: string | null;
  lastSupplementPlanAt: string | null;
  lastLifestylePlanAt: string | null;
}

interface PlansActions {
  // Diet Plan
  setDietPlan: (plan: DietPlan | null) => void;
  updateDietPlan: (updates: Partial<DietPlan>) => void;

  // Exercise Plan
  setExercisePlan: (plan: ExercisePlan | null) => void;
  updateExercisePlan: (updates: Partial<ExercisePlan>) => void;

  // Supplement Plan
  setSupplementPlan: (plan: SupplementPlan | null) => void;
  updateSupplementPlan: (updates: Partial<SupplementPlan>) => void;

  // Lifestyle Plan
  setLifestylePlan: (plan: LifestylePlan | null) => void;
  updateLifestylePlan: (updates: Partial<LifestylePlan>) => void;

  // Generation
  generateAllPlans: () => Promise<void>;
  generateDietPlan: () => Promise<void>;
  generateExercisePlan: () => Promise<void>;
  generateSupplementPlan: () => Promise<void>;
  generateLifestylePlan: () => Promise<void>;
  setGenerationProgress: (progress: number) => void;
  setGenerationError: (error: string | null) => void;

  // Utilities
  hasActivePlan: (type: 'diet' | 'exercise' | 'supplement' | 'lifestyle') => boolean;
  getActivePlansCount: () => number;
  resetPlans: () => void;
}

const initialState: PlansState = {
  dietPlan: null,
  exercisePlan: null,
  supplementPlan: null,
  lifestylePlan: null,
  dietPlanHistory: [],
  exercisePlanHistory: [],
  supplementPlanHistory: [],
  lifestylePlanHistory: [],
  isGenerating: false,
  generatingType: null,
  generationProgress: 0,
  generationError: null,
  lastDietPlanAt: null,
  lastExercisePlanAt: null,
  lastSupplementPlanAt: null,
  lastLifestylePlanAt: null,
};

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const usePlansStore = create<PlansState & PlansActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Diet Plan
      setDietPlan: (plan) => {
        const current = get().dietPlan;
        if (current) {
          set((state) => ({
            dietPlanHistory: [current, ...state.dietPlanHistory.slice(0, 4)],
          }));
        }
        set({ dietPlan: plan, lastDietPlanAt: plan ? new Date().toISOString() : null });
      },
      updateDietPlan: (updates) =>
        set((state) => ({
          dietPlan: state.dietPlan ? { ...state.dietPlan, ...updates } : null,
        })),

      // Exercise Plan
      setExercisePlan: (plan) => {
        const current = get().exercisePlan;
        if (current) {
          set((state) => ({
            exercisePlanHistory: [current, ...state.exercisePlanHistory.slice(0, 4)],
          }));
        }
        set({ exercisePlan: plan, lastExercisePlanAt: plan ? new Date().toISOString() : null });
      },
      updateExercisePlan: (updates) =>
        set((state) => ({
          exercisePlan: state.exercisePlan ? { ...state.exercisePlan, ...updates } : null,
        })),

      // Supplement Plan
      setSupplementPlan: (plan) => {
        const current = get().supplementPlan;
        if (current) {
          set((state) => ({
            supplementPlanHistory: [current, ...state.supplementPlanHistory.slice(0, 4)],
          }));
        }
        set({ supplementPlan: plan, lastSupplementPlanAt: plan ? new Date().toISOString() : null });
      },
      updateSupplementPlan: (updates) =>
        set((state) => ({
          supplementPlan: state.supplementPlan ? { ...state.supplementPlan, ...updates } : null,
        })),

      // Lifestyle Plan
      setLifestylePlan: (plan) => {
        const current = get().lifestylePlan;
        if (current) {
          set((state) => ({
            lifestylePlanHistory: [current, ...state.lifestylePlanHistory.slice(0, 4)],
          }));
        }
        set({ lifestylePlan: plan, lastLifestylePlanAt: plan ? new Date().toISOString() : null });
      },
      updateLifestylePlan: (updates) =>
        set((state) => ({
          lifestylePlan: state.lifestylePlan ? { ...state.lifestylePlan, ...updates } : null,
        })),

      // Generation
      generateAllPlans: async () => {
        set({ isGenerating: true, generatingType: 'all', generationProgress: 0, generationError: null });
        try {
          // Generate each plan sequentially
          set({ generationProgress: 10 });
          await get().generateDietPlan();
          
          set({ generationProgress: 35 });
          await get().generateExercisePlan();
          
          set({ generationProgress: 60 });
          await get().generateSupplementPlan();
          
          set({ generationProgress: 85 });
          await get().generateLifestylePlan();
          
          set({ generationProgress: 100 });
        } catch (error: any) {
          set({ generationError: error.message || 'Failed to generate plans' });
        } finally {
          set({ isGenerating: false, generatingType: null });
        }
      },

      generateDietPlan: async () => {
        if (get().isGenerating && get().generatingType !== 'all') {
          set({ isGenerating: true, generatingType: 'diet', generationProgress: 0, generationError: null });
        }

        // Mock diet plan generation
        // In real implementation, this would call the LLM or recommendation engine
        const mockPlan: DietPlan = {
          id: generateId(),
          userId: 'current-user',
          name: 'Personalized Nutrition Plan',
          description: 'A balanced nutrition plan tailored to your health goals',
          dailyCalories: 2000,
          macroRatios: { protein: 30, carbohydrates: 40, fat: 30 },
          fiberGoalG: 30,
          waterGoalMl: 2500,
          restrictions: [],
          avoidedFoods: [],
          allergens: [],
          weeklyPlan: [],
          alternativeMeals: [],
          conditionAdjustments: [],
          generatedAt: new Date().toISOString(),
          generatedBy: 'openai',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        };

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        set({ dietPlan: mockPlan, lastDietPlanAt: new Date().toISOString() });

        if (get().generatingType === 'diet') {
          set({ isGenerating: false, generatingType: null, generationProgress: 100 });
        }
      },

      generateExercisePlan: async () => {
        if (get().isGenerating && get().generatingType !== 'all') {
          set({ isGenerating: true, generatingType: 'exercise', generationProgress: 0, generationError: null });
        }

        const mockPlan: ExercisePlan = {
          id: generateId(),
          userId: 'current-user',
          name: 'Personalized Workout Plan',
          description: 'A progressive workout plan designed for your fitness level',
          weeklySchedule: [],
          daysPerWeek: 4,
          sessionDurationMinutes: 45,
          intensityLevel: 'moderate',
          fitnessGoal: 'general_fitness',
          progressionModel: {
            type: 'linear',
            incrementPerWeek: 2.5,
            deloadWeek: 4,
          },
          conditionModifications: [],
          generatedAt: new Date().toISOString(),
          generatedBy: 'openai',
          currentWeek: 1,
          isActive: true,
        };

        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({ exercisePlan: mockPlan, lastExercisePlanAt: new Date().toISOString() });

        if (get().generatingType === 'exercise') {
          set({ isGenerating: false, generatingType: null, generationProgress: 100 });
        }
      },

      generateSupplementPlan: async () => {
        if (get().isGenerating && get().generatingType !== 'all') {
          set({ isGenerating: true, generatingType: 'supplement', generationProgress: 0, generationError: null });
        }

        const mockPlan: SupplementPlan = {
          id: generateId(),
          userId: 'current-user',
          name: 'Personalized Supplement Stack',
          description: 'Evidence-based supplements for your health goals',
          supplements: [],
          dailySchedule: [],
          interactionWarnings: [],
          estimatedMonthlyCost: 5000, // $50 in cents
          generatedAt: new Date().toISOString(),
          generatedBy: 'openai',
          reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        };

        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({ supplementPlan: mockPlan, lastSupplementPlanAt: new Date().toISOString() });

        if (get().generatingType === 'supplement') {
          set({ isGenerating: false, generatingType: null, generationProgress: 100 });
        }
      },

      generateLifestylePlan: async () => {
        if (get().isGenerating && get().generatingType !== 'all') {
          set({ isGenerating: true, generatingType: 'lifestyle', generationProgress: 0, generationError: null });
        }

        const mockPlan: LifestylePlan = {
          id: generateId(),
          userId: 'current-user',
          name: 'Lifestyle Optimization Plan',
          description: 'Daily habits and routines for optimal health',
          sleep: {
            targetHours: 8,
            bedtimeWindow: { start: '22:00', end: '23:00' },
            wakeTimeWindow: { start: '06:00', end: '07:00' },
            preBedroutine: ['Dim lights 1 hour before bed', 'No screens 30 minutes before sleep', 'Light stretching'],
            environmentTips: ['Keep room temperature at 65-68°F', 'Use blackout curtains', 'Consider white noise'],
            thingsToAvoid: ['Caffeine after 2pm', 'Large meals before bed', 'Intense exercise late evening'],
            conditionSpecific: [],
          },
          stressManagement: [],
          hydration: {
            dailyGoalMl: 2500,
            adjustmentFactors: [],
            timing: ['Start day with a glass of water', 'Drink before each meal', 'Keep water bottle visible'],
            tips: ['Set hourly reminders', 'Track intake in app'],
          },
          environment: [],
          morningRoutine: ['Hydrate', 'Light movement', 'Healthy breakfast'],
          eveningRoutine: ['Wind down activities', 'Prepare for next day', 'Sleep hygiene routine'],
          dailyTargets: [],
          generatedAt: new Date().toISOString(),
          generatedBy: 'openai',
          isActive: true,
        };

        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({ lifestylePlan: mockPlan, lastLifestylePlanAt: new Date().toISOString() });

        if (get().generatingType === 'lifestyle') {
          set({ isGenerating: false, generatingType: null, generationProgress: 100 });
        }
      },

      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      setGenerationError: (error) => set({ generationError: error }),

      // Utilities
      hasActivePlan: (type) => {
        const state = get();
        switch (type) {
          case 'diet': return !!state.dietPlan?.isActive;
          case 'exercise': return !!state.exercisePlan?.isActive;
          case 'supplement': return !!state.supplementPlan?.isActive;
          case 'lifestyle': return !!state.lifestylePlan?.isActive;
          default: return false;
        }
      },

      getActivePlansCount: () => {
        const state = get();
        return [
          state.dietPlan?.isActive,
          state.exercisePlan?.isActive,
          state.supplementPlan?.isActive,
          state.lifestylePlan?.isActive,
        ].filter(Boolean).length;
      },

      resetPlans: () => set(initialState),
    }),
    {
      name: 'plans-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dietPlan: state.dietPlan,
        exercisePlan: state.exercisePlan,
        supplementPlan: state.supplementPlan,
        lifestylePlan: state.lifestylePlan,
        lastDietPlanAt: state.lastDietPlanAt,
        lastExercisePlanAt: state.lastExercisePlanAt,
        lastSupplementPlanAt: state.lastSupplementPlanAt,
        lastLifestylePlanAt: state.lastLifestylePlanAt,
      }),
    }
  )
);
