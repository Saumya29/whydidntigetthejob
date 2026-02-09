"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// Map Convex result to component interface
import { ShareButtons } from "@/components/share-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface AnalysisResult {
	resultId: string;
	grade: string;
	headline: string;
	rejection: string;
	recruiterNotes: RecruiterNote[];
	skillGapHeatmap: SkillGap[];
	priorities: Priority[];
	competition: Competition;
	bulletRewrite: BulletRewrite | null;
	atsScore: ATSScore;
	hiringManagerQuote: string;
	improvements: string[];
	skillGaps: string[];
}

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://whydidntigetthejob.vercel.app";

// Grade color mapping
const gradeColors: Record<string, { bg: string; text: string; ring: string }> = {
	"A+": { bg: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30" },
	A: { bg: "bg-green-500", text: "text-green-400", ring: "ring-green-500/30" },
	"A-": { bg: "bg-green-500", text: "text-green-400", ring: "ring-green-500/30" },
	"B+": { bg: "bg-lime-500", text: "text-lime-400", ring: "ring-lime-500/30" },
	B: { bg: "bg-lime-500", text: "text-lime-400", ring: "ring-lime-500/30" },
	"B-": { bg: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/30" },
	"C+": { bg: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/30" },
	C: { bg: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/30" },
	"C-": { bg: "bg-orange-500", text: "text-orange-400", ring: "ring-orange-500/30" },
	"D+": { bg: "bg-orange-500", text: "text-orange-400", ring: "ring-orange-500/30" },
	D: { bg: "bg-orange-600", text: "text-orange-400", ring: "ring-orange-500/30" },
	"D-": { bg: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30" },
	F: { bg: "bg-red-600", text: "text-red-400", ring: "ring-red-500/30" },
};

function getGradeStyle(grade: string) {
	return gradeColors[grade] || gradeColors["C"];
}

// Skill Gap Heatmap Component
function SkillGapHeatmap({ skills }: { skills: SkillGap[] }) {
	const statusColors = {
		missing: { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400", label: "Missing" },
		weak: { bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-400", label: "Weak" },
		strong: { bg: "bg-green-500/20", border: "border-green-500/40", text: "text-green-400", label: "Strong" },
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{skills.map((skill, i) => {
				const colors = statusColors[skill.status];
				return (
					<div
						key={i}
						className={`${colors.bg} ${colors.border} border rounded-lg p-3 flex items-center justify-between`}
					>
						<span className="text-zinc-200 text-sm font-medium">{skill.skill}</span>
						<span className={`${colors.text} text-xs font-semibold uppercase`}>{colors.label}</span>
					</div>
				);
			})}
		</div>
	);
}

// Priority List Component
function PriorityList({ priorities }: { priorities: Priority[] }) {
	const effortColors = { Low: "text-green-400", Medium: "text-yellow-400", High: "text-red-400" };
	const impactColors = { Low: "text-zinc-400", Medium: "text-yellow-400", High: "text-green-400" };

	return (
		<div className="space-y-4">
			{priorities.map((p) => (
				<div key={p.rank} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
					<div className="flex items-start gap-3">
						<span className="bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
							{p.rank}
						</span>
						<div className="flex-1 min-w-0">
							<p className="text-zinc-100 font-medium">{p.issue}</p>
							<p className="text-zinc-400 text-sm mt-1">{p.action}</p>
							<div className="flex gap-4 mt-2 text-xs">
								<span>
									Effort: <span className={effortColors[p.effort]}>{p.effort}</span>
								</span>
								<span>
									Impact: <span className={impactColors[p.impact]}>{p.impact}</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Recruiter Notes Component
function RecruiterNotesSection({ notes }: { notes: RecruiterNote[] }) {
	return (
		<div className="space-y-3">
			{notes.map((note, i) => (
				<div key={i} className="border-l-2 border-zinc-700 pl-4 py-1">
					<p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">{note.section}</p>
					<p className="text-zinc-300 text-sm italic">&ldquo;{note.note}&rdquo;</p>
				</div>
			))}
		</div>
	);
}

// Competition Score Component
function CompetitionScore({ competition }: { competition: Competition }) {
	const levelColors = {
		Low: "text-green-400",
		Medium: "text-yellow-400",
		High: "text-orange-400",
		Extreme: "text-red-400",
	};

	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="bg-zinc-800/50 rounded-lg p-4 text-center">
				<p className="text-3xl font-bold text-white">~{competition.estimatedApplicants}</p>
				<p className="text-zinc-400 text-sm">Est. Applicants</p>
			</div>
			<div className="bg-zinc-800/50 rounded-lg p-4 text-center">
				<p className="text-3xl font-bold text-white">#{competition.estimatedRank}</p>
				<p className="text-zinc-400 text-sm">Your Est. Rank</p>
			</div>
			<div className="bg-zinc-800/50 rounded-lg p-4 text-center">
				<p className="text-3xl font-bold text-white">{competition.percentile}%</p>
				<p className="text-zinc-400 text-sm">Percentile</p>
			</div>
			<div className="bg-zinc-800/50 rounded-lg p-4 text-center">
				<p className={`text-2xl font-bold ${levelColors[competition.competitionLevel]}`}>
					{competition.competitionLevel}
				</p>
				<p className="text-zinc-400 text-sm">Competition</p>
			</div>
		</div>
	);
}

// ATS Score Component
function ATSScoreSection({ ats }: { ats: ATSScore }) {
	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-400";
		if (score >= 60) return "text-yellow-400";
		if (score >= 40) return "text-orange-400";
		return "text-red-400";
	};

	const getScoreBg = (score: number) => {
		if (score >= 80) return "from-green-500/20 to-green-500/5";
		if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
		if (score >= 40) return "from-orange-500/20 to-orange-500/5";
		return "from-red-500/20 to-red-500/5";
	};

	const severityColors: Record<string, string> = {
		Critical: "bg-red-500/20 text-red-400 border-red-500/30",
		Warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		Minor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	};

	return (
		<div className="space-y-4">
			<div className={`bg-gradient-to-r ${getScoreBg(ats.score)} rounded-xl p-6 text-center`}>
				<p className={`text-6xl font-black ${getScoreColor(ats.score)}`}>{ats.score}</p>
				<p className="text-zinc-400 text-sm mt-1">ATS Compatibility Score</p>
			</div>

			{ats.issues && ats.issues.length > 0 && (
				<div className="space-y-2">
					<p className="text-zinc-500 text-xs uppercase tracking-wide">Issues Found</p>
					{ats.issues.map((issue, i) => (
						<div key={i} className={`${severityColors[issue.severity]} border rounded-lg p-3 flex items-start gap-3`}>
							<span className="text-xs font-semibold uppercase flex-shrink-0">{issue.severity}</span>
							<div>
								<span className="text-zinc-300 text-sm font-medium">{issue.category}:</span>
								<span className="text-zinc-400 text-sm ml-1">{issue.issue}</span>
							</div>
						</div>
					))}
				</div>
			)}

			{ats.missingKeywords && ats.missingKeywords.length > 0 && (
				<div>
					<p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">Missing Keywords</p>
					<div className="flex flex-wrap gap-2">
						{ats.missingKeywords.map((keyword, i) => (
							<span key={i} className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20">
								{keyword}
							</span>
						))}
					</div>
				</div>
			)}

			{ats.tips && ats.tips.length > 0 && (
				<div>
					<p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">ATS Optimization Tips</p>
					<ul className="space-y-2">
						{ats.tips.map((tip, i) => (
							<li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
								<span className="text-green-400">💡</span>
								{tip}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

// Bullet Rewrite Component
function BulletRewriteSection({ rewrite }: { rewrite: BulletRewrite }) {
	return (
		<div className="space-y-4">
			<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
				<p className="text-red-400 text-xs uppercase tracking-wide mb-2">❌ Before (Your Version)</p>
				<p className="text-zinc-300">&ldquo;{rewrite.before}&rdquo;</p>
			</div>
			<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
				<p className="text-green-400 text-xs uppercase tracking-wide mb-2">✓ After (Improved)</p>
				<p className="text-zinc-100 font-medium">&ldquo;{rewrite.after}&rdquo;</p>
			</div>
			<div className="bg-zinc-800/50 rounded-lg p-3">
				<p className="text-zinc-400 text-sm">
					<span className="text-zinc-300 font-medium">Why it&apos;s better:</span> {rewrite.why}
				</p>
			</div>
		</div>
	);
}

export default function ResultsPage() {
	const params = useParams();
	const id = params.id as string;
	
	// Fetch from Convex
	const result = useQuery(api.results.getById, { resultId: id });
	
	// Loading state (result is undefined while loading)
	if (result === undefined) {
		return (
			<main className="min-h-screen flex items-center justify-center">
				<div className="flex items-center gap-3 text-zinc-400">
					<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					Loading your roast...
				</div>
			</main>
		);
	}

	if (!result) {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">Results not found</h1>
					<p className="text-zinc-400">This roast may have expired or doesn&apos;t exist.</p>
					<Link href="/">
						<Button>Get Roasted</Button>
					</Link>
				</div>
			</main>
		);
	}

	const gradeStyle = getGradeStyle(result.grade);

	return (
		<main className="min-h-screen p-4 py-8 md:py-12">
			<div className="max-w-3xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<Badge variant="outline" className="text-red-400 border-red-400/50">
						Your Roast Results
					</Badge>
					<h1 className="text-2xl md:text-3xl font-bold">The Verdict Is In</h1>
				</div>

				{/* 1. GRADE CARD */}
				<Card className={`bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 overflow-hidden ring-2 ${gradeStyle.ring}`}>
					<CardContent className="p-6 md:p-8">
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1">
								<p className="text-zinc-500 text-xs uppercase tracking-wider">Roast Grade</p>
								<p className={`text-5xl md:text-6xl font-black mt-1 ${gradeStyle.text}`}>{result.grade}</p>
							</div>
							<div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${gradeStyle.bg} flex items-center justify-center shadow-lg`}>
								<span className="text-3xl md:text-4xl font-black text-white">{result.grade}</span>
							</div>
						</div>
						<div className="mt-4 pt-4 border-t border-zinc-800">
							<p className="text-lg md:text-xl text-zinc-300 italic">&ldquo;{result.headline}&rdquo;</p>
						</div>
					</CardContent>
				</Card>

				{/* 2. ATS SCORE */}
				{result.atsScore && (
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader className="pb-2">
							<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
								🤖 ATS Compatibility
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ATSScoreSection ats={result.atsScore} />
						</CardContent>
					</Card>
				)}

				{/* 3. COMPETITION SCORE */}
				{result.competition && (
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader className="pb-2">
							<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
								📊 Competition Analysis
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CompetitionScore competition={result.competition} />
						</CardContent>
					</Card>
				)}

				{/* 4. SKILL GAP HEATMAP */}
				{result.skillGapHeatmap && result.skillGapHeatmap.length > 0 && (
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader className="pb-2">
							<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
								🎯 Skill Gap Analysis
							</CardTitle>
						</CardHeader>
						<CardContent>
							<SkillGapHeatmap skills={result.skillGapHeatmap} />
						</CardContent>
					</Card>
				)}

				{/* 5. FIX THIS FIRST */}
				{result.priorities && result.priorities.length > 0 && (
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader className="pb-2">
							<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
								🚨 Fix This First
							</CardTitle>
						</CardHeader>
						<CardContent>
							<PriorityList priorities={result.priorities} />
						</CardContent>
					</Card>
				)}

				{/* 6. BULLET REWRITE */}
				{result.bulletRewrite && (
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader className="pb-2">
							<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
								✨ Free Rewrite
							</CardTitle>
						</CardHeader>
						<CardContent>
							<BulletRewriteSection rewrite={result.bulletRewrite} />
						</CardContent>
					</Card>
				)}

				{/* 7. RECRUITER NOTES */}
				{result.recruiterNotes && result.recruiterNotes.length > 0 && (
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader className="pb-2">
							<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
								📝 Recruiter Notes
							</CardTitle>
						</CardHeader>
						<CardContent>
							<RecruiterNotesSection notes={result.recruiterNotes} />
						</CardContent>
					</Card>
				)}

				{/* 8. THE BRUTAL TRUTH */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader className="pb-2">
						<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
							🔥 The Brutal Truth
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{result.rejection}</p>
						<div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
							<p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">
								Hiring manager&apos;s hot take:
							</p>
							<p className="text-zinc-300 italic">&ldquo;{result.hiringManagerQuote}&rdquo;</p>
						</div>
					</CardContent>
				</Card>

				{/* 9. HOW TO ACTUALLY GET HIRED */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader className="pb-2">
						<CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
							💡 How to Actually Get Hired
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3">
							{result.improvements.map((tip: string, i: number) => (
								<li key={i} className="flex items-start gap-3 text-zinc-300">
									<span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
										{i + 1}
									</span>
									{tip}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				{/* SHARE SECTION */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardContent className="p-6 space-y-4">
						<div className="border-t border-zinc-800 pt-4">
							<p className="text-zinc-400 text-sm text-center mb-3">Share your roast (if you dare)</p>
							<ShareButtons grade={result.grade} url={`${BASE_URL}/results/${id}`} />
						</div>
					</CardContent>
				</Card>

				{/* CTA */}
				<div className="text-center pt-6 border-t border-zinc-800">
					<p className="text-zinc-500 mb-4">Got another rejection to process?</p>
					<Link href="/analyze">
						<Button className="bg-red-600 hover:bg-red-700">Get Roasted Again</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
