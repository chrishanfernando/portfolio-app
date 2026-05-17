# Profiles — delta

This change adds `user_id` to `profiles` and re-scopes every profile-aware
endpoint. The canonical spec at `openspec/specs/profiles/spec.md` defines:

- **Profile CRUD** scoped to the authenticated user (list / create / rename)
- **Active profile selection** via `x-profile-id` header or `?profileId=` query,
  validated against the user's owned profiles
- **Profile scoping** — every read/write filtered by an active profile owned
  by the user
- **First profile creation** — a brand-new user creates their first profile via
  `POST /api/profiles`; there is no shared default profile

Cross-user access by id returns HTTP 404.
