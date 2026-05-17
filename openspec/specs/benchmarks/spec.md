# Benchmarks Specification

## Purpose

For each profile, compare actual portfolio returns against a single user-selected
benchmark (default `VAS.AX`). The benchmark series is a *shadow portfolio* —
every real transaction is mirrored as a hypothetical buy/sell of the benchmark
at the same date — so the comparison reflects timing, not just market direction.
Benchmark data is surfaced via the existing dashboard endpoint.

## Requirements

### Requirement: Per-profile benchmark symbol
Each profile SHALL carry a `benchmark_symbol` column. The dashboard SHALL use
this symbol to compute the benchmark series for that profile. Default is
`"VAS.AX"`. See the Profiles spec for the field-level requirement.

### Requirement: Shadow portfolio computation
The benchmark series SHALL be derived from the user's actual transactions, not
from a static "buy and hold" assumption.

#### Scenario: Mapping a transaction date to a benchmark trading day
- **GIVEN** a transaction dated `D`
- **AND** the benchmark price series has no row for `D` (weekend/holiday)
- **THEN** the computation uses the first available benchmark price on or after `D`

#### Scenario: Building the value series
- **GIVEN** transactions `T₁..Tₙ` for the active profile
- **THEN** for each `Tᵢ`, `aud_amount(Tᵢ) / benchmark_price(mapped_date)` benchmark units are added (BUY/DIV) or subtracted (SELL)
- **AND** the daily benchmark value series is `units_held(date) × benchmark_price(date)`
- **AND** `costBasis` for the benchmark series is the cumulative AUD invested at the mapped trading days

#### Scenario: No matching prices
- **GIVEN** the benchmark price table has no rows for the requested symbol
- **THEN** the benchmark history is `[]` and the benchmark summary fields are omitted

#### Scenario: No transactions
- **GIVEN** the profile has zero transactions
- **THEN** the benchmark history is `[]` and the benchmark summary fields are omitted

### Requirement: Dashboard surface
The `GET /api/dashboard` response SHALL include benchmark-relative metrics
alongside the portfolio metrics when a benchmark series is available.

#### Scenario: Benchmark fields in dashboard summary
- **WHEN** the benchmark series is non-empty
- **THEN** `summary` includes `benchmarkSymbol`, `benchmarkReturnPct`, and `alpha`
- **AND** `alpha = returnPct - benchmarkReturnPct` (in percentage points)
- **AND** the `history` payload includes a parallel benchmark value point for each portfolio date so the chart can render both lines

### Requirement: Benchmark price availability
The benchmark symbol SHALL be backfilled into the `prices` table the same way as
any other asset. If the symbol is not present, the dashboard MUST degrade
gracefully rather than error.

#### Scenario: Missing benchmark symbol prices
- **GIVEN** `profile.benchmark_symbol = "FOO.AX"` and no prices for `FOO.AX` exist
- **WHEN** the dashboard endpoint runs
- **THEN** the response is the standard dashboard payload without `benchmarkReturnPct`, `alpha`, or benchmark history
- **AND** no error is thrown
