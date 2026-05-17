# Legal Specification

## Purpose

Serve the three public legal pages required for a portfolio-tracking app in
Australia: a disclaimer (no financial advice), terms of use, and a privacy
notice (Privacy Act 1988 compliant). These pages are reachable without
authentication and are linked from sign-up and from the authed app footer.

## Requirements

### Requirement: Public routes
The system SHALL serve `/disclaimer`, `/terms`, and `/privacy` without requiring
a session.

#### Scenario: Anonymous request
- **WHEN** an unauthenticated client `GET /disclaimer`, `/terms`, or `/privacy`
- **THEN** the page renders without a redirect to `/login`
- **AND** the auth middleware allowlist includes all three paths

### Requirement: Shared shell
The three pages SHALL share a single layout shell so heading, footer, and
contact-email placeholder rendering stay consistent.

#### Scenario: Layout consistency
- **GIVEN** the `LegalShell` component in `src/components/layout/legal-shell.tsx`
- **THEN** each of `/disclaimer`, `/terms`, `/privacy` renders inside it
- **AND** the support-email placeholder `[SUPPORT EMAIL]` is replaced with the configured contact address at render time

### Requirement: Content scope
Each legal page SHALL cover its required topics for an AU-jurisdiction self-hosted
tracker.

#### Scenario: Disclaimer content
- **THEN** `/disclaimer` states the app is not financial advice, calls out data-accuracy limitations
  (Yahoo Finance, importer ingestion), notes all values are AUD-normalised, and disclaims warranty

#### Scenario: Privacy content
- **THEN** `/privacy` references the Privacy Act 1988 (Cth) and the Australian Privacy Principles
- **AND** describes what is stored (account, profiles, transactions, prices) and where (Turso or local SQLite)
- **AND** links to the data export and account deletion flows defined in the Auth spec

#### Scenario: Terms content
- **THEN** `/terms` names the governing jurisdiction (New South Wales) and the contact email
- **AND** covers acceptable use, account responsibility, and termination

### Requirement: Sign-up acknowledgement
The sign-up flow SHALL show the user that they accept the terms and privacy
policy when creating an account.

#### Scenario: Sign-up acknowledgement copy
- **WHEN** the sign-up page renders
- **THEN** the form includes a visible "by creating an account you agree to" line linking to `/terms` and `/privacy`
