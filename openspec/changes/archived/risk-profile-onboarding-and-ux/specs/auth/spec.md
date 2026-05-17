# Auth — delta

## ADDED Requirements

### Requirement: LAN-friendly origin handling
The system SHALL accept Better Auth requests from private-network origins so the app is usable from a
phone or tablet on the same LAN as a self-hosted instance.

#### Scenario: Client base URL inference
- **WHEN** the auth client (`src/lib/auth-client.ts`) initialises in the browser
- **THEN** it uses `window.location.origin` as the base URL
- **AND** a request from `http://192.168.1.42:3000` targets that same host instead of a hardcoded `BETTER_AUTH_URL`

#### Scenario: Trusted-origin allowlist in development
- **GIVEN** `NODE_ENV !== "production"`
- **WHEN** Better Auth evaluates the request `Origin` header
- **THEN** any host matching `localhost`, `127.*`, `10.*`, `192.168.*`, or `172.16.*–172.31.*` is treated as trusted
- **AND** in production only the configured `BETTER_AUTH_URL` (and any explicit additions) is trusted

#### Scenario: IPv4-first DNS for OAuth token exchange
- **GIVEN** Node's DNS resolver default is dual-stack
- **WHEN** the process starts (`next.config.ts`)
- **THEN** `dns.setDefaultResultOrder("ipv4first")` is invoked so the Google OAuth token-exchange fetch
  does not hang on IPv6 routes that are unreachable from the host
