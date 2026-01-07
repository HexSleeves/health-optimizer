import { LLMContext, DEFAULT_SYSTEM_PROMPT_TEMPLATE } from '@/types/llm';
import { HealthProfile } from '@/types/health';
import { BiometricSnapshot } from '@/types/healthkit';

/**
 * Builds the system prompt with user context injected
 */
export function buildSystemPrompt(context: LLMContext): string {
  const template = DEFAULT_SYSTEM_PROMPT_TEMPLATE;

  let prompt = template.basePrompt;

  // Inject health profile if available
  if (context.healthProfile) {
    prompt += '\n\n' + buildHealthProfileSection(context.healthProfile);
  }

  // Inject recent HealthKit data if available
  if (context.recentHealthKitData && context.recentHealthKitData.length > 0) {
    prompt += '\n\n' + buildHealthKitSection(context.recentHealthKitData);
  }

  // Add current plans context
  if (context.currentPlans) {
    prompt += '\n\n' + buildPlansContext(context.currentPlans);
  }

  // Add safety boundaries
  prompt += '\n\n' + template.safetyBoundaries;

  // Add response guidelines
  prompt += '\n\n' + template.responseGuidelines;

  return prompt;
}

function buildHealthProfileSection(profile: HealthProfile): string {
  let section = '## User Health Profile\n';

  // Basic info
  if (profile.baselineMetrics) {
    const metrics = profile.baselineMetrics;
    section += '### Basic Information:\n';
    if (metrics.age) section += `- Age: ${metrics.age} years\n`;
    if (metrics.sex) section += `- Sex: ${metrics.sex}\n`;
    if (metrics.heightCm) section += `- Height: ${metrics.heightCm} cm\n`;
    if (metrics.weightKg) section += `- Weight: ${metrics.weightKg} kg\n`;
  }

  // Conditions
  if (profile.conditions && profile.conditions.length > 0) {
    section += '\n### Health Conditions:\n';
    for (const condition of profile.conditions) {
      section += `- ${condition.name} (${condition.severity} severity)`;
      if (condition.notes) section += `: ${condition.notes}`;
      if (condition.isManaged) section += ' [managed]';
      section += '\n';
    }
  }

  // Medications
  if (profile.medications && profile.medications.length > 0) {
    section += '\n### Current Medications:\n';
    for (const med of profile.medications) {
      section += `- ${med.name} ${med.dosage} - ${med.frequency}`;
      if (med.purpose) section += ` (for ${med.purpose})`;
      section += '\n';
    }
  }

  // Allergies
  if (profile.allergies && profile.allergies.length > 0) {
    section += '\n### Allergies:\n';
    for (const allergy of profile.allergies) {
      section += `- ${allergy.allergen} (${allergy.type}, ${allergy.severity})`;
      if (allergy.reactions && allergy.reactions.length > 0) {
        section += ` - reactions: ${allergy.reactions.join(', ')}`;
      }
      section += '\n';
    }
  }

  // Goals
  if (profile.goals && profile.goals.length > 0) {
    section += '\n### Health Goals:\n';
    const activeGoals = profile.goals.filter(g => g.isActive);
    for (const goal of activeGoals) {
      section += `- ${goal.title} (${goal.priority} priority)`;
      if (goal.description) section += `: ${goal.description}`;
      section += '\n';
    }
  }

  // Preferences
  if (profile.preferences) {
    const prefs = profile.preferences;
    section += '\n### Preferences:\n';
    if (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) {
      section += `- Dietary restrictions: ${prefs.dietaryRestrictions.join(', ')}\n`;
    }
    if (prefs.fitnessLevel) {
      section += `- Fitness level: ${prefs.fitnessLevel}\n`;
    }
    if (prefs.mobilityLevel) {
      section += `- Mobility level: ${prefs.mobilityLevel}\n`;
    }
    if (prefs.avoidedFoods && prefs.avoidedFoods.length > 0) {
      section += `- Foods to avoid: ${prefs.avoidedFoods.join(', ')}\n`;
    }
  }

  return section;
}

