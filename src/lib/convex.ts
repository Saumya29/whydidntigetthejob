import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Server-side Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function getConvexClient() {
	if (!convexUrl) {
		throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
	}
	return new ConvexHttpClient(convexUrl);
}

export { api };
