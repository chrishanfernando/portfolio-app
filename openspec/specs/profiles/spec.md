# Profiles Specification

## Purpose

Allow each authenticated user to maintain multiple independent portfolios
("profiles"). Profiles namespace assets, transactions (via assets), category
targets, and CMC account mappings. The active profile is selected by the client
and propagated via a header or query parameter; server routes validate that the
profile belongs to the requesting user before honoring it.

## Requirements

### Requirement: Profile CRUD
The system SHALL expose endpoints to list, rename, and create profiles, scoped
to the authenticated user.

#### Scenario: List profiles
- **WHEN** an authenticated user `U` issues `GET /api/profiles`
- **THEN** the response is an array of `{ id, name, createdAt, userId }` for every row in `profiles` where `user_id = U`

#### Scenario: Create a profile
- **WHEN** an authenticated user `U` issues `POST /api/profiles` with `{ name: "<non-empty>" }`
- **THEN** a row is inserted with `created_at = today (YYYY-MM-DD)` and `user_id = U`

#### Scenario: Rename a profile owned by someone else
- **WHEN** user `U₂` issues `PATCH /api/profiles` with `{ id: P, name: "..." }` where `P` is owned by `U₁`
- **THEN** the response is `{ error: "Profile not found" }` with HTTP 404
- **AND** the row is unchanged

### Requirement: Active profile selection
The system SHALL determine the active profile from the request, scoped to the
authenticated user. Clients indicate the active profile via header
`x-profile-id` or query `?profileId=`.

#### Scenario: Header or query refers to a profile owned by the user
- **GIVEN** a request from user `U` with `x-profile-id: P`
- **AND** profile `P` has `user_id = U`
- **THEN** queries are filtered by `profile_id = P`

#### Scenario: Header or query refers to a profile not owned by the user
- **GIVEN** a request from user `U₂` with `x-profile-id: P`
- **AND** profile `P` has `user_id = U₁`
- **THEN** the response is HTTP 404

#### Scenario: No header or query supplied
- **GIVEN** an authenticated user `U` with at least one profile
- **WHEN** a profile-scoped route runs
- **THEN** queries are filtered by `profile_id = first profile owned by U` (lowest `id`)

### Requirement: Profile scoping
The system SHALL scope all reads and writes to data under profiles owned by the
authenticated user.

#### Scenario: Listing assets/holdings/transactions/dashboard/rebalance
- **WHEN** an authenticated user requests data for the active profile
- **THEN** the response includes only rows whose `profile_id` (directly or via the parent asset) equals the active profile
- **AND** the active profile is owned by the user

### Requirement: First profile creation
The system SHALL allow a brand-new user to create their first profile via
`POST /api/profiles` before any data is ingested. There is no shared default
profile across users.

### Requirement: Auto-create first profile on access
The system SHALL auto-provision a profile for a freshly registered user the first
time they hit a profile-aware endpoint, so they are never stuck on a dead empty
state.

#### Scenario: GET /api/profiles for a user with zero profiles
- **GIVEN** authenticated user `U` has no rows in `profiles`
- **WHEN** the client `GET /api/profiles`
- **THEN** a single profile is inserted named `<user.name>` (or `"My Portfolio"` if `user.name` is empty)
  with `user_id = U` and `created_at = today`
- **AND** the response is an array containing that profile

### Requirement: Onboarding gate
The system SHALL require every authenticated user to complete the risk-profile
questionnaire before reaching the main app. See the Risk Profiles spec for the
questionnaire itself.

#### Scenario: First visit after sign-up
- **GIVEN** authenticated user `U` has no row in `risk_profiles` for their active profile
- **WHEN** the user navigates to any route under the `(authed)` segment except `/risk-profile` or `/settings`
- **THEN** the client redirects to `/risk-profile`

#### Scenario: Risk profile already exists
- **GIVEN** authenticated user `U` has a `risk_profiles` row for their active profile
- **WHEN** the user navigates to any authed route
- **THEN** no redirect occurs and the page renders normally

#### Scenario: Onboarding check fails
- **GIVEN** the `GET /api/risk-profile` call returns a network error
- **THEN** the gate fails open and the user is allowed through (no redirect)

### Requirement: Benchmark symbol
Each profile SHALL carry a `benchmark_symbol` column (Yahoo symbol string) that
the dashboard uses to compute the per-profile benchmark return. Default value is
`VAS.AX` (Vanguard Australian Shares ETF).

#### Scenario: New profile
- **WHEN** a profile row is inserted
- **THEN** `benchmark_symbol` is `"VAS.AX"` unless an explicit value is supplied
