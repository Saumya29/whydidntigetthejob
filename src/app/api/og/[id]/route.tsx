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
		A: "#22c55e",
		B: "#84cc16",
		C: "#eab308",
		D: "#f97316",
		F: "#ef4444",
	};

	const gradeColor = gradeColors[result.grade] || "#ef4444";

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#0a0a0a",
				padding: "60px",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			{/* Header */}
			<div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
				<span style={{ fontSize: "24px", color: "#ef4444" }}>🔥</span>
				<span style={{ fontSize: "24px", color: "#a3a3a3", marginLeft: "12px" }}>
					WhyDidntIGetTheJob
				</span>
			</div>

			{/* Main content */}
			<div style={{ display: "flex", flex: 1, gap: "60px" }}>
				{/* Left: Grade */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						width: "280px",
					}}
				>
					<div
						style={{
							fontSize: "180px",
							fontWeight: "bold",
							color: gradeColor,
							lineHeight: 1,
						}}
					>
						{result.grade}
					</div>
					<div style={{ fontSize: "24px", color: "#737373", marginTop: "16px" }}>ROAST GRADE</div>
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
							fontSize: "32px",
							color: "#ffffff",
							marginBottom: "32px",
							lineHeight: 1.3,
						}}
					>
						&ldquo;{result.headline}&rdquo;
					</div>

					{/* Top 3 gaps */}
					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
						<div style={{ fontSize: "18px", color: "#f97316", marginBottom: "8px" }}>
							TOP SKILL GAPS:
						</div>
						{result.skillGaps.slice(0, 3).map((gap, i) => (
							<div
								key={i}
								style={{
									display: "flex",
									alignItems: "center",
									fontSize: "20px",
									color: "#d4d4d4",
								}}
							>
								<span style={{ color: "#ef4444", marginRight: "12px" }}>✗</span>
								{gap.length > 50 ? gap.substring(0, 50) + "..." : gap}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: "40px",
					paddingTop: "24px",
					borderTop: "1px solid #333",
				}}
			>
				<div style={{ fontSize: "18px", color: "#737373", fontStyle: "italic" }}>
					&ldquo;{result.hiringManagerQuote.substring(0, 60)}...&rdquo;
				</div>
				<div style={{ fontSize: "16px", color: "#a3a3a3" }}>whydidntigetthejob.com</div>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
