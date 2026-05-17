# Auth — delta

## ADDED Requirements

### Requirement: Account deletion
The system SHALL allow an authenticated user to delete their own account and all
owned data via Better Auth's `deleteUser` flow.

#### Scenario: Pre-deletion summary
- **WHEN** an authenticated user `GET /api/account/summary`
- **THEN** the response is `{ profiles: <n>, assets: <n>, transactions: <n> }` for data they own

#### Scenario: Deletion cascade
- **WHEN** Better Auth invokes the `beforeDelete` hook for user `U`
- **THEN** the hook deletes (in order) `prices` and `transactions` for assets under each profile owned by `U`,
  then `assets`, then `category_targets`, `cmc_account_mappings`, `risk_profiles`, and finally `profiles`
- **AND** the `user`, `account`, and `session` rows are deleted by Better Auth itself
- **AND** no rows owned by `U` remain in any user-scoped table

#### Scenario: Auth method probe
- **WHEN** an authenticated user `GET /api/account/auth-method`
- **THEN** the response is `{ hasPassword: boolean }` based on whether a `credential` account row exists

### Requirement: Data export
The system SHALL allow an authenticated user to download a complete JSON export of all data they own.

#### Scenario: GET /api/account/export
- **WHEN** an authenticated user `GET /api/account/export`
- **THEN** the response is a JSON document with `schemaVersion: 1`, the user record, `userSettings`,
  and arrays of every `profile`, `asset`, `transaction`, `price`, `categoryTarget`,
  `cmcAccountMapping`, and `riskProfile` owned by the user
- **AND** the `Content-Disposition` header is `attachment; filename="portfolio-export-<userId>-<YYYYMMDD>.json"`
- **AND** password hashes and other secrets are not included
