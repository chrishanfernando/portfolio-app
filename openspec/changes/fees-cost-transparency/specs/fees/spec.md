# Fees Specification

## Purpose

Surface what the user pays to own their portfolio so they can compare a DIY
holdings approach against a paid robo-advisor (default: Stockspot). The
capability covers fund management fees (MER, sourced from per-asset
`mer_bps`), brokerage paid at trade time (sourced from `transactions.fee_aud`),
and a configurable advisor-fee comparison baseline per profile.

## ADDED Requirements

### Requirement: Fees data endpoint
The system SHALL expose `GET /api/fees` returning everything required to
render the `/fees` page and the dashboard fees widget for the active profile.

#### Scenario: Authenticated request for an active profile
- **WHEN** an authenticated client `GET /api/fees`
- **THEN** the response is a JSON object with at least the following fields:
  `weightedMerBps`, `projectedAnnualMerAud`, `holdings` (array),
  `lifetimeBrokerageAud`, `unknownBrokerageCount`,
  `comparisonAdvisor` (object), and `dragProjection` (array)
- **AND** all monetary values are AUD

#### Scenario: Unauthenticated request
- **WHEN** a request without a valid session hits `GET /api/fees`
- **THEN** the response is HTTP 401

#### Scenario: Profile scoping
- **GIVEN** a request with `x-profile-id: P` for user `U`
- **WHEN** `P` is owned by `U`
- **THEN** the response reflects holdings, transactions, and profile settings scoped to `P`

### Requirement: Weighted MER calculation
The system SHALL compute `weightedMerBps` as the market-value-weighted average
of `mer_bps` across all active holdings whose asset has a non-null `mer_bps`.
Holdings whose asset has a null `mer_bps` SHALL be excluded from both numerator
and denominator (treated as unknown, not zero).

#### Scenario: All holdings have a known MER
- **GIVEN** two holdings worth AUD 60,000 (`mer_bps = 7`) and AUD 40,000 (`mer_bps = 18`)
- **WHEN** the response is computed
- **THEN** `weightedMerBps = round((60000*7 + 40000*18) / 100000) = 11`
- **AND** `projectedAnnualMerAud ≈ round(100000 * 11 / 10000) = 110`

#### Scenario: Some holdings have unknown MER
- **GIVEN** two holdings worth AUD 60,000 (`mer_bps = 7`) and AUD 40,000 (`mer_bps = null`)
- **WHEN** the response is computed
- **THEN** `weightedMerBps` reflects only the AUD 60,000 holding (`= 7`)
- **AND** `projectedAnnualMerAud` is based on the AUD 60,000 priced portion (`≈ 42`)
- **AND** the unknown holding appears in `holdings[]` with `merBps: null`

#### Scenario: All holdings have unknown MER
- **GIVEN** every active holding has `mer_bps = null`
- **THEN** `weightedMerBps = null` and `projectedAnnualMerAud = null`

### Requirement: Per-holding MER breakdown
The system SHALL include a `holdings[]` array, one entry per active holding,
to drive the per-asset table on the fees page.

#### Scenario: Holdings array shape
- **THEN** each entry contains `{ assetId, ticker, marketValueAud, merBps, annualCostAud }`
- **AND** `annualCostAud = round(marketValueAud * merBps / 10000)` when `merBps` is non-null
- **AND** `annualCostAud = null` when `merBps` is null

### Requirement: Lifetime brokerage aggregation
The system SHALL aggregate brokerage paid across all transactions for the
active profile.

#### Scenario: Sum of known fee_aud
- **GIVEN** four BUY transactions with `fee_aud` values `11`, `11`, `null`, `9.95`
- **WHEN** the response is computed
- **THEN** `lifetimeBrokerageAud = 31.95`
- **AND** `unknownBrokerageCount = 1`

### Requirement: Comparison advisor projection
The system SHALL include a comparison-advisor block reflecting the active
profile's `comparison_advisor_name` and `comparison_advisor_fee_bps`.

#### Scenario: Projected advisor cost
- **GIVEN** an active profile with `comparison_advisor_name = "Stockspot"`, `comparison_advisor_fee_bps = 66`, and `totalValue = 100000`
- **WHEN** the response is computed
- **THEN** `comparisonAdvisor = { name: "Stockspot", feeBps: 66, projectedAnnualAud: 660 }`

### Requirement: Drag projection
The system SHALL include a `dragProjection[]` array showing the absolute AUD
lost to MER vs. an idealised zero-fee scenario over fixed horizons of 10, 20,
and 30 years.

#### Scenario: Drag entries
- **GIVEN** the active profile's current `totalValue` is `B`, `weightedMerBps` is `mBps`, and the assumed gross return is `r = 0.07`
- **THEN** `dragProjection` contains exactly three entries for `years ∈ {10, 20, 30}`
- **AND** each entry is `{ years, withFeesAud, withoutFeesAud, lostAud }`
- **AND** `withFeesAud = round(B * (1 + r - mBps/10000)^years)`
- **AND** `withoutFeesAud = round(B * (1 + r)^years)`
- **AND** `lostAud = withoutFeesAud - withFeesAud`

#### Scenario: Weighted MER is unknown
- **GIVEN** `weightedMerBps = null`
- **THEN** `dragProjection = []`

### Requirement: Fees page
The system SHALL render a `/fees` page using the data from `GET /api/fees`.

#### Scenario: Page contents
- **WHEN** an authenticated user navigates to `/fees`
- **THEN** the page renders a headline tile (`weightedMerBps` as % and `projectedAnnualMerAud`)
- **AND** a per-holding table sourced from `holdings[]`
- **AND** a comparison panel showing the advisor name, advisor fee %, advisor projected $/yr, and the user's `projectedAnnualMerAud` for side-by-side comparison
- **AND** a drag-projection chart visualising `withFeesAud` vs `withoutFeesAud` across the three horizons
- **AND** a disclosure that the projection assumes a constant 7% gross return, no contributions, no withdrawals, no tax

#### Scenario: Empty state
- **GIVEN** the active profile has zero holdings
- **THEN** the page renders an empty state linking to `/import` and `/transactions/new`
- **AND** does not render the drag-projection chart

#### Scenario: Unknown brokerage banner
- **GIVEN** `unknownBrokerageCount > 0`
- **THEN** the page renders a non-blocking banner stating that `<n>` transactions are missing brokerage and links to `/transactions`
