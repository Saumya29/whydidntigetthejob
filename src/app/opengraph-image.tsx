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
				<div style={{ fontSize: 120, marginBottom: 20 }}>🔥</div>
				
				{/* Title */}
				<div
					style={{
						fontSize: 72,
						fontWeight: 800,
						color: "white",
						textAlign: "center",
						marginBottom: 10,
					}}
				>
					Why Didn&apos;t I Get{" "}
					<span style={{ color: "#dc2626" }}>The Job?</span>
				</div>
				
				{/* Subtitle */}
				<div
					style={{
						fontSize: 32,
						color: "#a1a1aa",
						textAlign: "center",
						marginBottom: 40,
					}}
				>
					The rejection letter you deserved but never got
				</div>
				
				{/* CTA Badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						background: "#27272a",
						padding: "16px 32px",
						borderRadius: 16,
						border: "1px solid #3f3f46",
					}}
				>
					<span style={{ fontSize: 24, color: "#22c55e" }}>✓</span>
					<span style={{ fontSize: 24, color: "#e4e4e7" }}>
						3 Free Roasts • No Credit Card
					</span>
				</div>
			</div>
		),
		{
			...size,
		}
	);
}
