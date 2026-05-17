# Profiles — delta

## ADDED Requirements

### Requirement: Benchmark symbol
Each profile SHALL carry a `benchmark_symbol` column (Yahoo symbol string) that
the dashboard uses to compute the per-profile benchmark return. Default value is
`VAS.AX` (Vanguard Australian Shares ETF).

#### Scenario: New profile
- **WHEN** a profile row is inserted
- **THEN** `benchmark_symbol` is `"VAS.AX"` unless an explicit value is supplied
