import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "WhyDidntIGetTheJob - The rejection letter you deserved",
	description:
		"Paste your resume and job description. Get the brutal truth about why you didn't get the job.",
	openGraph: {
		title: "WhyDidntIGetTheJob",
		description: "The rejection letter you deserved but never got",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "WhyDidntIGetTheJob",
		description: "The rejection letter you deserved but never got",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
				{children}
			</body>
		</html>
	);
}
