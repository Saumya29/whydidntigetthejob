import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Check if email has already used free roast
export const checkEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		const email = args.email.toLowerCase().trim();
		const existing = await ctx.db
			.query("freeRoasts")
			.withIndex("by_email", (q) => q.eq("email", email))
			.first();
		
		return {
			exists: !!existing,
			usedAt: existing?.usedAt,
			resultId: existing?.resultId,
		};
	},
});

// Mark email as having used free roast
export const markUsed = mutation({
	args: { 
		email: v.string(),
		resultId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const email = args.email.toLowerCase().trim();
		
		// Check if already exists
		const existing = await ctx.db
			.query("freeRoasts")
			.withIndex("by_email", (q) => q.eq("email", email))
			.first();
		
		if (existing) {
			// Update with result ID if provided
			if (args.resultId) {
				await ctx.db.patch(existing._id, { resultId: args.resultId });
			}
			return { success: true, alreadyUsed: true };
		}
		
		// Create new entry
		await ctx.db.insert("freeRoasts", {
			email,
			usedAt: Date.now(),
			resultId: args.resultId,
		});
		
		return { success: true, alreadyUsed: false };
	},
});

// Get email list (for admin/export)
export const getEmailList = query({
	args: {},
	handler: async (ctx) => {
		const emails = await ctx.db.query("freeRoasts").collect();
		return emails.map((e) => ({
			email: e.email,
			usedAt: e.usedAt,
			resultId: e.resultId,
		}));
	},
});

// Get count of free tier signups
export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const emails = await ctx.db.query("freeRoasts").collect();
		const now = Date.now();
		const dayMs = 24 * 60 * 60 * 1000;
		
		return {
			total: emails.length,
			today: emails.filter((e) => e.usedAt > now - dayMs).length,
			thisWeek: emails.filter((e) => e.usedAt > now - 7 * dayMs).length,
		};
	},
});
