"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ShareButtons } from "@/components/share-buttons";
import { Button } from "@/components/ui/button";

interface SkillGap {
	skill: string;
	status: "missing" | "weak" | "strong";
	jdMention: boolean;
	resumeMention: boolean;
}

interface Priority {
	rank: number;
	issue: string;
	effort: "Low" | "Medium" | "High";
	impact: "Low" | "Medium" | "High";
	action: string;
}

interface RecruiterNote {
	section: string;
	note: string;
}

interface ATSIssue {
	category: string;
	issue: string;
	severity: "Critical" | "Warning" | "Minor";
}

interface ATSScore {
	score: number;
	issues: ATSIssue[];
	missingKeywords: string[];
	tips: string[];
}

interface Competition {
	estimatedApplicants: number;
	estimatedRank: number;
	percentile: number;
	competitionLevel: "Low" | "Medium" | "High" | "Extreme";
}

interface BulletRewrite {
	before: string;
	after: string;
	why: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://whydidntigetthejob.vercel.app";

// Grade to color mapping — using semantic tokens
const gradeColors: Record<string, { text: string; bg: string; border: string }> = {
	"A+": { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
	A: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
	"A-": { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
	"B+": { text: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/30" },
	B: { text: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/30" },
	"B-": { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
	"C+": { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
	C: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
	"C-": { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
	"D+": { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
	D: { text: "text-orange-500", bg: "bg-orange-600/10", border: "border-orange-600/30" },
	"D-": { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
	F: { text: "text-red-500", bg: "bg-red-600/10", border: "border-red-600/30" },
};

function getGradeStyle(grade: string) {
	return gradeColors[grade] || gradeColors["C"];
}

// Small reusable section container
function Section({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="bg-surface border border-border rounded overflow-hidden">
			<div className="flex items-center gap-3 px-5 py-3 border-b border-border">
				<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">{label}</span>
			</div>
			<div className="p-5">{children}</div>
		</div>
	);
}

function SkillGapHeatmap({ skills }: { skills: SkillGap[] }) {
	const map = {
		missing: { bg: "bg-red-500/10", border: "border-red-500/25", text: "text-red-400", label: "MISSING" },
		weak: { bg: "bg-yellow-500/10", border: "border-yellow-500/25", text: "text-yellow-400", label: "WEAK" },
		strong: { bg: "bg-green-500/10", border: "border-green-500/25", text: "text-green-400", label: "STRONG" },
	};
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
			{skills.map((skill, i) => {
				const c = map[skill.status];
				return (
					<div key={i} className={`${c.bg} ${c.border} border rounded flex items-center justify-between px-3 py-2.5`}>
						<span className="text-foreground text-sm">{skill.skill}</span>
						<span className={`${c.text} font-mono text-[10px] tracking-widest`}>{c.label}</span>
					</div>
				);
			})}
		</div>
	);
}

function PriorityList({ priorities }: { priorities: Priority[] }) {
	const effortColors = { Low: "text-green-400", Medium: "text-yellow-400", High: "text-red-400" };
	const impactColors = { Low: "text-muted-foreground", Medium: "text-yellow-400", High: "text-green-400" };
	return (
		<div className="flex flex-col gap-3">
			{priorities.map((p) => (
				<div key={p.rank} className="flex items-start gap-4 bg-surface-raised border border-border rounded px-4 py-4">
					<span className="bg-primary text-primary-foreground w-6 h-6 rounded font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
						{p.rank}
					</span>
					<div className="flex-1 min-w-0">
						<p className="text-foreground font-medium text-sm">{p.issue}</p>
						<p className="text-muted-foreground text-sm mt-1">{p.action}</p>
						<div className="flex gap-5 mt-2">
							<span className="font-mono text-[10px] tracking-wide text-muted-foreground">
								EFFORT: <span className={effortColors[p.effort]}>{p.effort.toUpperCase()}</span>
							</span>
							<span className="font-mono text-[10px] tracking-wide text-muted-foreground">
								IMPACT: <span className={impactColors[p.impact]}>{p.impact.toUpperCase()}</span>
							</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function RecruiterNotesSection({ notes }: { notes: RecruiterNote[] }) {
	return (
		<div className="flex flex-col gap-4">
			{notes.map((note, i) => (
				<div key={i} className="flex flex-col gap-1">
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">{note.section}</span>
					<p className="text-muted-foreground text-sm italic leading-relaxed">&ldquo;{note.note}&rdquo;</p>
				</div>
			))}
		</div>
	);
}

function CompetitionScore({ competition }: { competition: Competition }) {
	const levelColors = {
		Low: "text-green-400",
		Medium: "text-yellow-400",
		High: "text-orange-400",
		Extreme: "text-red-400",
	};
	const cells = [
		{ value: `~${competition.estimatedApplicants}`, label: "EST. APPLICANTS" },
		{ value: `#${competition.estimatedRank}`, label: "YOUR EST. RANK" },
		{ value: `${competition.percentile}%`, label: "PERCENTILE" },
		{ value: competition.competitionLevel, label: "COMPETITION", color: levelColors[competition.competitionLevel] },
	];
	return (
		<div className="grid grid-cols-2 gap-2">
			{cells.map((c) => (
				<div key={c.label} className="bg-surface-raised border border-border rounded px-4 py-4 flex flex-col items-center gap-1 text-center">
					<span className={`font-mono font-black text-2xl ${c.color || "text-foreground"}`}>{c.value}</span>
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest">{c.label}</span>
				</div>
			))}
		</div>
	);
}

function ATSScoreSection({ ats }: { ats: ATSScore }) {
	const scoreColor =
		ats.score >= 80 ? "text-green-400" :
		ats.score >= 60 ? "text-yellow-400" :
		ats.score >= 40 ? "text-orange-400" :
		"text-red-400";

	const scoreBar =
		ats.score >= 80 ? "bg-green-500" :
		ats.score >= 60 ? "bg-yellow-500" :
		ats.score >= 40 ? "bg-orange-500" :
		"bg-red-500";

	const severityClasses: Record<string, string> = {
		Critical: "border-red-500/30 bg-red-500/10 text-red-400",
		Warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
		Minor: "border-border bg-surface-raised text-muted-foreground",
	};

	return (
		<div className="flex flex-col gap-5">
			{/* Score meter */}
			<div className="flex flex-col gap-3">
				<div className="flex items-end justify-between">
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">ATS Compatibility Score</span>
					<span className={`font-mono font-black text-4xl leading-none ${scoreColor}`}>{ats.score}</span>
				</div>
				<div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
					<div className={`h-full ${scoreBar} rounded-full transition-all`} style={{ width: `${ats.score}%` }} />
				</div>
			</div>

			{ats.issues?.length > 0 && (
				<div className="flex flex-col gap-2">
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Issues Found</span>
					{ats.issues.map((issue, i) => (
						<div key={i} className={`${severityClasses[issue.severity]} border rounded px-3 py-2.5 flex items-start gap-3`}>
							<span className="font-mono text-[10px] tracking-widest flex-shrink-0">{issue.severity.toUpperCase()}</span>
							<span className="text-muted-foreground text-sm">
								<span className="text-foreground font-medium">{issue.category}:</span> {issue.issue}
							</span>
						</div>
					))}
				</div>
			)}

			{ats.missingKeywords?.length > 0 && (
				<div>
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-2">Missing Keywords</span>
					<div className="flex flex-wrap gap-1.5">
						{ats.missingKeywords.map((kw, i) => (
							<span key={i} className="font-mono text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded">
								{kw}
							</span>
						))}
					</div>
				</div>
			)}

			{ats.tips?.length > 0 && (
				<div>
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-2">Optimization Tips</span>
					<ul className="flex flex-col gap-2">
						{ats.tips.map((tip, i) => (
							<li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
								<span className="text-green-400 flex-shrink-0">+</span>
								{tip}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

function BulletRewriteSection({ rewrite }: { rewrite: BulletRewrite }) {
	return (
		<div className="flex flex-col gap-3">
			<div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-4">
				<span className="font-mono text-[10px] text-red-400 tracking-widest block mb-2">BEFORE — YOUR VERSION</span>
				<p className="text-muted-foreground text-sm leading-relaxed">&ldquo;{rewrite.before}&rdquo;</p>
			</div>
			<div className="bg-green-500/10 border border-green-500/20 rounded px-4 py-4">
				<span className="font-mono text-[10px] text-green-400 tracking-widest block mb-2">AFTER — IMPROVED</span>
				<p className="text-foreground text-sm font-medium leading-relaxed">&ldquo;{rewrite.after}&rdquo;</p>
			</div>
			<div className="bg-surface-raised border border-border rounded px-4 py-3">
				<p className="text-muted-foreground text-sm">
					<span className="text-foreground font-medium">Why it&apos;s better:</span> {rewrite.why}
				</p>
			</div>
		</div>
	);
}

export default function ResultsPage() {
	const params = useParams();
	const id = params.id as string;
	const result = useQuery(api.results.getById, { resultId: id });

	if (result === undefined) {
		return (
			<main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
				<div className="flex items-center gap-3 text-muted-foreground font-mono text-sm">
					<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					LOADING VERDICT...
				</div>
			</main>
		);
	}

	if (!result) {
		return (
			<main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
				<div className="text-center flex flex-col items-center gap-4">
					<h1 className="text-2xl font-bold">Results not found</h1>
					<p className="text-muted-foreground text-sm">This roast may have expired or doesn&apos;t exist.</p>
					<Link href="/">
						<Button className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono text-xs tracking-widest">GET ROASTED</Button>
					</Link>
				</div>
			</main>
		);
	}

	const gradeStyle = getGradeStyle(result.grade);

	return (
		<main className="px-4 py-10 md:py-14">
			<div className="max-w-3xl mx-auto flex flex-col gap-4">

				{/* Page eyebrow */}
				<div className="flex items-center gap-4 mb-2">
					<div className="h-px flex-1 bg-border" />
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Your Roast Results</span>
					<div className="h-px flex-1 bg-border" />
				</div>

				{/* ── 1. Grade card ── */}
				<div className={`${gradeStyle.bg} ${gradeStyle.border} border rounded overflow-hidden`}>
					<div className="flex items-stretch">
						{/* Large grade */}
						<div className="flex flex-col items-center justify-center px-8 py-8 border-r border-border/50 flex-shrink-0">
							<span className={`font-mono font-black text-7xl md:text-8xl leading-none ${gradeStyle.text}`}>
								{result.grade}
							</span>
							<span className="font-mono text-[10px] text-muted-foreground tracking-widest mt-2">GRADE</span>
						</div>
						{/* Headline */}
						<div className="flex-1 px-6 py-6 flex flex-col justify-center gap-3">
							<div>
								<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-2">Verdict</span>
								<p className="text-foreground text-lg font-medium leading-relaxed italic">&ldquo;{result.headline}&rdquo;</p>
							</div>
						</div>
					</div>
				</div>

				{/* ── 2. ATS Score ── */}
				{result.atsScore && (
					<Section label="ATS Compatibility">
						<ATSScoreSection ats={result.atsScore} />
					</Section>
				)}

				{/* ── 3. Competition ── */}
				{result.competition && (
					<Section label="Competition Analysis">
						<CompetitionScore competition={result.competition} />
					</Section>
				)}

				{/* ── 4. Skill Gap Heatmap ── */}
				{result.skillGapHeatmap?.length > 0 && (
					<Section label="Skill Gap Analysis">
						<SkillGapHeatmap skills={result.skillGapHeatmap} />
					</Section>
				)}

				{/* ── 5. Fix This First ── */}
				{result.priorities?.length > 0 && (
					<Section label="Fix This First">
						<PriorityList priorities={result.priorities} />
					</Section>
				)}

				{/* ── 6. Bullet Rewrite ── */}
				{result.bulletRewrite && (
					<Section label="Free Rewrite">
						<BulletRewriteSection rewrite={result.bulletRewrite} />
					</Section>
				)}

				{/* ── 7. Recruiter Notes ── */}
				{result.recruiterNotes?.length > 0 && (
					<Section label="Recruiter Notes">
						<RecruiterNotesSection notes={result.recruiterNotes} />
					</Section>
				)}

				{/* ── 8. Brutal Truth ── */}
				<Section label="The Brutal Truth">
					<div className="flex flex-col gap-4">
						<p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{result.rejection}</p>
						<div className="bg-surface-raised border border-border rounded px-4 py-4">
							<span className="font-mono text-[10px] text-muted-foreground tracking-widest block mb-2">HIRING MANAGER&apos;S HOT TAKE</span>
							<p className="text-muted-foreground text-sm italic">&ldquo;{result.hiringManagerQuote}&rdquo;</p>
						</div>
					</div>
				</Section>

				{/* ── 9. How to Get Hired ── */}
				<Section label="How to Actually Get Hired">
					<ul className="flex flex-col gap-3">
						{result.improvements.map((tip: string, i: number) => (
							<li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
								<span className="bg-green-500/20 text-green-400 rounded font-mono text-[10px] font-bold w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
									{i + 1}
								</span>
								{tip}
							</li>
						))}
					</ul>
				</Section>

				{/* ── Share ── */}
				<div className="bg-surface border border-border rounded p-5 flex flex-col gap-3">
					<span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase text-center">Share your roast (if you dare)</span>
					<ShareButtons grade={result.grade} url={`${BASE_URL}/results/${id}`} />
				</div>

				{/* ── CTA ── */}
				<div className="text-center py-6 border-t border-border">
					<p className="font-mono text-xs text-muted-foreground tracking-wide mb-4">GOT ANOTHER REJECTION TO PROCESS?</p>
					<Link href="/analyze">
						<Button className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono tracking-widest text-xs">
							GET ROASTED AGAIN
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
