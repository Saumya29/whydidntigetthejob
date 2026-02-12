import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default withSentryConfig(nextConfig, {
	// Sentry webpack plugin options
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	// Only upload source maps in production builds
	silent: !process.env.CI,

	// Upload source maps to Sentry
	widenClientFileUpload: true,

	// Hide source maps from browsers
	hideSourceMaps: true,

	// Automatically tree-shake unused Sentry code
	disableLogger: true,

	// Enable auto-instrumentation
	automaticVercelMonitors: true,
});
