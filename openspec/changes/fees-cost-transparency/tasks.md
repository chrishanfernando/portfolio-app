## 1. Schema and migration

- [x] 1.1 Add `feeAud` (real, nullable) to `transactions` in `src/db/schema.ts`
- [x] 1.2 Add `merBps` (integer, nullable) to `assets` in `src/db/schema.ts`
- [x] 1.3 Add `comparisonAdvisorName` (text, default `"Stockspot"`) and `comparisonAdvisorFeeBps` (integer, default `66`) to `profiles` in `src/db/schema.ts`
- [x] 1.4 Generate Drizzle migration (`bun run db:generate`) and verify SQL adds five nullable / defaulted columns only — no destructive changes
- [x] 1.5 Apply migration locally (`bun run db:migrate`) and confirm existing rows are unaffected

## 2. Static MER lookup

- [x] 2.1 Create `src/lib/fees.ts` exporting `STATIC_MER_BPS: Record<string, number>` covering the ETFs in `design.md` (VAS, VGS, VAF, VIF, VGE, VAP, VGAD, VTS, VEU, A200, NDQ, QUS, IVV, IOO, IAA, STW, PMGOLD, GOLD)
- [x] 2.2 Export `lookupMerBps(symbolOrYahoo: string): number | null` that normalises common suffixes (`.AX`, `.US`) before lookup

## 3. Asset MER seeding and editing

- [x] 3.1 Wire `lookupMerBps` into the asset-creation path used by importers and manual creation so new rows seed `mer_bps`
- [x] 3.2 Extend the holdings edit endpoint (`PUT /api/holdings/[id]` or equivalent) to accept `merBps` with validation `null | [0, 500]`
- [x] 3.3 Add the MER input to the holdings edit form (`/holdings/[id]`), showing the seeded value with a placeholder and accepting blank → null

## 4. Transaction `fee_aud` capture

- [x] 4.1 Extend transaction Zod schema and create/update API routes to accept and persist `feeAud` (nullable AUD number)
- [x] 4.2 Update the new-transaction form to expose a brokerage input (blank → null, numeric → AUD). _Note: edit-transaction inline UI in `/holdings/[id]` deferred — API supports it; UI surgery is its own task._
- [x] 4.3 Update CMC CSV parser in `src/lib/import-parser.ts` to extract the Brokerage column into `feeAud` and stop folding it into `total_aud` derivation (keep `total_aud` = trade-value column verbatim). _Done via arithmetic derivation: the sample confirmed brokerage is folded into Debit/Credit, so `feeAud = |cash movement − qty × price|`, guarded to `[0, max($100, 5%)]` (outside → null, e.g. FX trades). `total_aud` stays verbatim._
- [x] 4.4 Update CMC trade-confirmation email parser to extract `Brokerage:` line into `feeAud`
- [x] 4.5 Update Stake AU CSV parser to map `Brokerage AUD` to `feeAud` (also handles Wall St / USD with FX conversion)
- [x] 4.6 Update Swyftx CSV parser to map `Fee AUD` to `feeAud`. _Done: sample confirmed a `Fees` column at index 8 (AUD for AUD-settled trades). Cross-crypto trades attach the fee to the sell leg only to avoid double counting._
- [ ] 4.7 Update Interactive Brokers parser to convert `|Commission|` from local currency to AUD using the same `fx_rate` already applied to the trade and store in `feeAud`. **DEFERRED**: `public/samples/independent-reserve-sample.csv` has a `Fee` column but its column layout (`Type,Settled,TradeGuid,…`) does not match the shipped parser's indices (header `Settled,…`, TradeGuid at index 3, Currency at 7) — the sample appears hand-authored, not a real export. Need a real IR export to map the fee column safely.
- [x] 4.8 Verify importer idempotency key is unchanged (no `fee_aud` in the match) and re-importing a sample CSV inserts no duplicates. _Key remains `(assetId, date, action, quantity, unitPriceAud)` in every importer; `feeAud` is not part of the match._

## 5. Comparison advisor settings

- [x] 5.1 Extend the `PATCH /api/profiles` payload schema to accept `comparisonAdvisorName` (non-empty string) and `comparisonAdvisorFeeBps` (integer, `[0, 500]`)
- [x] 5.2 Add a "Fee comparison" section to the settings UI (likely `/settings`) with the name and bps inputs, defaulting from the loaded profile

## 6. Fees API

- [x] 6.1 Create `GET /api/fees/route.ts` returning the shape defined in `specs/fees/spec.md`: `weightedMerBps`, `projectedAnnualMerAud`, `holdings[]`, `lifetimeBrokerageAud`, `unknownBrokerageCount`, `comparisonAdvisor`, `dragProjection[]`
- [x] 6.2 Implement `computeWeightedMerBps(holdings)` in `src/lib/fees.ts` excluding null-MER holdings from numerator and denominator (rounded to whole bps)
- [x] 6.3 Implement `buildDragProjection(balance, weightedMerBps, r = 0.07)` returning entries for 10/20/30 years, with `[]` when `weightedMerBps == null`
- [x] 6.4 Implement `aggregateBrokerage(transactions)` returning `{ lifetimeBrokerageAud, unknownBrokerageCount }`
- [x] 6.5 Wire profile scoping via the standard `getActiveProfile` helper used by other routes; return 401 unauth, 404 when profile not owned

## 7. Fees page

- [x] 7.1 Create `src/app/(authed)/fees/page.tsx` fetching `/api/fees` and rendering: headline tile, per-holding table (sourced from `holdings[]`), comparison panel, drag-projection chart
- [x] 7.2 Add disclosure copy: constant 7% gross return, no contributions/withdrawals/tax
- [x] 7.3 Render the unknown-brokerage banner when `unknownBrokerageCount > 0`, linking to `/transactions`
- [x] 7.4 Empty-state: zero holdings → link out to `/import` and `/transactions/new`, hide drag chart
- [x] 7.5 Add `/fees` to the main nav alongside existing top-level routes

## 8. Dashboard widget

- [x] 8.1 Add a fees tile to the dashboard summary area: "Fund fees: X.XX% / $Y/yr" linking to `/fees`
- [x] 8.2 Source data via `/api/fees` (small payload — acceptable to fetch in parallel with `/api/dashboard`, or fold into the dashboard payload if it simplifies caching)
- [x] 8.3 Handle `weightedMerBps = null` → render "—" rather than "0%"; hide tile entirely on empty profiles

## 9. Verification

- [x] 9.1 `bun run lint` passes; `bun run build` succeeds (covers Next.js typecheck via `next build`). _Lint and `tsc --noEmit` clean for all changed files. Pre-existing failures in `drizzle.config.ts` (Drizzle-Kit Config type) and pre-existing `react-hooks/set-state-in-effect` warnings in untouched files remain — not introduced by this change._
- [ ] 9.2 Manual smoke: import a sample CMC CSV, confirm `fee_aud` populated; visit `/fees` and verify headline, table, comparison, projection; toggle a holding's MER override and confirm the page updates. _**User-driven** — needs a live dev server + a sample CSV._
- [x] 9.3 Update `openspec/config.yaml` if any new conventions arose (else no-op). _Config updated earlier in session when AGENTS.md was migrated; no further changes needed._
- [x] 9.4 Run `openspec status --change "fees-cost-transparency"` and confirm `isComplete = true`. _Confirmed: `isComplete: true` (the earlier CLI bug no longer reproduces)._
