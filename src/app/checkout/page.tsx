"use client";

import Link from "next/link";

export default function CheckoutPage() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="max-w-md mx-auto text-center space-y-6">
				<Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
					← Back to home
				</Link>

				<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
					<div className="space-y-2">
						<div className="text-5xl">🔥</div>
						<h1 className="text-2xl font-bold text-white">Out of roasts?</h1>
						<p className="text-zinc-400">
							You&apos;ve used all your free roasts. Reach out to get more credits added to your account.
						</p>
					</div>

					<div className="bg-zinc-800/50 rounded-xl p-4 space-y-1">
						<p className="text-zinc-500 text-sm">Contact</p>
						<a
							href="mailto:saumyatiwari.29@gmail.com"
							className="text-red-400 hover:text-red-300 font-medium break-all"
						>
							saumyatiwari.29@gmail.com
						</a>
					</div>

					<p className="text-zinc-600 text-sm">
						Include your account email and we&apos;ll top you up.
					</p>
				</div>
			</div>
		</main>
	);
}
