import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/api/user/(.*)",
]);

// Routes that are always public
const isPublicRoute = createRouteMatcher([
	"/",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/analyze(.*)",
	"/results(.*)",
	"/pricing(.*)",
	"/checkout(.*)",
	"/api/analyze",
	"/api/checkout",
	"/api/webhook",
	"/api/og/(.*)",
	"/api/pdf/(.*)",
	"/api/admin/(.*)",
	"/api/user/check", // Allow unauthenticated users to check/create account
]);

export default clerkMiddleware(async (auth, req) => {
	// Protect dashboard and user routes
	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
