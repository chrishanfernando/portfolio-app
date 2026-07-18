# Assets Delta — Fees & cost transparency

## MODIFIED Requirements

### Requirement: Asset record shape
Each asset SHALL carry: `id`, `profileId`, `symbol`, `name`, `displayTicker`, `yahooSymbol`, `category`, `platform`, `isActive`, optional `merBps` (fund management fee in basis points; `null` means unknown).

`merBps` is stored as an integer in basis points (1 bp = 0.01%) to avoid
floating-point ambiguity. `null` means the MER is unknown — it MUST NOT be
treated as `0` for weighted-MER aggregation.

#### Scenario: Symbol vs display ticker vs Yahoo symbol
- **GIVEN** an asset such as `BHP.AX` listed on CMC
- **THEN** `symbol` is the canonical internal symbol used by importers (`BHP`)
- **AND** `displayTicker` is the user-facing label (`BHP.AX`)
- **AND** `yahooSymbol` is the symbol passed to `yahoo-finance2` for price fetches (`BHP.AX`)

#### Scenario: MER stored as basis points
- **GIVEN** Vanguard VAS ETF (published MER 0.07%)
- **THEN** the asset row stores `mer_bps = 7`

#### Scenario: MER unknown for individual stock
- **GIVEN** an individual equity (e.g. BHP)
- **THEN** `mer_bps` defaults to `null` (individual stocks do not have a fund management fee)

## ADDED Requirements

### Requirement: MER seeding on asset creation
The system SHALL seed `mer_bps` from a static AU-ETF lookup table when an
asset is created and its `symbol` (or normalised `yahooSymbol`) matches a
known entry.

#### Scenario: Creating VAS via importer
- **GIVEN** a CMC CSV references `VAS.AX`
- **WHEN** the importer auto-creates the asset
- **THEN** the new asset has `mer_bps = 7` (VAS published MER)

#### Scenario: Creating an unrecognised symbol
- **GIVEN** the user manually creates an asset with `symbol = "ZZZZ"`
- **WHEN** the asset is inserted
- **THEN** `mer_bps = null`

#### Scenario: Lookup table coverage
- **THEN** the lookup table SHALL include at minimum the ETFs already referenced by `TIER_PROFILES` in `src/lib/risk-profiling.ts` plus the substitutes documented in this change's `design.md`

### Requirement: MER editable via holdings UI
The system SHALL allow the user to set or override `mer_bps` for any asset
they own via the holdings edit screen.

#### Scenario: Override an auto-seeded value
- **GIVEN** an asset auto-seeded with `mer_bps = 18`
- **WHEN** the user submits the edit form with `merBps = 15`
- **THEN** the asset row updates to `mer_bps = 15`
- **AND** subsequent `/api/fees` responses reflect the new value

#### Scenario: Clearing MER back to unknown
- **WHEN** the user clears the MER input
- **THEN** the asset row stores `mer_bps = null` (unknown), not `0`

#### Scenario: Validation
- **WHEN** the user submits `merBps` outside `[0, 500]` (i.e. 0% to 5%)
- **THEN** the API rejects the request with HTTP 400 and the row is unchanged
