import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create conversation
export const createConversation = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    llmProvider: v.union(v.literal('openai'), v.literal('gemini'), v.literal('local')),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('conversations', {
      userId: args.userId,
      title: args.title,
      messageCount: 0,
      llmProviderUsed: args.llmProvider,
      modelUsed: args.model,
      isArchived: false,
      createdAt: now,
      lastMessageAt: now,
    });
  },
});

// Get conversations for user
export const getConversations = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('conversations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(50);
  },
});

// Get conversation by ID
export const getConversation = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

// Update conversation
export const updateConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    title: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { conversationId, ...updates } = args;
    await ctx.db.patch(conversationId, {
      ...updates,
      lastMessageAt: Date.now(),
    });
  },
});

// Delete conversation
export const deleteConversation = mutation({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    // Delete all messages first
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    await ctx.db.delete(args.conversationId);
  },
});

// Add message
export const addMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    contextSnapshot: v.optional(v.string()),
    safetyFlags: v.optional(v.array(v.string())),
    tokensUsed: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    providerUsed: v.optional(v.union(v.literal('openai'), v.literal('gemini'), v.literal('local'))),
    modelUsed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Insert message
    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      contextSnapshot: args.contextSnapshot,
      safetyFlags: args.safetyFlags,
      tokensUsed: args.tokensUsed,
      latencyMs: args.latencyMs,
      providerUsed: args.providerUsed,
      modelUsed: args.modelUsed,
      timestamp: now,
    });
    
    // Update conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        messageCount: conversation.messageCount + 1,
        lastMessageAt: now,
      });
    }
    
    return messageId;
  },
});

// Get messages for conversation
export const getMessages = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation_and_time', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .order('asc')
      .collect();
  },
});

// Get recent messages (for context)
export const getRecentMessages = query({
  args: {
    conversationId: v.id('conversations'),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation_and_time', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .order('desc')
      .take(args.limit);
  },
});
