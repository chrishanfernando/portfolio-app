# Change: Risk profiling with ETF recommendations

> Shipped 2026-05-14 (commits 1e81198 plan, 6a9308f implementation, PR #21). Backfilled 2026-05-17.

## Why

A new user lands in an empty portfolio and doesn't know what targets to set.
A short questionnaire — time horizon, income stability, loss tolerance, goal,
emergency fund — gives us enough signal to recommend a tier (conservative /
balanced / growth / aggressive) and a concrete diversified-ETF allocation. The
recommendation also seeds `category_targets`, so the rebalance engine has
something to work against on day one.

## What

- Add a `risk_profiles` table: `(user_id, profile_id)` unique, with
  `risk_score`, `risk_tier`, raw `answers` JSON, timestamps.
- Add the 5-question questionnaire (max score 13) and tier mapping
  (≤3 conservative · ≤6 balanced · ≤9 growth · >9 aggressive) in
  `src/lib/risk-profiling.ts`.
- Add `TIER_PROFILES` — a fixed table of ETFs per tier (ticker, name, category
  Growth/Defensive, allocationPct, mer, aum, rationale). Allocations sum to 100.
- `GET /api/risk-profile` returns the active profile's saved row or `null`.
- `POST /api/risk-profile` accepts `{ answers, applyTargets? }`. Saves the row
  (upsert); when `applyTargets: true`, deletes existing `category_targets` for
  the active profile and writes new rows grouped by ETF category.

## Impact

- Affected capabilities: `risk-profiles` (new).
- Breaking? No.
- DB migration? Yes — `risk_profiles`.
- Config / env vars? None.