function buildHealthKitSection(snapshots: BiometricSnapshot[]): string {
  if (snapshots.length === 0) return '';

  // Calculate averages from recent data
  const avgSteps = Math.round(
    snapshots.reduce((sum, s) => sum + (s.steps || 0), 0) / snapshots.length
  );
  const avgSleep = (
    snapshots.reduce((sum, s) => sum + (s.sleepHours || 0), 0) / snapshots.length
  ).toFixed(1);
  const avgHR = Math.round(
    snapshots
      .filter(s => s.restingHeartRate)
      .reduce((sum, s) => sum + (s.restingHeartRate || 0), 0) /
    snapshots.filter(s => s.restingHeartRate).length || 0
  );
  const avgHRV = Math.round(
    snapshots
      .filter(s => s.hrv)
      .reduce((sum, s) => sum + (s.hrv || 0), 0) /
    snapshots.filter(s => s.hrv).length || 0
  );
  const totalExercise = snapshots.reduce((sum, s) => sum + (s.exerciseMinutes || 0), 0);

  let section = `## Recent Health Data (Last ${snapshots.length} Days)\n`;
  section += `- Average daily steps: ${avgSteps.toLocaleString()}\n`;
  section += `- Average sleep: ${avgSleep} hours\n`;
  if (avgHR > 0) section += `- Average resting heart rate: ${avgHR} bpm\n`;
  if (avgHRV > 0) section += `- Average HRV: ${avgHRV} ms\n`;
  section += `- Total exercise time: ${totalExercise} minutes\n`;

  // Recent trends
  if (snapshots.length >= 3) {
    const recentSteps = snapshots.slice(-3).map(s => s.steps || 0);
    const stepTrend = recentSteps[2] > recentSteps[0] ? 'increasing' :
                      recentSteps[2] < recentSteps[0] ? 'decreasing' : 'stable';
    section += `\n### Recent Trends:\n`;
    section += `- Activity trend: ${stepTrend}\n`;
  }

  return section;
}

function buildPlansContext(plans: { hasDietPlan: boolean; hasExercisePlan: boolean; hasSupplementPlan: boolean }): string {
  let section = '## Current Plans Status:\n';
  section += `- Diet Plan: ${plans.hasDietPlan ? 'Active' : 'Not set up'}\n`;
  section += `- Exercise Plan: ${plans.hasExercisePlan ? 'Active' : 'Not set up'}\n`;
  section += `- Supplement Plan: ${plans.hasSupplementPlan ? 'Active' : 'Not set up'}\n`;

  if (!plans.hasDietPlan || !plans.hasExercisePlan) {
    section += '\nNote: The user may benefit from setting up missing plans. You can suggest they visit the Plans tab.';
  }

  return section;
}

/**
 * Sanitize user input before sending to LLM
 */
export function sanitizeUserInput(input: string): string {
  // Remove potential injection attempts
  let sanitized = input;

  // Remove system prompt override attempts
  sanitized = sanitized.replace(/system:/gi, '');
  sanitized = sanitized.replace(/\[system\]/gi, '');
  sanitized = sanitized.replace(/###.*instruction/gi, '');

  // Limit length
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 4000) + '...';
  }

  return sanitized.trim();
}

/**
 * Check for emergency keywords that require immediate response
 */
export function detectEmergency(input: string): {
  isEmergency: boolean;
  type?: 'medical' | 'mental_health' | 'unknown';
  keywords: string[];
} {
  const lowercaseInput = input.toLowerCase();

  const medicalEmergencyKeywords = [
    'heart attack', 'can\'t breathe', 'difficulty breathing',
    'chest pain', 'stroke', 'severe bleeding', 'unconscious',
    'seizure', 'overdose', 'anaphylaxis', 'choking'
  ];

  const mentalHealthKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'self harm', 'hurt myself', 'cutting myself'
  ];

  const foundMedical = medicalEmergencyKeywords.filter(k => lowercaseInput.includes(k));
  const foundMental = mentalHealthKeywords.filter(k => lowercaseInput.includes(k));

  if (foundMental.length > 0) {
    return {
      isEmergency: true,
      type: 'mental_health',
      keywords: foundMental,
    };
  }

  if (foundMedical.length > 0) {
    return {
      isEmergency: true,
      type: 'medical',
      keywords: foundMedical,
    };
  }

  return { isEmergency: false, keywords: [] };
}

/**
 * Get emergency response message
 */
export function getEmergencyResponse(type: 'medical' | 'mental_health' | 'unknown'): string {
  if (type === 'mental_health') {
    return `⚠️ **I'm concerned about what you've shared.**

If you're having thoughts of suicide or self-harm, please reach out for help:

📞 **National Suicide Prevention Lifeline**: 988 (US)
📞 **Crisis Text Line**: Text HOME to 741741
📞 **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

You don't have to face this alone. These services are free, confidential, and available 24/7.

I'm an AI and cannot provide crisis support, but trained counselors are ready to help you right now.`;
  }

  if (type === 'medical') {
    return `⚠️ **This sounds like a medical emergency.**

**Please call emergency services immediately:**
📞 **US**: 911
📞 **UK**: 999
📞 **EU**: 112

If someone is with you, ask them to help while you wait for emergency services.

I'm an AI assistant and cannot provide emergency medical care. Please seek immediate professional help.`;
  }

  return `⚠️ If this is an emergency, please call your local emergency services immediately.

I'm an AI assistant and cannot provide emergency assistance.`;
}
