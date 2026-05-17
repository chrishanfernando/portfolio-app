# Change: Per-profile benchmark comparison and alpha tracking

> Shipped 2026-05-16 (commit 1bca721, PR #22). Backfilled 2026-05-17.

## Why

A return number on its own ("you're up 6.2%") doesn't tell the user whether
they're beating the market. To answer "would I have been better off in VAS?",
we mirror every transaction the user made onto a benchmark ETF and plot the
two value series side-by-side. The difference is alpha — the bit the
ledger can attribute to the user's stock picking + timing rather than market
drift.

## What

- Add `benchmark_symbol` column to `profiles` (Yahoo symbol, default
  `VAS.AX`).
- Compute the benchmark series as a **shadow portfolio**: for each real
  transaction, mirror a buy/sell of `benchmark_symbol` at the first available
  trading day on/after the transaction date.
- `GET /api/dashboard` adds `benchmarkSymbol`, `benchmarkReturnPct`, and
  `alpha` to `summary` when a benchmark series is available, and emits
  parallel benchmark points in `history`.
- Dashboard UI: portfolio value line + benchmark line on the same chart, plus
  an "Vs Benchmark · {symbol}" card showing alpha.
- Degrades gracefully — if benchmark prices are missing or the profile has no
  transactions, the response omits the benchmark fields rather than erroring.

## Impact

- Affected capabilities: `benchmarks` (new), `profiles` (new column), `dashboard`
  (extended summary).
- Breaking? No (additive).
- DB migration? Yes — `profiles.benchmark_symbol`.
- Config / env vars? None.
