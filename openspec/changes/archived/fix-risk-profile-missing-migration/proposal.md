# Change: Fix orphaned risk_profiles migration; run migrate on build

> Shipped 2026-05-16 (commit d2db018, PR #24). Backfilled 2026-05-17.

## Why

PRs #21 (risk profiling) and #22 (benchmarking) both generated migration
`0002` independently on their feature branches. When #22 merged first, its
`0002_*.sql` was registered in `drizzle/meta/_journal.json`. When #21 merged
afterwards its `0002_*.sql` file was carried into `drizzle/` but the journal
was never updated, so drizzle-kit silently skipped it. The result: production
`POST /api/risk-profile` calls failed with `no such table: risk_profiles`. The
underlying problem isn't the conflict itself — it's that "did we forget a
migration" was not in any deploy check.

## What

- Regenerate the risk_profiles migration as `0003_ambitious_doctor_spectrum.sql`
  and register it in `drizzle/meta/_journal.json` so it actually runs.
- Add `TURSO_AUTH_TOKEN` to `drizzle.config.ts` so `drizzle-kit migrate` can
  authenticate against the production Turso instance from Vercel build.
- Wire `drizzle-kit migrate` into the build script:
  `"build": "drizzle-kit migrate && next build"`. Every deploy now applies
  pending migrations before serving traffic.

## Impact

- Affected capabilities: none (infra fix); referenced from `project.md` build
  convention.
- Breaking? No.
- DB migration? Yes — the previously-orphaned `risk_profiles` finally gets
  applied to production.
- Config / env vars? `TURSO_AUTH_TOKEN` must now be available in the build
  environment (Vercel project env).
