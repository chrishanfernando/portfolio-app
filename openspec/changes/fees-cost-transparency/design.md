# Design Notes — Fees & cost transparency

## Data-model decisions

### `transactions.fee_aud` (nullable)
Brokerage was historically baked into `total_aud` (CMC parser comment in
`src/lib/import-parser.ts:131` confirms it). We do **not** retroactively
re-derive it: we add a nullable column, populate going forward from importers,
and surface "unknown" in the UI where it is null. `total_aud` keeps its
existing semantic (gross consideration, fees included), so existing cost-basis
and P/L math is untouched.

Why not subtract `fee_aud` from `total_aud` on save? Because doing so would
change the meaning of `total_aud` mid-history and break the importer-idempotency
key, which matches on `unit_price_aud`. Keep both: `total_aud` is what hit the
brokerage account; `fee_aud` is the breakdown.

### `assets.mer_bps` (nullable, int basis points)
Basis points (1 bp = 0.01%) avoid floating-point ambiguity. `null` means
unknown → excluded from the weighted-MER denominator (don't pretend zero).

A static lookup `STATIC_MER_BPS` in `src/lib/fees.ts` seeds defaults at asset
creation. The user can override via the holdings edit UI. We extend the
already-existing ETF table in `src/lib/risk-profiling.ts` rather than
duplicating it.

### `profiles.comparison_advisor_*`
Stored per profile, not per user, so SMSF vs personal can compare against
different baselines (a SMSF user may compare against InvestSMART rather than
Stockspot). Default: `("Stockspot", 66)` — Stockspot's published top-tier rate
of 0.66% pa. User-editable; no validation beyond `0 <= bps <= 500`.

## Drag-projection math

For each horizon ∈ {10, 20, 30}:

- `withFees = balance * (1 + r - f)^years`
- `withoutFees = balance * (1 + r)^years`
- `lost = withoutFees - withFees`

Where:
- `balance` = current `totalValue` for the active profile
- `r` = assumed gross return = `0.07` (7%/yr nominal). Document this assumption
  in the UI tile and make it editable in a follow-up; not in v1 scope.
- `f` = `weightedMerBps / 10000`

We do **not** model contributions, withdrawals, rebalancing churn, or tax —
this is a directional cost-of-fees illustration, not a forecast. UI must label
it as such.

## Lookup table coverage

`STATIC_MER_BPS` v1 covers the ETFs in `TIER_PROFILES` plus the common
substitutes:
- Vanguard AU: VAS (7), VGS (18), VAF (10), VIF (20), VGE (48), VAP (23), VGAD (20), VTS (3), VEU (8)
- BetaShares: A200 (4), NDQ (48), QUS (14)
- iShares: IVV (4), IOO (9), IAA (44)
- State Street: STW (5)
- Gold: PMGOLD (15), GOLD (40)

Numbers are issuer-published as of authoring; documented as a starting point
not a contract. Users override if they go stale.

## Out of scope (deliberate, P1+)

- Brokerage YTD / per-platform breakdown — column captured but no v1 UI.
- Editable return assumption in the drag projection — fixed at 7% in v1.
- Contribution-aware projection (DCA scenarios) — needs the recurring-contributions
  feature.
- Fetching MER from issuer feeds — brittle, not worth it for v1.
- Per-trade brokerage backfill from historical PDFs — manual edit only.

## UX placement

`/fees` is a new top-level route reachable from the main nav and from the
dashboard widget. Dashboard widget is intentionally small (single tile: "Fund
fees: 0.18% / $342/yr") so it doesn't crowd existing summary tiles.
