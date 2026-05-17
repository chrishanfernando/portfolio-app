# Profiles — delta

## ADDED Requirements

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
