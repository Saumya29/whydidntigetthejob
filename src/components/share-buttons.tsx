"use client";

import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  grade: string;
  url: string;
}

export function ShareButtons({ grade, url }: ShareButtonsProps) {
  const tweetText = `I just got roasted by AI for my job application. Grade: ${grade} 💀\n\nFind out why YOU keep getting rejected:`;
  // LinkedIn sharing uses URL only

  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  const shareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch {
      // Fallback
      prompt("Copy this link:", url);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        onClick={shareTwitter}
        variant="outline"
        className="border-zinc-700 hover:bg-zinc-800"
      >
        𝕏 Share on X
      </Button>
      <Button
        onClick={shareLinkedIn}
        variant="outline"
        className="border-zinc-700 hover:bg-zinc-800"
      >
        in Share on LinkedIn
      </Button>
      <Button
        onClick={copyLink}
        variant="outline"
        className="border-zinc-700 hover:bg-zinc-800"
      >
        🔗 Copy Link
      </Button>
    </div>
  );
}
