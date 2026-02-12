import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash is configured
const isUpstashConfigured = !!(
	process.env.UPSTASH_REDIS_REST_URL && 
	process.env.UPSTASH_REDIS_REST_TOKEN
);

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Create rate limiter only if Upstash is configured
let ratelimit: Ratelimit | null = null;

if (isUpstashConfigured) {
	const redis = new Redis({
		url: process.env.UPSTASH_REDIS_REST_URL!,
		token: process.env.UPSTASH_REDIS_REST_TOKEN!,
	});

	ratelimit = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
		analytics: true,
		prefix: "wdigtj",
	});
}

export interface RateLimitResult {
	success: boolean;
	limit: number;
	remaining: number;
	reset: number;
}

/**
 * Simple in-memory rate limiting for development
 */
function checkInMemoryRateLimit(identifier: string, limit = 10, windowMs = 60000): RateLimitResult {
	const now = Date.now();
	const record = inMemoryStore.get(identifier);
	
	if (!record || now > record.resetAt) {
		// New window
		inMemoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
		return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
	}
	
	if (record.count >= limit) {
		// Rate limited
		return { success: false, limit, remaining: 0, reset: record.resetAt };
	}
	
	// Increment
	record.count++;
	return { success: true, limit, remaining: limit - record.count, reset: record.resetAt };
}

/**
 * Check rate limit for an identifier (IP, user ID, etc.)
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
	// Use Upstash if configured, otherwise in-memory
	if (ratelimit) {
		try {
			const result = await ratelimit.limit(identifier);
			return {
				success: result.success,
				limit: result.limit,
				remaining: result.remaining,
				reset: result.reset,
			};
		} catch (error) {
			console.error("Upstash rate limit error:", error);
			// Fall back to in-memory on error
			return checkInMemoryRateLimit(identifier);
		}
	}
	
	// Development: use in-memory
	return checkInMemoryRateLimit(identifier);
}

/**
 * Get IP address from request headers
 */
export function getIP(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	
	if (realIp) {
		return realIp;
	}
	
	return "127.0.0.1";
}
