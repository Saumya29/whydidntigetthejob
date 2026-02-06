"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="max-w-2xl mx-auto text-center space-y-8">
				{/* Hero */}
				<div className="space-y-4">
					<Badge variant="outline" className="text-red-400 border-red-400/50">
						The truth hurts. Apply anyway.
					</Badge>

					<h1 className="text-5xl md:text-6xl font-bold tracking-tight">
						Why Didn&apos;t I Get <span className="text-red-500">The Job?</span>
					</h1>

					<p className="text-xl text-zinc-400 max-w-lg mx-auto">
						The rejection letter you deserved but never got.
					</p>
				</div>

				{/* Value prop */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
					<p className="text-zinc-300">
						Paste your resume and the job description. Our AI will tell you
						<span className="text-red-400 font-medium"> exactly </span>
						why you got ghosted — with brutal honesty and actionable feedback.
					</p>

					<div className="flex flex-wrap justify-center gap-3 text-sm">
						<span className="px-3 py-1 bg-zinc-800 rounded-full">📄 Resume analysis</span>
						<span className="px-3 py-1 bg-zinc-800 rounded-full">🎯 Skill gap breakdown</span>
						<span className="px-3 py-1 bg-zinc-800 rounded-full">🔥 Roast grade A-F</span>
						<span className="px-3 py-1 bg-zinc-800 rounded-full">📸 Shareable results</span>
					</div>
				</div>

				{/* CTA */}
				<div className="space-y-3">
					<Link href="/checkout">
						<Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6">
							Get Roasted — $7
						</Button>
					</Link>
					<p className="text-sm text-zinc-500">One-time payment. No subscription. No BS.</p>
				</div>

				{/* Social proof teaser */}
				<div className="pt-8 border-t border-zinc-800">
					<p className="text-zinc-500 text-sm">
						&ldquo;I finally understand why 47 companies ghosted me.&rdquo;
						<br />
						<span className="text-zinc-600">— A humbled software engineer</span>
					</p>
				</div>
			</div>
		</main>
	);
}
