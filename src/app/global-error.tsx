"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="bg-zinc-950 text-white">
				<main className="min-h-screen flex items-center justify-center p-4">
					<div className="text-center space-y-6 max-w-md">
						<div className="text-6xl">🔥</div>
						<h1 className="text-3xl font-bold">Critical Error</h1>
						<p className="text-zinc-400">
							Something went very wrong. Our team has been alerted.
						</p>
						{error.digest && (
							<p className="text-xs text-zinc-600 font-mono">
								Error ID: {error.digest}
							</p>
						)}
						<button
							onClick={reset}
							className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium"
						>
							Try Again
						</button>
					</div>
				</main>
			</body>
		</html>
	);
}
