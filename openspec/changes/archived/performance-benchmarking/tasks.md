# Tasks

- [x] Add `benchmark_symbol` to `profiles` (default `VAS.AX`) + migration
- [x] Implement `getBenchmarkValueHistory(profileId)` shadow-portfolio computation in `src/lib/calculations.ts`
- [x] Map each transaction date to the first benchmark trading day on or after it
- [x] Extend `GET /api/dashboard` summary with `benchmarkSymbol` / `benchmarkReturnPct` / `alpha` when available
- [x] Emit parallel benchmark points in `history`
- [x] Dashboard chart: benchmark line + "Vs Benchmark · {symbol}" alpha card
- [x] Y-axis formatter copes with small portfolios ($X instead of $0k)
- [x] Add `benchmarks` capability spec; extend `profiles` and `dashboard` specs
- [x] Manually verify: benchmark line tracks for a profile with transactions; profile with no transactions shows portfolio chart with no benchmark; switching `benchmark_symbol` to an unbackfilled ticker does not error
