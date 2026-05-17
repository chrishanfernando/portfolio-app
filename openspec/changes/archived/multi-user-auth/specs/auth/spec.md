# Auth — delta

This change replaces the single-password `auth` spec wholesale. The new
canonical spec lives at `openspec/specs/auth/spec.md` and defines:

- Email + password sign-up with verification (Resend)
- Google OAuth sign-up / sign-in
- Email verification gate before credential sign-in
- Password reset by email
- Sessions and route protection (public-path allowlist, 307 to `/login` for
  pages, 401 for API)
- Data ownership: every read/write scoped to the authenticated user
- Legacy bcrypt support for owner accounts seeded from
  `settings.password_hash`
- Configuration: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`

See the canonical spec for the full requirement and scenario list.
