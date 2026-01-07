import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  appleUserId?: string;
  avatarUrl?: string;
  timezone?: string;
  createdAt: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedIntake: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setIntakeCompleted: (completed: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCompletedOnboarding: false,
      hasCompletedIntake: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          hasCompletedIntake: false,
          error: null,
        }),

      setOnboardingCompleted: (completed) =>
        set({ hasCompletedOnboarding: completed }),

      setIntakeCompleted: (completed) =>
        set({ hasCompletedIntake: completed }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasCompletedIntake: state.hasCompletedIntake,
      }),
    }
  )
);
