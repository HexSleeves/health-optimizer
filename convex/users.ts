import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create or update user
export const upsertUser = mutation({
  args: {
    email: v.string(),
    appleUserId: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        appleUserId: args.appleUserId,
        name: args.name,
        updatedAt: now,
        lastActiveAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('users', {
      email: args.email,
      appleUserId: args.appleUserId,
      name: args.name,
      hasCompletedOnboarding: false,
      hasCompletedIntake: false,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    });
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    timezone: v.optional(v.string()),
    hasCompletedOnboarding: v.optional(v.boolean()),
    hasCompletedIntake: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update LLM configuration
export const updateLLMConfig = mutation({
  args: {
    userId: v.id('users'),
    provider: v.union(v.literal('openai'), v.literal('gemini'), v.literal('local')),
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('llmConfigs')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const config = {
      userId: args.userId,
      provider: args.provider,
      model: args.model,
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      localModelEnabled: args.provider === 'local',
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, config);
    } else {
      await ctx.db.insert('llmConfigs', config);
    }
  },
});

// Get LLM configuration
export const getLLMConfig = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('llmConfigs')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
  },
});
