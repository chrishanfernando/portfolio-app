# Change: Risk-profile onboarding gate, UX polish, LAN-friendly auth

> Shipped 2026-05-16 (commit 500adb6, PR #25). Backfilled 2026-05-17.

## Why

Three independent issues, all surfaced once real users started signing up:

1. **Onboarding cliff** — a new user signs up and lands on an empty dashboard
   with no idea what to do. The risk-profile questionnaire is the natural
   first step; the app should force it before anything else loads.
2. **Empty profile cliff** — a fresh user has no profiles yet, so the first
   profile-aware API call returns nothing and the UI sits in a dead state.
3. **LAN auth broken** — self-hosters running the app on a Raspberry Pi want
   to sign in from their phone over their home network. Better Auth rejected
   those requests (origin mismatch) and the Google OAuth callback was
   hanging in production because Node's dual-stack DNS resolved to IPv6 first.

## What

- **Onboarding gate**: `OnboardingGate` component in the `(authed)` layout
  checks `GET /api/risk-profile`; if `null`, redirects to `/risk-profile`.
  Exempt paths: `/risk-profile`, `/settings`. Fails open on network error so a
  Yahoo/Resend outage doesn't lock everyone out.
- **Auto-create first profile**: `ensureProfile()` in `src/lib/profile.ts` runs
  on `GET /api/profiles` — if the user has zero profiles, insert one named
  `user.name` (or `"My Portfolio"`).
- **LAN-friendly auth**:
  - Client uses `window.location.origin` as the Better Auth base URL, so a
    request from `http://192.168.1.42:3000` targets that host.
  - Server `resolveTrustedOrigins()` whitelists private-LAN origins
    (`localhost`, `127.*`, `10.*`, `192.168.*`, `172.16.*–172.31.*`) — but only
    when `NODE_ENV !== "production"`.
  - `next.config.ts` calls `dns.setDefaultResultOrder("ipv4first")` so the
    Google OAuth token-exchange fetch doesn't hang on unreachable IPv6 routes.
- UX polish: assorted empty-state and copy improvements (see commit diff).

## Impact

- Affected capabilities: `profiles` (auto-create, onboarding gate), `auth`
  (LAN trusted origins, IPv4 DNS).
- Breaking? No.
- DB migration? No.
- Config / env vars? None new.
