# WhyDidntIGetTheJob

> The rejection letter you deserved but never got.

Paste your resume and job description. Get brutal AI feedback on why you didn't get the job.

## Demo

<video src="demo.mp4" width="100%" autoplay loop muted playsinline></video>

![Demo](demo.gif)

## Features

- 🔥 Brutal but constructive AI feedback
- 📊 Roast grade (A-F)
- 🎯 Skill gap breakdown
- 💬 "What the hiring manager probably said"
- 💡 Actionable improvement tips
- 📸 Screenshot-friendly results
- 🔗 Shareable results page

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe Checkout
- **AI:** OpenAI GPT-4o
- **Deployment:** Vercel

## Getting Started

1. Clone and install:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Fill in your API keys
```

3. Run locally:
```bash
pnpm dev
```

4. Set up Stripe webhook (for local dev):
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `NEXT_PUBLIC_URL` | Your app URL (for redirects) |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/whydidntigetthejob)

1. Connect your repo to Vercel
2. Add environment variables
3. Deploy
4. Set up Stripe webhook pointing to `https://yourdomain.com/api/webhook`

## License

MIT
