/**
 * Local LLM Provider
 * 
 * This provider is designed for on-device inference using Core ML or MLX.
 * In a real implementation, this would use:
 * - react-native-coreml for iOS Core ML inference
 * - A custom native module for MLX inference
 * 
 * For now, this provides a mock implementation with rule-based fallback.
 */

import {
  LLMProvider,
  LLMConfig,
  LLMContext,
  LLMModelInfo,
  StreamChunk,
  LLMError,
  LOCAL_MODELS,
} from '@/types/llm';
import { buildSystemPrompt } from './prompt-builder';

export class LocalProvider implements LLMProvider {
  type = 'local' as const;
  name = 'Local Model';
  config: LLMConfig;
  private isModelLoaded: boolean = false;
  private modelLoadError: string | null = null;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = {
      provider: 'local',
      model: config.model || 'llama-3-8b-health',
      localModelPath: config.localModelPath,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1024,
    };
  }

  setConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    // If model path changed, we need to reload
    if (config.localModelPath) {
      this.isModelLoaded = false;
    }
  }

  getAvailableModels(): LLMModelInfo[] {
    return LOCAL_MODELS;
  }

  async isAvailable(): Promise<boolean> {
    // In a real implementation, check if Core ML model is available
    // For now, return false to indicate local models aren't implemented
    return false;
  }

  async healthCheck(): Promise<{ available: boolean; latencyMs?: number; error?: string; modelLoaded?: boolean }> {
    const startTime = Date.now();
    
    // Check if we're on iOS (local models only work on device)
    // In a real implementation, this would check Platform.OS
    const isIOS = false; // Platform.OS === 'ios'
    
    if (!isIOS) {
      return {
        available: false,
        error: 'Local models are only available on iOS devices',
        modelLoaded: false,
      };
    }

    // Check if model file exists and can be loaded
    if (this.modelLoadError) {
      return {
        available: false,
        error: this.modelLoadError,
        modelLoaded: false,
      };
    }

    return {
      available: this.isModelLoaded,
      latencyMs: Date.now() - startTime,
      modelLoaded: this.isModelLoaded,
    };
  }

  async loadModel(): Promise<void> {
    /**
     * In a real implementation, this would:
     * 1. Check if model exists at localModelPath
     * 2. Load the Core ML model into memory
     * 3. Warm up the model with a test inference
     * 
     * Example with react-native-coreml:
     * const model = await CoreML.loadModel(this.config.localModelPath);
     * await model.predict({ input: 'warmup' });
     */
    
    throw new LLMError(
      'Local model loading not implemented. Please use OpenAI or Gemini.',
      'LOCAL_MODEL_NOT_LOADED',
      'local',
      false
    );
  }

  async unloadModel(): Promise<void> {
    /**
     * Free memory by unloading the model
     */
    this.isModelLoaded = false;
  }

  async complete(prompt: string, context: LLMContext): Promise<string> {
    if (!this.isModelLoaded) {
      // Fall back to rule-based responses
      return this.getRuleBasedResponse(prompt, context);
    }

    /**
     * In a real implementation:
     * const result = await this.model.predict({
     *   prompt: this.buildPrompt(systemPrompt, prompt, context),
     *   temperature: this.config.temperature,
     *   maxTokens: this.config.maxTokens,
     * });
     * return result.text;
     */

    return this.getRuleBasedResponse(prompt, context);
  }

  async *streamComplete(
    prompt: string,
    context: LLMContext
  ): AsyncIterable<StreamChunk> {
    // Local models may not support streaming, so we fake it
    const response = await this.complete(prompt, context);
    
    // Simulate streaming by yielding words
    const words = response.split(' ');
    for (const word of words) {
      yield { type: 'content', content: word + ' ' };
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    yield { type: 'done', finishReason: 'stop' };
  }

  /**
   * Rule-based fallback responses when LLM is not available
   */
  private getRuleBasedResponse(prompt: string, context: LLMContext): string {
    const lowercasePrompt = prompt.toLowerCase();
    const profile = context.healthProfile;
    
    // Emergency detection
    if (this.containsEmergencyKeywords(lowercasePrompt)) {
      return `⚠️ If you're experiencing an emergency, please call emergency services (911 in the US) immediately.

I'm an AI assistant and cannot provide emergency medical care. If you're having:
- Chest pain or difficulty breathing
- Signs of a stroke
- Severe bleeding
- Thoughts of self-harm

Please seek immediate medical attention.`;
    }

    // Diet-related questions
    if (this.containsDietKeywords(lowercasePrompt)) {
      let response = `Based on your health profile, here are some general dietary guidelines:\n\n`;
      
      if (profile?.conditions?.length) {
        response += `Given your health conditions, you should:\n`;
        response += `- Consult with a registered dietitian for personalized advice\n`;
        response += `- Focus on whole, unprocessed foods\n`;
        response += `- Stay hydrated throughout the day\n`;
      }
      
      if (profile?.preferences?.dietaryRestrictions?.length) {
        response += `\nRespecting your dietary restrictions (${profile.preferences.dietaryRestrictions.join(', ')}), consider:\n`;
        response += `- Planning meals ahead to ensure nutritional completeness\n`;
        response += `- Reading labels carefully\n`;
      }
      
      response += `\nℹ️ Note: I'm providing general guidance. For personalized meal plans, please use the Plans tab or consult a healthcare provider.`;
      return response;
    }

    // Exercise-related questions
    if (this.containsExerciseKeywords(lowercasePrompt)) {
      let response = `Here are some exercise considerations for you:\n\n`;
      
      const fitnessLevel = profile?.preferences?.fitnessLevel || 'moderate';
      response += `Based on your fitness level (${fitnessLevel}):\n`;
      response += `- Start with exercises appropriate for your current level\n`;
      response += `- Include both cardio and strength training\n`;
      response += `- Allow adequate rest between sessions\n`;
      
      if (profile?.conditions?.length) {
        response += `\n⚠️ Given your health conditions, please:\n`;
        response += `- Consult your doctor before starting new exercises\n`;
        response += `- Listen to your body and stop if you feel pain\n`;
      }
      
      response += `\nCheck the Plans tab for a personalized exercise program.`;
      return response;
    }

    // Supplement-related questions
    if (this.containsSupplementKeywords(lowercasePrompt)) {
      let response = `Regarding supplements:\n\n`;
      response += `⚠️ Important: Always consult your healthcare provider before starting any supplement, especially if you're taking medications.\n\n`;
      
      if (profile?.medications?.length) {
        response += `Since you're taking medications, supplement interactions are a real concern. Please:\n`;
        response += `- Discuss any supplements with your doctor or pharmacist\n`;
        response += `- Start with one supplement at a time\n`;
        response += `- Monitor for any adverse effects\n`;
      }
      
      response += `\nThe Supplements section in Plans can help identify evidence-based options for your goals.`;
      return response;
    }

    // Default response
    return `I'm your Health Optimizer assistant. I can help with questions about:

🍽️ **Diet & Nutrition** - Meal planning, dietary restrictions, nutrition goals
🏋️ **Exercise** - Workout recommendations, activity modifications, fitness goals
💊 **Supplements** - Evidence-based recommendations, interaction checking
🌙 **Lifestyle** - Sleep, stress management, daily routines

I'm currently operating in offline mode with limited capabilities. For full AI-powered responses, please configure an LLM provider in Settings.

How can I help you today?`;
  }

  private containsEmergencyKeywords(text: string): boolean {
    const emergencyKeywords = [
      'emergency', 'call 911', 'heart attack', 'stroke', 'can\'t breathe',
      'severe pain', 'suicide', 'kill myself', 'end my life', 'overdose',
      'bleeding heavily', 'unconscious', 'seizure'
    ];
    return emergencyKeywords.some(keyword => text.includes(keyword));
  }

  private containsDietKeywords(text: string): boolean {
    const dietKeywords = [
      'diet', 'food', 'eat', 'meal', 'nutrition', 'calories', 'protein',
      'carbs', 'fat', 'recipe', 'breakfast', 'lunch', 'dinner', 'snack'
    ];
    return dietKeywords.some(keyword => text.includes(keyword));
  }

  private containsExerciseKeywords(text: string): boolean {
    const exerciseKeywords = [
      'exercise', 'workout', 'fitness', 'training', 'cardio', 'strength',
      'run', 'walk', 'gym', 'muscle', 'weight', 'activity'
    ];
    return exerciseKeywords.some(keyword => text.includes(keyword));
  }

  private containsSupplementKeywords(text: string): boolean {
    const supplementKeywords = [
      'supplement', 'vitamin', 'mineral', 'probiotic', 'omega', 'protein powder',
      'creatine', 'magnesium', 'zinc', 'iron', 'd3', 'b12'
    ];
    return supplementKeywords.some(keyword => text.includes(keyword));
  }
}
