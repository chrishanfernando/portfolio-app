# Profiles Delta — Fees & cost transparency

## ADDED Requirements

### Requirement: Comparison advisor settings
Each profile SHALL carry two columns describing the robo-advisor used as the
fee-comparison baseline on the `/fees` page:

- `comparison_advisor_name` — display label, default `"Stockspot"`
- `comparison_advisor_fee_bps` — annual advisor fee in basis points, default `66`

These fields are per-profile (not per-user), so SMSF vs personal profiles can
compare against different baselines.

#### Scenario: New profile defaults
- **WHEN** a profile row is inserted with no explicit values
- **THEN** `comparison_advisor_name = "Stockspot"` and `comparison_advisor_fee_bps = 66`

#### Scenario: Used by GET /api/fees
- **WHEN** `GET /api/fees` runs for the active profile
- **THEN** the `comparisonAdvisor` block of the response reflects this profile's `comparison_advisor_name` and `comparison_advisor_fee_bps`

### Requirement: Comparison advisor settings UI
The system SHALL allow the user to edit the comparison-advisor fields from
the settings UI for the active profile.

#### Scenario: Editing the comparison advisor
- **WHEN** an authenticated user `PATCH /api/profiles` with `{ id: P, comparisonAdvisorName: "InvestSMART", comparisonAdvisorFeeBps: 88 }` for a profile they own
- **THEN** the row updates accordingly
- **AND** subsequent `/api/fees` responses reflect the new advisor name and fee

#### Scenario: Validation
- **WHEN** the user submits `comparisonAdvisorFeeBps` outside `[0, 500]`
- **THEN** the API rejects the request with HTTP 400 and the row is unchanged

#### Scenario: Empty advisor name rejected
- **WHEN** the user submits `comparisonAdvisorName = ""`
- **THEN** the API rejects the request with HTTP 400
