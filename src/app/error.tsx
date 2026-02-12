"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to Sentry
		Sentry.captureException(error);
	}, [error]);

	return (
		<main className="min-h-screen flex items-center justify-center p-4">
			<div className="text-center space-y-6 max-w-md">
				<div className="text-6xl">💥</div>
				<h1 className="text-3xl font-bold">Something went wrong</h1>
				<p className="text-zinc-400">
					Our AI had a meltdown. Don&apos;t worry, we&apos;ve been notified and are looking into it.
				</p>
				{error.digest && (
					<p className="text-xs text-zinc-600 font-mono">
						Error ID: {error.digest}
					</p>
				)}
				<div className="flex gap-3 justify-center">
					<Button onClick={reset} variant="outline">
						Try Again
					</Button>
					<Link href="/">
						<Button className="bg-red-600 hover:bg-red-700">
							Go Home
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
