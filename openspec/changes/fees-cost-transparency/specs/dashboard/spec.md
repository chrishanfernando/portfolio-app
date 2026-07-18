# Dashboard Delta — Fees & cost transparency

## ADDED Requirements

### Requirement: Fees summary widget
The dashboard SHALL render a compact fees widget displaying the weighted
fund-fee headline for the active profile, linking through to the full `/fees`
page.

#### Scenario: Widget contents with known MER
- **GIVEN** `GET /api/fees` returns `weightedMerBps = 18` and `projectedAnnualMerAud = 342`
- **THEN** the dashboard renders a single tile reading "Fund fees: 0.18% / $342/yr" (or visually equivalent)
- **AND** the tile is a link to `/fees`

#### Scenario: Widget with unknown MER
- **GIVEN** `GET /api/fees` returns `weightedMerBps = null`
- **THEN** the tile shows "Fund fees: —" rather than "0%" and still links to `/fees`

#### Scenario: Widget on empty profile
- **GIVEN** the active profile has zero holdings
- **THEN** the tile is hidden (consistent with other dashboard tiles' empty-state behaviour)

#### Scenario: Profile switching
- **WHEN** the user selects a different profile
- **THEN** the fees widget refetches and rerenders alongside the rest of the dashboard
