import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LLMProviderType, LLMConfig } from '@/types/llm';
import { updateProviderConfig } from '@/services/llm';

interface SettingsState {
  // LLM Settings
  llmProvider: LLMProviderType;
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  openaiApiKey: string | null;
  geminiApiKey: string | null;
  localModelEnabled: boolean;
  localModelName: string;

  // Fallback settings
  fallbackEnabled: boolean;
  fallbackOrder: LLMProviderType[];

  // App Settings
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  healthKitBackgroundSync: boolean;
  analyticsEnabled: boolean;

  // Privacy
  shareDataWithLLM: boolean;
  storeConversations: boolean;
}

interface SettingsActions {
  // LLM Settings
  setLLMProvider: (provider: LLMProviderType) => void;
  setLLMModel: (model: string) => void;
  setLLMTemperature: (temperature: number) => void;
  setLLMMaxTokens: (maxTokens: number) => void;
  setOpenAIApiKey: (key: string | null) => void;
  setGeminiApiKey: (key: string | null) => void;
  setLocalModelEnabled: (enabled: boolean) => void;
  setLocalModelName: (name: string) => void;
  setFallbackEnabled: (enabled: boolean) => void;
  setFallbackOrder: (order: LLMProviderType[]) => void;

  // App Settings
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setHealthKitBackgroundSync: (enabled: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;

  // Privacy
  setShareDataWithLLM: (share: boolean) => void;
  setStoreConversations: (store: boolean) => void;

  // Utilities
  getLLMConfig: () => LLMConfig;
  resetSettings: () => void;
}

const initialState: SettingsState = {
  // LLM defaults
  llmProvider: process.env.EXPO_PUBLIC_GEMINI_API_KEY ? 'gemini' : 'openai',
  llmModel: process.env.EXPO_PUBLIC_GEMINI_API_KEY ? 'gemini-2.0-flash' : 'gpt-4o',
  llmTemperature: 0.7,
  llmMaxTokens: 2048,
  openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || null,
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || null,
  localModelEnabled: false,
  localModelName: 'llama-3-8b-health',
  fallbackEnabled: true,
  fallbackOrder: ['openai', 'gemini', 'local'],

  // App defaults
  theme: 'system',
  notificationsEnabled: true,
  healthKitBackgroundSync: true,
  analyticsEnabled: false,

  // Privacy defaults
  shareDataWithLLM: true,
  storeConversations: true,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // LLM Settings
      setLLMProvider: (provider) => {
        set({ llmProvider: provider });
        // Update the actual provider
        const state = get();
        const config = {
          provider,
          model: state.llmModel,
          apiKey:
            provider === 'openai'
              ? state.openaiApiKey || undefined
              : provider === 'gemini'
              ? state.geminiApiKey || undefined
              : undefined,
          temperature: state.llmTemperature,
          maxTokens: state.llmMaxTokens,
        };
        updateProviderConfig(provider, config);
      },

      setLLMModel: (model) => {
        set({ llmModel: model });
        const state = get();
        updateProviderConfig(state.llmProvider, { model });
      },

      setLLMTemperature: (temperature) => {
        set({ llmTemperature: temperature });
        const state = get();
        updateProviderConfig(state.llmProvider, { temperature });
      },

      setLLMMaxTokens: (maxTokens) => {
        set({ llmMaxTokens: maxTokens });
        const state = get();
        updateProviderConfig(state.llmProvider, { maxTokens });
      },

      setOpenAIApiKey: (key) => {
        set({ openaiApiKey: key });
        if (get().llmProvider === 'openai') {
          updateProviderConfig('openai', { apiKey: key || undefined });
        }
      },

      setGeminiApiKey: (key) => {
        set({ geminiApiKey: key });
        if (get().llmProvider === 'gemini') {
          updateProviderConfig('gemini', { apiKey: key || undefined });
        }
      },

      setLocalModelEnabled: (enabled) => set({ localModelEnabled: enabled }),
      setLocalModelName: (name) => set({ localModelName: name }),
      setFallbackEnabled: (enabled) => set({ fallbackEnabled: enabled }),
      setFallbackOrder: (order) => set({ fallbackOrder: order }),

      // App Settings
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setHealthKitBackgroundSync: (enabled) => set({ healthKitBackgroundSync: enabled }),
      setAnalyticsEnabled: (enabled) => set({ analyticsEnabled: enabled }),

      // Privacy
      setShareDataWithLLM: (share) => set({ shareDataWithLLM: share }),
      setStoreConversations: (store) => set({ storeConversations: store }),

      // Utilities
      getLLMConfig: () => {
        const state = get();
        return {
          provider: state.llmProvider,
          model: state.llmModel,
          apiKey:
            state.llmProvider === 'openai'
              ? state.openaiApiKey || undefined
              : state.llmProvider === 'gemini'
              ? state.geminiApiKey || undefined
              : undefined,
          temperature: state.llmTemperature,
          maxTokens: state.llmMaxTokens,
          localModelPath: state.localModelEnabled ? state.localModelName : undefined,
        };
      },

      resetSettings: () => set(initialState),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist API keys in plain storage - use secure store in real app
      partialize: (state) => ({
        llmProvider: state.llmProvider,
        llmModel: state.llmModel,
        llmTemperature: state.llmTemperature,
        llmMaxTokens: state.llmMaxTokens,
        localModelEnabled: state.localModelEnabled,
        localModelName: state.localModelName,
        fallbackEnabled: state.fallbackEnabled,
        fallbackOrder: state.fallbackOrder,
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        healthKitBackgroundSync: state.healthKitBackgroundSync,
        analyticsEnabled: state.analyticsEnabled,
        shareDataWithLLM: state.shareDataWithLLM,
        storeConversations: state.storeConversations,
      }),
    }
  )
);
