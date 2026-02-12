import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

	// Only enable in production
	enabled: process.env.NODE_ENV === "production",

	// Performance monitoring
	tracesSampleRate: 0.1, // 10% of transactions

	// Session replay for debugging
	replaysSessionSampleRate: 0.1, // 10% of sessions
	replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

	// Don't send PII
	sendDefaultPii: false,

	// Filter out noisy errors
	ignoreErrors: [
		// Browser extensions
		/ResizeObserver loop/,
		/Non-Error promise rejection/,
		// Network errors users can't do anything about
		/Failed to fetch/,
		/NetworkError/,
		/Load failed/,
	],

	// Tag environment
	environment: process.env.NODE_ENV,
});
