import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getResult } from "@/lib/storage";
import { ShareButtons } from "@/components/share-buttons";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;
  const result = await getResult(id);

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

  const gradeColors: Record<string, string> = {
    A: "bg-green-500",
    B: "bg-lime-500",
    C: "bg-yellow-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };

  return (
    <main className="min-h-screen p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-red-400 border-red-400/50">
            Your Rejection Letter
          </Badge>
          <h1 className="text-3xl font-bold">The Verdict Is In</h1>
        </div>

        {/* Grade Card - Screenshot friendly */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm uppercase tracking-wider">Roast Grade</p>
                <p className="text-6xl font-bold mt-2">{result.grade}</p>
              </div>
              <div className={`w-24 h-24 rounded-full ${gradeColors[result.grade] || "bg-zinc-500"} flex items-center justify-center`}>
                <span className="text-4xl font-bold text-white">{result.grade}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-xl text-zinc-300 italic">&ldquo;{result.headline}&rdquo;</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              🔥 The Brutal Truth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Why you didn't get it */}
            <div>
              <h3 className="font-semibold text-red-400 mb-2">Why You Got Rejected</h3>
              <p className="text-zinc-300 whitespace-pre-wrap">{result.rejection}</p>
            </div>

            {/* Skill gaps */}
            <div>
              <h3 className="font-semibold text-orange-400 mb-2">Skill Gaps</h3>
              <ul className="space-y-2">
                {result.skillGaps.map((gap: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-orange-400">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>

            {/* What they probably said */}
            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
              <h3 className="font-semibold text-zinc-400 mb-2 text-sm uppercase">
                What the hiring manager probably said:
              </h3>
              <p className="text-zinc-300 italic">&ldquo;{result.hiringManagerQuote}&rdquo;</p>
            </div>
          </CardContent>
        </Card>

        {/* Improvement Tips */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
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

        {/* Share Section */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-zinc-400">Share your roast (if you dare)</p>
          <ShareButtons 
            grade={result.grade} 
            url={`${process.env.NEXT_PUBLIC_URL || "https://whydidntigetthejob.com"}/results/${id}`}
          />
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 mb-4">Got another rejection to process?</p>
          <Link href="/">
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
              Get Roasted Again
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
