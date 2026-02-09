import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://whydidntigetthejob.com";

export const viewport: Viewport = {
	themeColor: "#dc2626",
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		default: "WhyDidntIGetTheJob - The rejection letter you deserved",
		template: "%s | WhyDidntIGetTheJob",
	},
	description:
		"Paste your resume and job description. Get brutally honest AI feedback on exactly why you didn't get hired. 3 free roasts, no credit card required.",
	keywords: ["resume", "job application", "career", "rejection", "AI feedback", "job search", "resume roast"],
	authors: [{ name: "WhyDidntIGetTheJob" }],
	creator: "WhyDidntIGetTheJob",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: BASE_URL,
		siteName: "WhyDidntIGetTheJob",
		title: "WhyDidntIGetTheJob - The rejection letter you deserved",
		description: "Get brutally honest AI feedback on why you didn't get the job. 3 free roasts.",
		images: [
			{
				url: `${BASE_URL}/og-image.png`,
				width: 1200,
				height: 630,
				alt: "WhyDidntIGetTheJob - Get your resume roasted",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "WhyDidntIGetTheJob",
		description: "The rejection letter you deserved but never got. Get roasted free.",
		images: [`${BASE_URL}/og-image.png`],
		creator: "@whydidntigetit",
	},
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", type: "image/svg+xml" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
};

// Check if Clerk is configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AuthWrapper({ children }: { children: React.ReactNode }) {
	if (!isClerkConfigured) {
		// Skip Clerk in development without keys
		return <>{children}</>;
	}

	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorPrimary: "#dc2626",
					colorBackground: "#09090b",
					colorInputBackground: "#18181b",
					colorInputText: "#fafafa",
					colorText: "#fafafa",
					colorTextOnPrimaryBackground: "#ffffff",
					colorTextSecondary: "#a1a1aa",
				},
				elements: {
					socialButtonsBlockButton: {
						backgroundColor: "#27272a",
						color: "#fafafa",
						borderColor: "#3f3f46",
						"&:hover": {
							backgroundColor: "#3f3f46",
						},
					},
					socialButtonsBlockButtonText: {
						color: "#fafafa",
					},
					dividerLine: {
						backgroundColor: "#3f3f46",
					},
					dividerText: {
						color: "#a1a1aa",
					},
					formButtonPrimary: {
						backgroundColor: "#dc2626",
						"&:hover": {
							backgroundColor: "#b91c1c",
						},
					},
					card: {
						backgroundColor: "#09090b",
						borderColor: "#27272a",
					},
					headerTitle: {
						color: "#fafafa",
					},
					headerSubtitle: {
						color: "#a1a1aa",
					},
					formFieldLabel: {
						color: "#fafafa",
					},
					footerActionLink: {
						color: "#dc2626",
						"&:hover": {
							color: "#ef4444",
						},
					},
				},
			}}
		>
			{children}
		</ClerkProvider>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AuthWrapper>
			<html lang="en">
				<body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen antialiased`}>
					<ConvexClientProvider>
						{children}
					</ConvexClientProvider>
				</body>
			</html>
		</AuthWrapper>
	);
}
