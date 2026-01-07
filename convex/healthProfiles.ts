import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create or update health profile
export const upsertHealthProfile = mutation({
  args: {
    userId: v.id('users'),
    age: v.optional(v.number()),
    sex: v.optional(v.union(v.literal('male'), v.literal('female'), v.literal('other'))),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    fitnessLevel: v.optional(v.string()),
    mobilityLevel: v.optional(v.string()),
    dietaryRestrictions: v.array(v.string()),
    avoidedFoods: v.array(v.string()),
    preferredWorkoutDuration: v.optional(v.number()),
    preferredWorkoutDays: v.optional(v.number()),
    sleepGoalHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('healthProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const now = Date.now();
    const { userId, ...profileData } = args;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...profileData,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('healthProfiles', {
      userId,
      ...profileData,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get health profile
export const getHealthProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('healthProfiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
  },
});

// Add health condition
export const addCondition = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    category: v.string(),
    severity: v.union(
      v.literal('mild'),
      v.literal('moderate'),
      v.literal('severe'),
      v.literal('critical')
    ),
    diagnosedDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    isManaged: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('healthConditions', {
      userId: args.userId,
      name: args.name,
      category: args.category as any,
      severity: args.severity,
      diagnosedDate: args.diagnosedDate,
      notes: args.notes,
      isManaged: args.isManaged,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get conditions for user
export const getConditions = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('healthConditions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Delete condition
export const deleteCondition = mutation({
  args: { conditionId: v.id('healthConditions') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.conditionId);
  },
});

// Add medication
export const addMedication = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    genericName: v.optional(v.string()),
    dosage: v.string(),
    frequency: v.string(),
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('medications', {
      userId: args.userId,
      name: args.name,
      genericName: args.genericName,
      dosage: args.dosage,
      frequency: args.frequency,
      purpose: args.purpose,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get medications for user
export const getMedications = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('medications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Delete medication
export const deleteMedication = mutation({
  args: { medicationId: v.id('medications') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.medicationId);
  },
});

// Add allergy
export const addAllergy = mutation({
  args: {
    userId: v.id('users'),
    allergen: v.string(),
    type: v.union(
      v.literal('food'),
      v.literal('drug'),
      v.literal('environmental'),
      v.literal('other')
    ),
    severity: v.union(
      v.literal('mild'),
      v.literal('moderate'),
      v.literal('severe'),
      v.literal('anaphylactic')
    ),
    reactions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('allergies', {
      userId: args.userId,
      allergen: args.allergen,
      type: args.type,
      severity: args.severity,
      reactions: args.reactions,
      createdAt: Date.now(),
    });
  },
});

// Get allergies for user
export const getAllergies = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('allergies')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Delete allergy
export const deleteAllergy = mutation({
  args: { allergyId: v.id('allergies') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.allergyId);
  },
});

// Add health goal
export const addGoal = mutation({
  args: {
    userId: v.id('users'),
    category: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    targetUnit: v.optional(v.string()),
    deadline: v.optional(v.string()),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('healthGoals', {
      userId: args.userId,
      category: args.category,
      title: args.title,
      description: args.description,
      targetValue: args.targetValue,
      targetUnit: args.targetUnit,
      deadline: args.deadline,
      priority: args.priority,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get goals for user
export const getGoals = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('healthGoals')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Update goal
export const updateGoal = mutation({
  args: {
    goalId: v.id('healthGoals'),
    currentValue: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { goalId, ...updates } = args;
    await ctx.db.patch(goalId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete goal
export const deleteGoal = mutation({
  args: { goalId: v.id('healthGoals') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.goalId);
  },
});
