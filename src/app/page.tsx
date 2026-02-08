"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const exampleRoasts = [
	{
		grade: "D+",
		gradeColor: "bg-red-600",
		title: "Senior Developer → FAANG",
		quote: "Your 'extensive experience' reads like a Wikipedia summary of technologies you've heard of.",
		gaps: ["No quantified impact", "Generic buzzwords", "Missing system design"],
	},
	{
		grade: "C-",
		gradeColor: "bg-orange-500",
		title: "Product Manager → Startup",
		quote: "You listed 'stakeholder management' 4 times. The stakeholders clearly weren't managing you back.",
		gaps: ["No product metrics", "Vague ownership", "Missing launches"],
	},
	{
		grade: "B",
		gradeColor: "bg-yellow-500",
		title: "Data Scientist → Tech",
		quote: "Solid fundamentals, but your projects sound like Kaggle tutorials with extra steps.",
		gaps: ["No production ML", "Missing business impact"],
	},
];

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
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Link href="/free">
							<Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6">
								Try Free — First Roast On Us 🔥
							</Button>
						</Link>
					</div>
					<p className="text-sm text-zinc-500">No payment required for your first roast</p>
					<p className="text-xs text-zinc-600">
						Already tried it? <Link href="/checkout" className="text-red-400 hover:underline">Get 3 more roasts for $5 →</Link>
					</p>
				</div>

				{/* Example Roasts */}
				<div className="pt-12 space-y-6">
					<h2 className="text-2xl font-bold text-zinc-300">Recent Roasts</h2>
					<div className="grid gap-4">
						{exampleRoasts.map((roast, i) => (
							<div
								key={i}
								className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-left overflow-hidden group hover:border-zinc-700 transition-colors"
							>
								{/* Grade badge */}
								<div className="flex items-start justify-between mb-3">
									<div>
										<p className="text-xs text-zinc-500 mb-1">Application</p>
										<p className="text-sm font-medium text-zinc-300">{roast.title}</p>
									</div>
									<span
										className={`${roast.gradeColor} text-white text-2xl font-bold px-3 py-1 rounded-lg`}
									>
										{roast.grade}
									</span>
								</div>

								{/* Quote - blurred teaser */}
								<div className="relative">
									<p className="text-zinc-400 italic text-sm leading-relaxed">
										&ldquo;{roast.quote.slice(0, 60)}
										<span className="blur-sm select-none">
											{roast.quote.slice(60)}
										</span>
										&rdquo;
									</p>
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-900/80" />
								</div>

								{/* Gaps */}
								<div className="flex flex-wrap gap-2 mt-3">
									{roast.gaps.slice(0, 2).map((gap, j) => (
										<span
											key={j}
											className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded"
										>
											{gap}
										</span>
									))}
									{roast.gaps.length > 2 && (
										<span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-500 rounded">
											+{roast.gaps.length - 2} more
										</span>
									)}
								</div>

								{/* CTA overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
									<span className="text-sm text-red-400 font-medium">
										Get your roast →
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Social proof teaser */}
				<div className="pt-8 border-t border-zinc-800">
					<p className="text-zinc-500 text-sm">
						&ldquo;I finally understand why 47 companies ghosted me.&rdquo;
						<br />
						<span className="text-zinc-600">— A humbled software engineer</span>
					</p>
				</div>

				{/* Bottom CTA */}
				<div className="pb-8">
					<Link href="/free">
						<Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
							Try Your First Roast Free →
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
