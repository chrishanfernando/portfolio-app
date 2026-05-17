# Tasks

- [x] Add Better Auth + Drizzle adapter; generate `user` / `account` / `session` / `verification` tables
- [x] Add `user_id` column to `profiles` and backfill the existing rows to the owner
- [x] Replace `/api/login` flow with Better Auth's `/api/auth/*` routes
- [x] Wire email verification + password reset via Resend
- [x] Add Google OAuth provider
- [x] Update middleware: public-path allowlist + session cookie check
- [x] Scope every API route (`profiles`, `assets`, `transactions`, `holdings`, `dashboard`, `prices`, `rebalance`, `charts`, `import`, `settings`) by the authenticated user
- [x] Keep bcrypt verifier as a fallback for the old single-password hash
- [x] Update auth + profiles spec
- [x] Manually verify: fresh sign-up via email, email verification, Google OAuth, cross-user access returns 404
