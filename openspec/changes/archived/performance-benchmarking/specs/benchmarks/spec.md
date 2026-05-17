# Benchmarks — delta (NEW capability)

This change introduces the `benchmarks` capability. Full requirements live in
`openspec/specs/benchmarks/spec.md`:

- **Per-profile benchmark symbol** — `profiles.benchmark_symbol`, default
  `"VAS.AX"`
- **Shadow portfolio computation** — mirror real transactions onto the
  benchmark at the first trading day on/after each transaction date
- **Dashboard surface** — `summary.benchmarkSymbol`, `benchmarkReturnPct`,
  `alpha = returnPct - benchmarkReturnPct`; parallel benchmark points in
  `history`
- **Benchmark price availability** — graceful degradation when the benchmark
  symbol has no prices or the profile has no transactions

See the canonical spec for the full scenarios.
