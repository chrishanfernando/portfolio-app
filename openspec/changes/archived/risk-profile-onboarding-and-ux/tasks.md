# Tasks

- [x] Add `OnboardingGate` component wrapped around the `(authed)` layout
- [x] Exempt `/risk-profile` and `/settings` from the gate
- [x] Fail-open behaviour for the gate on network error
- [x] `ensureProfile()` helper that auto-inserts a first profile when user has zero
- [x] Wire `ensureProfile()` into `GET /api/profiles`
- [x] Client-side Better Auth base URL → `window.location.origin`
- [x] Server `resolveTrustedOrigins()` accepts private-LAN origins in dev only
- [x] `dns.setDefaultResultOrder("ipv4first")` in `next.config.ts`
- [x] Update `profiles` and `auth` specs
- [x] Manually verify: fresh sign-up redirects to `/risk-profile`; auto-creates first profile; sign-in works from a phone on the LAN; Google OAuth callback no longer hangs in prod
