import { ImageResponse } from "@vercel/og";
import { getResult } from "@/lib/storage";

export const runtime = "edge";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getResult(id);

	if (!result) {
		return new Response("Result not found", { status: 404 });
	}

	const gradeColors: Record<string, string> = {
		"A+": "#10b981",
		A: "#22c55e",
		"A-": "#22c55e",
		"B+": "#84cc16",
		B: "#84cc16",
		"B-": "#eab308",
		"C+": "#eab308",
		C: "#eab308",
		"C-": "#f97316",
		"D+": "#f97316",
		D: "#ea580c",
		"D-": "#ef4444",
		F: "#dc2626",
	};

	const gradeColor = gradeColors[result.grade] || "#ef4444";
	const competition = result.competition;
	const skills = result.skillGapHeatmap || [];
	const missingSkills = skills.filter((s) => s.status === "missing").slice(0, 3);

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#0a0a0a",
				padding: "50px",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			{/* Header */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
				<div style={{ display: "flex", alignItems: "center" }}>
					<span style={{ fontSize: "28px" }}>🔥</span>
					<span style={{ fontSize: "22px", color: "#a3a3a3", marginLeft: "10px", fontWeight: 600 }}>
						WhyDidntIGetTheJob
					</span>
				</div>
				{competition && (
					<div style={{ display: "flex", gap: "24px" }}>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
							<span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>
								~{competition.estimatedApplicants}
							</span>
							<span style={{ fontSize: "12px", color: "#737373" }}>APPLICANTS</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
							<span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>
								#{competition.estimatedRank}
							</span>
							<span style={{ fontSize: "12px", color: "#737373" }}>YOUR RANK</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
							<span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>
								{competition.percentile}%
							</span>
							<span style={{ fontSize: "12px", color: "#737373" }}>PERCENTILE</span>
						</div>
					</div>
				)}
			</div>

			{/* Main content */}
			<div style={{ display: "flex", flex: 1, gap: "50px" }}>
				{/* Left: Grade */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						width: "260px",
						background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
						borderRadius: "24px",
						border: "1px solid #333",
					}}
				>
					<div
						style={{
							fontSize: "140px",
							fontWeight: "900",
							color: gradeColor,
							lineHeight: 1,
							textShadow: `0 0 60px ${gradeColor}40`,
						}}
					>
						{result.grade}
					</div>
					<div style={{ fontSize: "18px", color: "#737373", marginTop: "12px", letterSpacing: "0.1em" }}>
						ROAST GRADE
					</div>
				</div>

				{/* Right: Content */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						justifyContent: "center",
					}}
				>
					{/* Headline */}
					<div
						style={{
							fontSize: "28px",
							color: "#ffffff",
							marginBottom: "28px",
							lineHeight: 1.4,
							fontStyle: "italic",
						}}
					>
						&ldquo;{result.headline.length > 80 ? result.headline.substring(0, 80) + "..." : result.headline}&rdquo;
					</div>

					{/* Missing Skills */}
					{missingSkills.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
							<div style={{ fontSize: "14px", color: "#ef4444", marginBottom: "4px", letterSpacing: "0.05em" }}>
								MISSING SKILLS:
							</div>
							{missingSkills.map((skill, i) => (
								<div
									key={i}
									style={{
										display: "flex",
										alignItems: "center",
										fontSize: "18px",
										color: "#d4d4d4",
									}}
								>
									<span style={{ color: "#ef4444", marginRight: "10px", fontSize: "14px" }}>✗</span>
									{skill.skill.length > 40 ? skill.skill.substring(0, 40) + "..." : skill.skill}
								</div>
							))}
						</div>
					)}

					{/* Fallback to legacy skillGaps */}
					{missingSkills.length === 0 && result.skillGaps && result.skillGaps.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
							<div style={{ fontSize: "14px", color: "#ef4444", marginBottom: "4px", letterSpacing: "0.05em" }}>
								SKILL GAPS:
							</div>
							{result.skillGaps.slice(0, 3).map((gap: string, i: number) => (
								<div
									key={i}
									style={{
										display: "flex",
										alignItems: "center",
										fontSize: "18px",
										color: "#d4d4d4",
									}}
								>
									<span style={{ color: "#ef4444", marginRight: "10px", fontSize: "14px" }}>✗</span>
									{gap.length > 40 ? gap.substring(0, 40) + "..." : gap}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: "24px",
					paddingTop: "20px",
					borderTop: "1px solid #262626",
				}}
			>
				<div style={{ fontSize: "16px", color: "#525252", fontStyle: "italic", maxWidth: "70%" }}>
					&ldquo;{result.hiringManagerQuote.length > 70 ? result.hiringManagerQuote.substring(0, 70) + "..." : result.hiringManagerQuote}&rdquo;
				</div>
				<div style={{ fontSize: "14px", color: "#737373", fontWeight: 600 }}>whydidntigetthejob.com</div>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
