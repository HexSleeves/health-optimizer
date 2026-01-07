import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Conversation, Message, LLMContext, StreamChunk } from '@/types/llm';
import { getFallbackChain } from '@/services/llm';
import { buildSystemPrompt, detectEmergency, getEmergencyResponse, sanitizeUserInput } from '@/services/llm/prompt-builder';
import { useHealthStore } from './health-store';
import { useSettingsStore } from './settings-store';

interface AssistantState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

interface AssistantActions {
  // Conversations
  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  archiveConversation: (id: string) => void;
  getCurrentConversation: () => Conversation | null;
  getCurrentMessages: () => Message[];

  // Messages
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  clearMessages: (conversationId: string) => void;

  // Streaming
  setStreaming: (streaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;

  // Errors
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset
  resetAssistant: () => void;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const initialState: AssistantState = {
  conversations: [],
  currentConversationId: null,
  messages: {},
  isStreaming: false,
  streamingContent: '',
  error: null,
};

export const useAssistantStore = create<AssistantState & AssistantActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Conversations
      createConversation: () => {
        const id = generateId();
        const settings = useSettingsStore.getState();
        
        const conversation: Conversation = {
          id,
          userId: 'current-user', // Would come from auth
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          messageCount: 0,
          llmProviderUsed: settings.llmProvider,
          modelUsed: settings.llmModel,
          isArchived: false,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
          messages: { ...state.messages, [id]: [] },
        }));

        return id;
      },

      selectConversation: (id) => set({ currentConversationId: id }),

      deleteConversation: (id) =>
        set((state) => {
          const { [id]: _, ...remainingMessages } = state.messages;
          return {
            conversations: state.conversations.filter((c) => c.id !== id),
            messages: remainingMessages,
            currentConversationId:
              state.currentConversationId === id ? null : state.currentConversationId,
          };
        }),

      archiveConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isArchived: true } : c
          ),
        })),

      getCurrentConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },

      getCurrentMessages: () => {
        const state = get();
        return state.currentConversationId
          ? state.messages[state.currentConversationId] || []
          : [];
      },

      // Messages
      sendMessage: async (content) => {
        const state = get();
        const settings = useSettingsStore.getState();
        const health = useHealthStore.getState();

        // Ensure we have a conversation
        let conversationId = state.currentConversationId;
        if (!conversationId) {
          conversationId = get().createConversation();
        }

        // Sanitize input
        const sanitizedContent = sanitizeUserInput(content);

        // Check for emergencies
        const emergency = detectEmergency(sanitizedContent);
        if (emergency.isEmergency) {
          const emergencyResponse = getEmergencyResponse(emergency.type || 'unknown');
          
          // Add user message
          const userMessage: Message = {
            id: generateId(),
            conversationId,
            role: 'user',
            content: sanitizedContent,
            timestamp: new Date().toISOString(),
            safetyFlags: [{
              type: emergency.type === 'mental_health' ? 'self_harm' : 'emergency',
              description: `Emergency keywords detected: ${emergency.keywords.join(', ')}`,
              triggered: true,
              action: 'warn',
            }],
          };
          get().addMessage(userMessage);

          // Add emergency response
          const assistantMessage: Message = {
            id: generateId(),
            conversationId,
            role: 'assistant',
            content: emergencyResponse,
            timestamp: new Date().toISOString(),
            safetyFlags: [],
            providerUsed: 'local',
          };
          get().addMessage(assistantMessage);
          return;
        }

        // Add user message
        const userMessage: Message = {
          id: generateId(),
          conversationId,
          role: 'user',
          content: sanitizedContent,
          timestamp: new Date().toISOString(),
          safetyFlags: [],
          contextSnapshot: {
            recentSteps: health.healthKitData[0]?.steps,
            recentSleep: health.healthKitData[0]?.sleepHours,
            activeConditions: health.conditions.map((c) => c.name),
          },
        };
        get().addMessage(userMessage);

        // Build context for LLM
        const currentMessages = get().messages[conversationId] || [];
        const context: LLMContext = {
          systemPrompt: '', // Will be built by provider
          safetyGuidelines: [
            'Do not provide specific medical diagnoses',
            'Recommend professional consultation for serious concerns',
            'Do not recommend specific prescription medications',
          ],
          healthProfile: health.profile || {
            id: '',
            userId: '',
            conditions: health.conditions,
            medications: health.medications,
            allergies: health.allergies,
            goals: health.goals,
            preferences: health.preferences || {
              dietaryRestrictions: [],
              fitnessLevel: 'moderate',
              mobilityLevel: 'full',
              preferredWorkoutDuration: 45,
              preferredWorkoutDays: 4,
              mealsPerDay: 3,
              sleepGoalHours: 8,
              avoidedFoods: [],
              favoredFoods: [],
            },
            baselineMetrics: health.baselineMetrics || {
              age: 30,
              sex: 'other',
              heightCm: 170,
              weightKg: 70,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          recentHealthKitData: health.healthKitData.slice(0, 7),
          currentPlans: {
            hasDietPlan: false, // Would check from plans store
            hasExercisePlan: false,
            hasSupplementPlan: false,
          },
          conversationHistory: currentMessages,
          maxHistoryMessages: 10,
          sessionStartTime: new Date().toISOString(),
          lastInteractionTime: new Date().toISOString(),
        };

        // Start streaming
        set({ isStreaming: true, streamingContent: '', error: null });

        try {
          const chain = getFallbackChain(settings.fallbackOrder);
          let fullContent = '';

          for await (const chunk of chain.streamComplete(sanitizedContent, context)) {
            if (chunk.type === 'content' && chunk.content) {
              fullContent += chunk.content;
              set({ streamingContent: fullContent });
            } else if (chunk.type === 'error') {
              set({ error: chunk.error, isStreaming: false });
              return;
            }
          }

          // Add assistant message
          const assistantMessage: Message = {
            id: generateId(),
            conversationId,
            role: 'assistant',
            content: fullContent,
            timestamp: new Date().toISOString(),
            safetyFlags: [],
            providerUsed: settings.llmProvider,
            modelUsed: settings.llmModel,
          };
          get().addMessage(assistantMessage);

          // Update conversation
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessageAt: new Date().toISOString(),
                    messageCount: c.messageCount + 2,
                    title:
                      c.messageCount === 0
                        ? sanitizedContent.slice(0, 50) + (sanitizedContent.length > 50 ? '...' : '')
                        : c.title,
                  }
                : c
            ),
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to get response' });
        } finally {
          set({ isStreaming: false, streamingContent: '' });
        }
      },

      addMessage: (message) =>
        set((state) => {
          const conversationId = message.conversationId;
          const existingMessages = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...existingMessages, message],
            },
          };
        }),

      clearMessages: (conversationId) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: [] },
        })),

      // Streaming
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      appendStreamingContent: (content) =>
        set((state) => ({ streamingContent: state.streamingContent + content })),
      clearStreamingContent: () => set({ streamingContent: '' }),

      // Errors
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset
      resetAssistant: () => set(initialState),
    }),
    {
      name: 'assistant-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations.slice(0, 50), // Keep last 50
        messages: Object.fromEntries(
          Object.entries(state.messages).slice(0, 50) // Keep messages for last 50 conversations
        ),
        currentConversationId: state.currentConversationId,
      }),
    }
  )
);
