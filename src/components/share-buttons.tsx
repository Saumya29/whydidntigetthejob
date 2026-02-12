"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Linkedin } from "lucide-react";

interface ShareButtonsProps {
	grade: string;
	url: string;
}

// X/Twitter icon (they removed the bird)
function XIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

export function ShareButtons({ grade, url }: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);

	// Different messages based on grade
	const getShareText = () => {
		if (grade.startsWith("A")) {
			return `I got a ${grade} on my resume roast! 🔥 Not bad...\n\nFind out why YOU keep getting rejected:`;
		}
		if (grade.startsWith("B")) {
			return `Got roasted by AI on my resume. Grade: ${grade} 📝\n\nThink you can do better?`;
		}
		if (grade.startsWith("C")) {
			return `Just got humbled by an AI resume roaster. Grade: ${grade} 😅\n\nYour turn:`;
		}
		if (grade.startsWith("D")) {
			return `I got absolutely cooked by this resume roaster 💀 Grade: ${grade}\n\nI dare you to try:`;
		}
		// F grade
		return `I just got DESTROYED by an AI resume roaster 😭 Grade: ${grade}\n\nMisery loves company:`;
	};

	const tweetText = getShareText();
	const linkedInText = `I got roasted by AI on my job application. Grade: ${grade}. Find out why you keep getting rejected!`;

	const shareTwitter = () => {
		const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
		window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420");
	};

	const shareLinkedIn = () => {
		// LinkedIn only takes URL, the preview will show OG tags
		const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
		window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=550,height=420");
	};

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for older browsers
			const textarea = document.createElement("textarea");
			textarea.value = url;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap justify-center gap-3">
				{/* Twitter/X Button */}
				<Button
					onClick={shareTwitter}
					className="bg-black hover:bg-zinc-900 text-white border border-zinc-700 gap-2"
				>
					<XIcon className="w-4 h-4" />
					Share on X
				</Button>

				{/* LinkedIn Button */}
				<Button
					onClick={shareLinkedIn}
					className="bg-[#0A66C2] hover:bg-[#004182] text-white gap-2"
				>
					<Linkedin className="w-4 h-4" />
					Share on LinkedIn
				</Button>

				{/* Copy Link Button */}
				<Button
					onClick={copyLink}
					variant="outline"
					className="border-zinc-700 hover:bg-zinc-800 gap-2"
				>
					{copied ? (
						<>
							<Check className="w-4 h-4 text-green-400" />
							<span className="text-green-400">Copied!</span>
						</>
					) : (
						<>
							<Copy className="w-4 h-4" />
							Copy Link
						</>
					)}
				</Button>
			</div>

			{/* Viral prompt */}
			<p className="text-xs text-zinc-500 text-center">
				😈 The worse your grade, the more viral it goes
			</p>
		</div>
	);
}
