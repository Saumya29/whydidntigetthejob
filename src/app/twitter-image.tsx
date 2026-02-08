import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WhyDidntIGetTheJob - Get your resume roasted";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: "Inter, sans-serif",
				}}
			>
				{/* Fire emoji */}
				<div style={{ fontSize: 100, marginBottom: 16 }}>🔥</div>
				
				{/* Title */}
				<div
					style={{
						fontSize: 64,
						fontWeight: 800,
						color: "white",
						textAlign: "center",
						marginBottom: 8,
					}}
				>
					Why Didn&apos;t I Get{" "}
					<span style={{ color: "#dc2626" }}>The Job?</span>
				</div>
				
				{/* Subtitle */}
				<div
					style={{
						fontSize: 28,
						color: "#a1a1aa",
						textAlign: "center",
						marginBottom: 32,
					}}
				>
					Get brutally honest AI feedback on your resume
				</div>
				
				{/* Features */}
				<div
					style={{
						display: "flex",
						gap: 24,
					}}
				>
					{["📄 Resume Analysis", "🎯 Skill Gaps", "🔥 Roast Grade"].map((item) => (
						<div
							key={item}
							style={{
								background: "#27272a",
								padding: "12px 24px",
								borderRadius: 12,
								border: "1px solid #3f3f46",
								fontSize: 20,
								color: "#e4e4e7",
							}}
						>
							{item}
						</div>
					))}
				</div>
			</div>
		),
		{
			...size,
		}
	);
}
