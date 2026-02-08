import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const FREE_ROASTS = 3;

// Get or create user by Clerk ID
export const getOrCreate = mutation({
	args: {
		clerkId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check if user exists
		const existing = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (existing) {
			return existing;
		}

		// Create new user
		const userId = await ctx.db.insert("users", {
			clerkId: args.clerkId,
			email: args.email,
			name: args.name,
			roastsRemaining: FREE_ROASTS,
			totalRoasts: 0,
			plan: "free",
			createdAt: Date.now(),
		});

		return await ctx.db.get(userId);
	},
});

// Get user by Clerk ID
export const getByClerkId = query({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.first();
	},
});

// Use a roast
export const useRoast = mutation({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		if (user.roastsRemaining <= 0) {
			return { success: false, needsPayment: true, remaining: 0 };
		}

		await ctx.db.patch(user._id, {
			roastsRemaining: user.roastsRemaining - 1,
			totalRoasts: user.totalRoasts + 1,
			lastRoastAt: Date.now(),
		});

		return {
			success: true,
			needsPayment: false,
			remaining: user.roastsRemaining - 1,
		};
	},
});

// Add roasts after purchase
export const addRoasts = mutation({
	args: {
		clerkId: v.string(),
		count: v.number(),
		plan: v.optional(v.union(v.literal("starter"), v.literal("pro"))),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		await ctx.db.patch(user._id, {
			roastsRemaining: user.roastsRemaining + args.count,
			plan: args.plan || user.plan,
		});

		return { success: true, remaining: user.roastsRemaining + args.count };
	},
});

// Get user stats
export const getStats = query({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (!user) {
			return null;
		}

		return {
			roastsRemaining: user.roastsRemaining,
			totalRoasts: user.totalRoasts,
			plan: user.plan,
		};
	},
});
