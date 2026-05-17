# Change: Multi-user auth via Better Auth

> Shipped 2026-05-10 (commit 7ce0e5a, PR #13). Backfilled 2026-05-17.

## Why

The original install was a single shared password. To open the app to friends
and family (and to make the eventual public release viable), each person needs
their own login and their own isolated data. Building this on Better Auth gives
us Google OAuth and credential auth out of the box and keeps the surface area
manageable for a self-hosted app.

## What

- Replace the single-password login with Better Auth: email/password (with email
  verification via Resend) and Google OAuth.
- Add `user`, `account`, `session`, `verification` tables (Better Auth schema)
  and add `user_id` to `profiles`.
- Scope every read/write to the authenticated user's profiles. Cross-user
  access by id returns 404.
- Keep a `bcryptjs` verifier path so accounts seeded from the old
  `settings.password_hash` can still sign in.
- Public-path allowlist now covers `/login`, `/signup`, `/verify-email`,
  `/forgot-password`, `/reset-password`, `/api/auth/*`, `/api/cron/*`.

## Impact

- Affected capabilities: `auth`, `profiles`.
- Breaking? Yes — the single-password flow is gone. Existing installs migrate
  by seeding the owner's `account.password` from `settings.password_hash` so the
  original password keeps working (bcrypt fallback).
- DB migration? Yes — Better Auth tables and `profiles.user_id`.
- Config / env vars? New: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.
