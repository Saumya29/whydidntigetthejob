# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Run Next.js dev server
pnpm dev:convex       # Run Convex dev server (separate terminal)
pnpm build            # Build for production
pnpm lint             # Lint with Biome
pnpm format           # Auto-fix with Biome

# Stripe local webhook forwarding (required for payment testing)
stripe listen --forward-to localhost:3000/api/webhook
```

Both `pnpm dev` and `pnpm dev:convex` must run simultaneously during development.

## Architecture

**WhyDidntIGetTheJob** is a Next.js 14 App Router app that takes a resume + job description and uses GPT-4o to generate a brutally honest rejection analysis. Results are stored persistently and shareable via URL.

### Key Data Flow

1. User submits resume + job description on `/analyze`
2. `POST /api/analyze` — rate-limited, auth-gated endpoint that calls GPT-4o and saves result to Convex
3. User is redirected to `/results/[id]` — publicly shareable result page

### Tech Stack

- **Auth**: Clerk (`@clerk/nextjs`) — middleware in `src/middleware.ts`
- **Database**: Convex — real-time backend with schema in `convex/schema.ts`
- **Payments**: Stripe Checkout — webhook at `/api/webhook`, checkout at `/api/checkout`
- **AI**: OpenAI GPT-4o via `openai` package
- **Rate limiting**: Upstash Redis (`@upstash/ratelimit`); falls back to in-memory for dev
- **PDF parsing**: `pdf-parse` via `/api/parse-resume`
- **Error tracking**: Sentry (configured in `sentry.*.config.ts`)
- **Linting/formatting**: Biome (not ESLint/Prettier)

### Convex Backend (`convex/`)

- `schema.ts` — defines tables: `users`, `freeRoasts`, `results`, `payments`, `analytics`
- `users.ts` — `getOrCreate`, `useRoast`, `addRoasts`, `getStats` mutations/queries
- `freeTier.ts` — tracks guest email usage of free tier
- `results.ts` — save/retrieve analysis results
- `admin.ts` — admin stats queries

Users get 3 free roasts on signup (`FREE_ROASTS = 3` in `convex/users.ts`). After that, they need to purchase via Stripe. Stripe webhook (`/api/webhook`) calls `recordPayment` which updates Convex via `users.addRoasts`.

### API Routes (`src/app/api/`)

| Route | Purpose |
|-------|---------|
| `/api/analyze` | Main analysis endpoint — auth required, rate-limited |
| `/api/parse-resume` | Extract text from uploaded PDF |
| `/api/checkout` | Create Stripe checkout session |
| `/api/webhook` | Stripe webhook — adds roasts after payment |
| `/api/og/[id]` | Dynamic OG image generation for sharing |
| `/api/pdf/[id]` | Generate PDF of results |
| `/api/user/check` | Check/create user account (public) |
| `/api/admin/stats` | Admin dashboard stats |

### Auth & Route Protection

Clerk middleware in `src/middleware.ts` protects `/dashboard` and `/api/user/*`. Most routes are public — the analyze endpoint handles its own auth check internally (returns 401 if not authenticated, 402 if no roasts remaining).

### Linting Rules

Biome is configured in `biome.json`. Key deviations from defaults:
- Tabs for indentation, 100 char line width, double quotes
- `noNonNullAssertion`, `noArrayIndexKey`, `useButtonType`, `noSvgWithoutTitle` are all disabled

### Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
OPENAI_API_KEY
NEXT_PUBLIC_URL
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_ADMIN_PASSWORD
UPSTASH_REDIS_REST_URL      # Optional — rate limiting falls back to in-memory
UPSTASH_REDIS_REST_TOKEN    # Optional
```
