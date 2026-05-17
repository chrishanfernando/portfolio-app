# Project Context

## Purpose

A self-hosted personal investment portfolio tracker. Records buy/sell/dividend transactions across crypto and equity platforms, normalises everything to AUD, fetches daily prices from Yahoo Finance, and shows holdings, dashboard, charts, and rebalance recommendations against category targets. Multi-user (email/password or Google OAuth), with multiple portfolios ("profiles") per user. Self-hostable on Vercel or a Raspberry Pi.

## Tech Stack

- **Runtime**: Next.js 16 (App Router), React 19, Node 20+
- **Language**: TypeScript (strict)
- **DB**: SQLite via `@libsql/client` + Drizzle ORM. Local file (`local.db`) in dev; Turso in prod (optional).
- **Migrations**: `drizzle-kit` (schema in `src/db/schema.ts`, migrations in `drizzle/`). `drizzle-kit migrate` runs as part of `npm run build` so deploys apply pending migrations automatically.
- **Auth**: Better Auth — email/password (with Resend verification) + Google OAuth; session in DB, cookie-presented. Legacy `bcryptjs` verifier kept so accounts migrated from the original single-password install still sign in. Middleware in `src/middleware.ts`.
- **UI**: Tailwind CSS v4, shadcn/ui (Radix primitives), `lucide-react`, `next-themes`, `sonner` toasts, `recharts`
- **Forms**: `react-hook-form` + `zod` via `@hookform/resolvers`
- **Prices**: `yahoo-finance2`
- **Imports**: `xlsx` (CSV/XLSX), `pdf-parse` (PDF), `imapflow` + `mailparser` (email auto-import)
- **Email**: Resend (optional notifications)
- **Deployment**: Vercel (`vercel.json`) or self-hosted on Raspberry Pi (`setup-pi.sh`: PM2 + nginx)

## Project Conventions

### Code Style

- TypeScript strict mode; prefer `interface` for public shapes, `type` for unions/aliases.
- Path alias `@/` → `src/`.
- Server-only modules go in `src/lib/` and `src/db/`. They must never be imported from client components.
- API routes return `NextResponse.json(...)`. Error path: `{ error: string }` with appropriate status; success path is the bare payload.
- Keep route handlers thin — push business logic into `src/lib/`.
- All monetary values stored and computed in AUD (`*_aud` columns). Foreign-currency context is preserved in `unit_price_local`, `local_currency`, `fx_rate`.
- Dates: ISO `YYYY-MM-DD` strings in DB; `date-fns` for formatting.

### Architecture Patterns

- **App Router** with server components by default; client components opt in with `"use client"`.
- **User + profile scoping**: every user-scoped table carries a `user_id`; profile-scoped tables additionally carry `profile_id`. Server routes resolve the user from the Better Auth session and the active profile from the `x-profile-id` header / `?profileId=` query / `profile` cookie via `src/lib/profile.ts`, validating ownership before any read or write.
- **Onboarding gate**: first-time users are redirected to `/risk-profile` until they complete the questionnaire. See `risk-profiles` and `profiles` specs.
- **Derived state**: holdings, dashboard summary, drift, and value history are computed on demand from `transactions` + `prices` (no materialised holdings table). See `src/lib/calculations.ts` and `src/lib/rebalance.ts`.
- **Cron endpoints** under `/api/cron/*` are gated by `CRON_SECRET` (query param or header) and excluded from auth middleware.
- **Importers** are per-source modules under `src/lib/` (`import-parser.ts`, `cmc-import.ts`, `cmc-email-parser.ts`) plus per-source routes in `src/app/api/import/<source>/`.

### Testing Strategy

No automated tests today. Manual verification against a seeded local DB is the current bar. New behaviour should at minimum be exercised end-to-end via the dev server before merge. Adding Vitest + a small integration harness is a known follow-up.

### Git Workflow

- `main` is the long-lived branch and what deploys.
- Feature branches: `feature/<short-slug>` or `fix/<short-slug>`.
- Commits in imperative mood; short subject + optional body.
- PRs squash-merge into `main`.
- Repo is private until the author opts to flip it public.

## Domain Model (current)

- **user / account / session / verification**: Better Auth tables. `user` is the top-level owner of all data.
- **profiles**: a portfolio namespace, owned by a user (`user_id`). Carries `benchmark_symbol` (Yahoo symbol, default `VAS.AX`).
- **assets**: tracked instrument under a profile (symbol, display ticker, Yahoo symbol, category, platform, active flag).
- **transactions**: buy/sell/dividend/split events; AUD-normalised with split-adjusted quantity.
- **prices**: per-asset daily closing price in AUD (and optional USD + FX rate).
- **category_targets**: target % per category per profile, with a drift threshold.
- **risk_profiles**: one row per (user, profile) — risk score, tier, raw answers; drives the onboarding gate and the suggested ETF allocation.
- **settings**: app-wide singleton — notification email, last-run timestamps for cron jobs. (Legacy `password_hash` column kept only for the bcrypt-fallback migration path.)
- **cmc_account_mappings**: maps a CMC account number to a profile, used by IMAP auto-import.

## Domain Context

- "CMC" = CMC Markets (AU broker). "Stake" = stake.com.au (AU broker). "Swyftx" = AU crypto exchange. "IR" = Independent Reserve (AU crypto exchange).
- Splits and renames are reflected via `split_multiplier` and `adjusted_qty` on transactions.
- Categories are free-form strings (e.g. `Crypto`, `AU Equities`, `US Equities`, `Gold`); they are the unit of rebalance targeting.

## Important Constraints

- Multi-user but **strictly isolated**. Every server route MUST scope reads and writes by `user_id` (or by `profile_id` whose parent profile belongs to the user). No admin role, no cross-user reads. See the Auth and Profiles specs.
- Must run on a Raspberry Pi (low memory). Avoid heavy build-time work and keep runtime memory modest.
- Data is treated as authoritative once entered; importers must be idempotent (check for duplicate transactions before insert).
- Transactional email requires a verified Resend sender domain — no sandbox fallback. See the Settings spec.

## External Dependencies

- **Yahoo Finance** (`yahoo-finance2`): prices and AUD/USD FX. No key. Subject to upstream rate-limits and occasional symbol churn.
- **Turso / libSQL**: optional remote SQLite. Falls back to `file:local.db`.
- **Resend**: optional outbound email. Only used when `RESEND_API_KEY` is set.
- **IMAP** (Gmail by default): polled by `/api/cron/email` to auto-ingest CMC trade confirmations.
