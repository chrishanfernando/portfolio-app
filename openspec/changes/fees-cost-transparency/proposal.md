# Change: Fee & cost transparency dashboard

## Why

The product competes against paid robo-advisors (Stockspot et al.) whose
explicit value is "set-and-forget" plus a published fee schedule. Today the
app tracks transactions and computes returns but is silent on what the user
*pays* — both fund management fees (MER) baked into ETF prices and brokerage
paid at trade time. A user therefore cannot answer "is the DIY route saving me
money vs a robo-advisor?", which is the single strongest reason to choose this
product over a paid alternative. A first-class fees view turns an implicit
strength into a visible one.

## What

- Capture brokerage per trade
  - Add nullable `fee_aud` to `transactions`.
  - Update existing CSV/XLSX/PDF/email importers (CMC, Stake, Swyftx, IR) to
    extract brokerage into `fee_aud` instead of folding it into `total_aud`.
  - `total_aud` keeps its current meaning (gross consideration *including*
    fee) for backward compatibility; `fee_aud` is the explicit slice.
  - Historical rows stay `fee_aud = null` (unknown). Surfaces in UI as
    "unknown" rather than zero.
- Capture per-asset MER
  - Add nullable `mer_bps` (basis points) to `assets`.
  - Seed defaults from a curated AU-ETF table on asset creation when the
    symbol matches (VAS, VGS, VAF, VIF, VGE, NDQ, VAP, IVV, A200, etc. —
    extends the table already in `src/lib/risk-profiling.ts`).
  - User can override per asset in `/holdings/[id]` edit.
- Capture comparison advisor fee
  - Add `comparison_advisor_name` (text, default `"Stockspot"`) and
    `comparison_advisor_fee_bps` (int, default `66`) to `profiles`.
  - User-editable per profile via settings UI.
- New `fees` capability
  - `GET /api/fees` returns, for the active profile:
    - `weightedMerBps` and `projectedAnnualMerAud`
    - per-holding MER table `[ { assetId, ticker, marketValueAud, merBps, annualCostAud } ]`
    - `lifetimeBrokerageAud` and `unknownBrokerageHoldings` (count of
      transactions with `fee_aud = null`)
    - `comparisonAdvisor: { name, feeBps, projectedAnnualAud }`
    - `dragProjection: [ { years: 10|20|30, withFeesAud, withoutFeesAud, lostAud } ]`
      using a constant-balance assumption documented in `design.md`.
- New `/fees` page rendering the above (headline tile, per-asset table,
  comparison panel, drag-projection chart).
- Dashboard widget showing the headline weighted MER % + $/yr with a link to
  `/fees`.

## Impact

- Affected capabilities: `fees` (new), `dashboard` (added widget requirement),
  `transactions` (record shape + importer behaviour), `assets` (record shape +
  seed-MER behaviour), `profiles` (record shape + settings).
- Breaking? No — `fee_aud` and `mer_bps` are nullable; existing code paths
  treat them as zero/unknown.
- DB migration? Yes — one Drizzle migration adds three nullable columns
  (`transactions.fee_aud`, `assets.mer_bps`) and two on `profiles`
  (`comparison_advisor_name`, `comparison_advisor_fee_bps`).
- Config / env vars? None.
