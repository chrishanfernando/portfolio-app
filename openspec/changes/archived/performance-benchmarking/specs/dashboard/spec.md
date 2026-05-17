# Dashboard — delta

## MODIFIED Requirements

### Requirement: Dashboard data endpoint
`summary` now also carries `benchmarkSymbol`, `benchmarkReturnPct`, and `alpha`
when a benchmark series is available. `history` carries parallel benchmark
values per portfolio date.

#### Scenario: GET /api/dashboard
- **WHEN** an authenticated client requests the dashboard
- **THEN** the response is `{ summary, history }` for the active profile
- **AND** `summary` includes `totalValue`, `totalCost`, `profitLoss`, `returnPct`, `cagr`, `holdings`, `categoryBreakdown`
- **AND** when a benchmark series is available, `summary` also includes `benchmarkSymbol`, `benchmarkReturnPct`, and `alpha` (see Benchmarks spec)
- **AND** `history` is the daily portfolio value series suitable for a line chart, with parallel benchmark values when present
