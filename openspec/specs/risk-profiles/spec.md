# Risk Profiles Specification

## Purpose

Capture each user's investing risk tolerance via a short questionnaire, derive a
risk tier and a suggested ETF allocation, and (on request) push that allocation
into the active profile's category targets. The risk profile also acts as the
onboarding gate that must be completed before the rest of the app is reachable
(see the Profiles spec).

## Requirements

### Requirement: Questionnaire structure
The risk-profile questionnaire SHALL consist of exactly five multiple-choice
questions covering time horizon, income stability, loss tolerance, investment
goal, and emergency-fund coverage. Each option carries a fixed integer score.

#### Scenario: Score range
- **GIVEN** the questionnaire definition in `src/lib/risk-profiling.ts`
- **THEN** the minimum achievable total is `0` and the maximum is `13`

### Requirement: Tier derivation
A total score SHALL deterministically map to one of four tiers.

#### Scenario: Score-to-tier mapping
- **GIVEN** total score `s`
- **THEN** the tier is `"conservative"` when `s ≤ 3`
- **AND** `"balanced"` when `3 < s ≤ 6`
- **AND** `"growth"` when `6 < s ≤ 9`
- **AND** `"aggressive"` when `s > 9`

### Requirement: Persistence
The system SHALL store one risk profile per (user, profile) pair.

#### Scenario: risk_profiles row shape
- **THEN** each row carries `id`, `userId`, `profileId`, `riskScore` (integer),
  `riskTier` (one of the four tier strings), `answers` (JSON array of option
  indices, length 5), `createdAt`, and `updatedAt`

#### Scenario: Resubmission
- **GIVEN** a row already exists for `(userId, profileId)`
- **WHEN** the user resubmits the questionnaire
- **THEN** the existing row is updated in place (`updatedAt` refreshed) — no second row is inserted

### Requirement: Read endpoint
The system SHALL expose `GET /api/risk-profile` returning the active profile's risk
profile or `null` if none exists.

#### Scenario: GET /api/risk-profile — has profile
- **WHEN** an authenticated user with a saved risk profile for the active profile requests it
- **THEN** the response is `{ riskScore, riskTier, answers, updatedAt }`

#### Scenario: GET /api/risk-profile — no profile
- **WHEN** no row exists for the (user, active profile)
- **THEN** the response is `null` (used by the onboarding gate to trigger redirect)

### Requirement: Save endpoint
The system SHALL expose `POST /api/risk-profile` accepting the answer array and
optionally applying the recommended targets.

#### Scenario: POST /api/risk-profile
- **WHEN** an authenticated user posts `{ answers: number[5] }`
- **THEN** the server computes the score and tier, upserts the row for the active profile,
  and returns the saved row plus the recommended ETF allocation

#### Scenario: POST /api/risk-profile with applyTargets
- **WHEN** the request body is `{ answers, applyTargets: true }`
- **THEN** the existing `category_targets` rows for the active profile are deleted
- **AND** new rows are inserted, one per recommended-ETF category, with target percentages summing to 100

### Requirement: Tier recommendations
The system SHALL define a fixed ETF allocation per tier. Each tier names concrete
tickers, categories, allocation percentages, and short rationale text shown to
the user.

#### Scenario: Allocation totals
- **GIVEN** any tier in the `TIER_PROFILES` table
- **THEN** the per-ETF allocation percentages sum to 100

#### Scenario: Allocations reference real ETFs
- **THEN** each ETF entry carries `ticker`, `name`, `category` (one of `"Growth"` or `"Defensive"`),
  `allocationPct`, `mer`, `aum`, and `rationale`
