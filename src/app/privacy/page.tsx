import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "How WhyDidntIGetTheJob collects, uses, and protects your data.",
};

export default function PrivacyPage() {
	return (
		<main className="min-h-[calc(100vh-3.5rem)] px-4 py-12 md:py-16">
			<article className="max-w-3xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl md:text-4xl font-bold text-white font-mono">Privacy Policy</h1>
					<p className="text-zinc-500 text-sm font-mono">Last updated: March 31, 2026</p>
				</header>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">What We Collect</h2>
					<p className="text-zinc-400 leading-relaxed">
						When you use WhyDidntIGetTheJob, we collect the following information:
					</p>
					<ul className="list-disc list-inside text-zinc-400 space-y-2 pl-2">
						<li>
							<strong className="text-zinc-300">Resume text</strong> — The text you paste or upload
							from your resume. We do not store the original PDF file.
						</li>
						<li>
							<strong className="text-zinc-300">Job description text</strong> — The job posting text
							you paste or fetch via URL.
						</li>
						<li>
							<strong className="text-zinc-300">Email address</strong> — Collected through our
							authentication provider (Clerk) when you sign up.
						</li>
						<li>
							<strong className="text-zinc-300">Analysis results</strong> — The AI-generated
							feedback, grade, and recommendations produced from your submission.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">How We Process Your Data</h2>
					<p className="text-zinc-400 leading-relaxed">
						Your resume and job description text are sent to OpenAI&apos;s API (GPT model) to
						generate the analysis. OpenAI processes this data according to their{" "}
						<a
							href="https://openai.com/policies/api-data-usage-policies"
							target="_blank"
							rel="noopener noreferrer"
							className="text-red-400 hover:underline"
						>
							API data usage policies
						</a>
						. OpenAI does not use API inputs to train their models.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">How We Store Your Data</h2>
					<p className="text-zinc-400 leading-relaxed">
						Analysis results are stored in our database (Convex) and are accessible via a unique,
						shareable URL. Results are stored indefinitely unless you request deletion. Your resume
						and job description text are included in the stored result so you can reference them
						later.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">Third-Party Services</h2>
					<p className="text-zinc-400 leading-relaxed">
						We use the following third-party services:
					</p>
					<ul className="list-disc list-inside text-zinc-400 space-y-2 pl-2">
						<li>
							<strong className="text-zinc-300">Clerk</strong> — Authentication and user management
						</li>
						<li>
							<strong className="text-zinc-300">OpenAI</strong> — AI analysis of your resume and job
							description
						</li>
						<li>
							<strong className="text-zinc-300">Convex</strong> — Database for storing analysis
							results and user data
						</li>
						<li>
							<strong className="text-zinc-300">Sentry</strong> — Error tracking and performance
							monitoring (no PII is sent)
						</li>
						<li>
							<strong className="text-zinc-300">Upstash</strong> — Rate limiting to prevent abuse
						</li>
						<li>
							<strong className="text-zinc-300">PostHog</strong> — Product analytics (page views,
							feature usage). No personal data is tracked.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">Cookies</h2>
					<p className="text-zinc-400 leading-relaxed">
						We use only essential cookies required for authentication (via Clerk). We do not use
						advertising or tracking cookies.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">Shareable Results</h2>
					<p className="text-zinc-400 leading-relaxed">
						Each analysis result has a unique URL that you can share. Anyone with the link can view
						the result. We do not submit these URLs to search engines. If you share your result link
						publicly, the content will be visible to anyone who follows it.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">Your Rights</h2>
					<p className="text-zinc-400 leading-relaxed">
						You can request deletion of your data (including all stored analysis results) by
						emailing{" "}
						<a
							href="mailto:privacy@whydidntigetthejob.com"
							className="text-red-400 hover:underline"
						>
							privacy@whydidntigetthejob.com
						</a>
						. We will process deletion requests within 30 days.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-white font-mono">Changes to This Policy</h2>
					<p className="text-zinc-400 leading-relaxed">
						We may update this privacy policy from time to time. Changes will be posted on this page
						with an updated date.
					</p>
				</section>
			</article>
		</main>
	);
}
