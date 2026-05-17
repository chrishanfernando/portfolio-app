# Tasks

- [x] Add `risk_profiles` table to `src/db/schema.ts`
- [x] Generate Drizzle migration for `risk_profiles` *(note: this was orphaned by a number clash with the benchmarks migration — fixed under `fix-risk-profile-missing-migration`)*
- [x] Author questionnaire + scoring + tier mapping in `src/lib/risk-profiling.ts`
- [x] Define `TIER_PROFILES` ETF allocations per tier (sum to 100)
- [x] Implement `GET /api/risk-profile` (returns row or `null`)
- [x] Implement `POST /api/risk-profile` with upsert + optional `applyTargets`
- [x] Build `/risk-profile` page UI (questionnaire form + result + apply-to-targets button)
- [x] Add `risk-profiles` capability spec
- [x] Manually verify: take questionnaire, resubmit (no duplicate row), apply targets (old rows replaced, new totals sum to 100)
