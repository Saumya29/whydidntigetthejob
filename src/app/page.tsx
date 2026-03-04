"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const exampleRoasts = [
	{
		grade: "D+",
		gradeColor: "text-red-500",
		borderColor: "border-red-500/20",
		title: "Senior Developer",
		target: "FAANG",
		quote: "Your 'extensive experience' reads like a Wikipedia summary of technologies you've heard of.",
		gaps: ["No quantified impact", "Generic buzzwords", "Missing system design"],
	},
	{
		grade: "C-",
		gradeColor: "text-orange-400",
		borderColor: "border-orange-400/20",
		title: "Product Manager",
		target: "Series B Startup",
		quote: "You listed 'stakeholder management' 4 times. The stakeholders clearly weren't managing you back.",
		gaps: ["No product metrics", "Vague ownership", "Missing launches"],
	},
	{
		grade: "B",
		gradeColor: "text-yellow-400",
		borderColor: "border-yellow-400/20",
		title: "Data Scientist",
		target: "Big Tech",
		quote: "Solid fundamentals, but your projects sound like Kaggle tutorials with extra steps.",
		gaps: ["No production ML", "Missing business impact"],
	},
];

const stats = [
	{ value: "47", label: "Avg. ghostings before insight" },
	{ value: "3.2s", label: "Time a recruiter spends on resume" },
	{ value: "94%", label: "Users who found critical gaps" },
];

const features = [
	{ id: "01", title: "Resume Analysis", desc: "Line-by-line breakdown of what's hurting your chances." },
	{ id: "02", title: "Skill Gap Map", desc: "Exact skills missing vs. what the job demands." },
	{ id: "03", title: "ATS Score", desc: "How well your resume survives the bots before humans see it." },
	{ id: "04", title: "Roast Grade A–F", desc: "A single brutal letter that sums it all up." },
];

export default function Home() {
	return (
		<main className="min-h-[calc(100vh-3.5rem)] flex flex-col font-sans">

			{/* ── Hero ── */}
			<section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-28 grid-texture overflow-hidden">
				{/* Faint background label */}
				<span
					aria-hidden="true"
					className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-mono font-black text-[clamp(5rem,22vw,18rem)] text-foreground/[0.03] leading-none tracking-tighter text-center px-4"
				>
					REJECTED
				</span>

				<div className="relative max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
					{/* Eyebrow */}
					<div className="flex items-center gap-2.5 border border-border bg-surface rounded px-3 py-1.5">
						<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
						<span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
							The truth hurts. Apply anyway.
						</span>
					</div>

					{/* Headline */}
					<h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-balance">
						Why Didn&apos;t I{" "}
						<span className="text-primary">Get The Job?</span>
					</h1>

					<p className="text-lg text-muted-foreground max-w-md leading-relaxed text-pretty">
						The rejection letter you deserved but never got. Paste your resume and the job description — our AI tells you{" "}
						<span className="text-foreground font-medium">exactly</span> why you got ghosted.
					</p>

					{/* CTA */}
					<div className="flex flex-col sm:flex-row items-center gap-3">
						<Link href="/analyze">
							<Button
								size="lg"
								className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono tracking-widest text-sm h-12 px-8 red-glow"
							>
								GET ROASTED
							</Button>
						</Link>
						<span className="font-mono text-xs text-muted-foreground tracking-wide">
							3 free credits — no card required
						</span>
					</div>
				</div>
			</section>

			{/* ── Stats bar ── */}
			<section className="border-y border-border bg-surface">
				<div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 divide-x divide-border">
					{stats.map((s) => (
						<div key={s.label} className="flex flex-col items-center gap-1 px-4">
							<span className="font-mono font-black text-2xl md:text-3xl text-foreground">{s.value}</span>
							<span className="font-mono text-[10px] text-muted-foreground tracking-wide text-center uppercase">{s.label}</span>
						</div>
					))}
				</div>
			</section>

			{/* ── How it works ── */}
			<section className="px-4 py-16 bg-background">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center gap-4 mb-10">
						<span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">What you get</span>
						<div className="flex-1 h-px bg-border" />
					</div>
					<div className="grid sm:grid-cols-2 gap-px bg-border border border-border rounded overflow-hidden">
						{features.map((f) => (
							<div key={f.id} className="bg-background p-6 flex flex-col gap-3">
								<span className="font-mono text-xs text-primary tracking-widest">{f.id}</span>
								<h3 className="font-bold text-foreground text-lg">{f.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Example roasts ── */}
			<section className="px-4 pb-16 bg-background">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center gap-4 mb-10">
						<span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Recent verdicts</span>
						<div className="flex-1 h-px bg-border" />
					</div>
					<div className="flex flex-col gap-3">
						{exampleRoasts.map((roast, i) => (
							<div
								key={i}
								className={`group relative bg-surface border ${roast.borderColor} rounded overflow-hidden hover:bg-surface-raised transition-colors`}
							>
								<div className="flex items-start gap-4 p-5">
									{/* Grade */}
									<div className="flex-shrink-0 w-16 flex flex-col items-center gap-1 pt-1">
										<span className={`font-mono font-black text-3xl leading-none ${roast.gradeColor}`}>
											{roast.grade}
										</span>
										<span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">GRADE</span>
									</div>

									{/* Divider */}
									<div className="w-px self-stretch bg-border flex-shrink-0" />

									{/* Content */}
									<div className="flex-1 min-w-0 space-y-2">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-bold text-foreground text-sm">{roast.title}</span>
											<span className="font-mono text-xs text-muted-foreground">→</span>
											<span className="font-mono text-xs text-muted-foreground">{roast.target}</span>
										</div>
										<div className="relative">
											<p className="text-muted-foreground text-sm leading-relaxed italic">
												&ldquo;{roast.quote.slice(0, 55)}
												<span className="blur-sm select-none">{roast.quote.slice(55)}</span>
												&rdquo;
											</p>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface pointer-events-none" />
										</div>
										<div className="flex flex-wrap gap-1.5 pt-1">
											{roast.gaps.map((gap, j) => (
												<span
													key={j}
													className="font-mono text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded"
												>
													{gap}
												</span>
											))}
										</div>
									</div>
								</div>

								{/* Hover CTA */}
								<div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
									<span className="font-mono text-xs text-primary tracking-wide">GET YOUR ROAST →</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Footer CTA ── */}
			<footer className="border-t border-border bg-surface px-4 py-16">
				<div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
					<p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
						Trusted by job seekers who got real feedback
					</p>
					<blockquote className="text-foreground text-lg font-medium text-pretty">
						&ldquo;I finally understand why 47 companies ghosted me.&rdquo;
					</blockquote>
					<span className="font-mono text-xs text-muted-foreground">— A humbled software engineer</span>
					<Link href="/analyze">
						<Button
							size="lg"
							className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono tracking-widest text-sm h-12 px-10 mt-2 red-glow"
						>
							GET YOUR 3 FREE CREDITS
						</Button>
					</Link>
				</div>
			</footer>
		</main>
	);
}
