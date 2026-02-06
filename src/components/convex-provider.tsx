"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create client only if URL is available
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	// If Convex is not configured, just render children without provider
	if (!convex) {
		return <>{children}</>;
	}

	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
