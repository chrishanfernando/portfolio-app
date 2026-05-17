# Change: Account deletion and data export

> Shipped 2026-05-10 (commits a04a970, 3c05b34, PR #11). Backfilled 2026-05-17.

## Why

A multi-user app with a multi-tenant DB needs a credible "delete my account"
path for trust, AU Privacy Act compliance, and for the eventual public release.
Users should also be able to download everything they've put in before they
delete, so the data isn't held hostage.

## What

- `GET /api/account/export` returns a single JSON document with everything the
  user owns: profiles, assets, transactions, prices, category targets, CMC
  account mappings, risk profile, user record, settings. `Content-Disposition`
  triggers a download named `portfolio-export-<userId>-<YYYYMMDD>.json`.
- `GET /api/account/summary` returns counts (`profiles`, `assets`,
  `transactions`) so the deletion confirmation page can show what will be lost.
- `GET /api/account/auth-method` returns `{ hasPassword }` so the UI knows
  whether to require the current password before deletion.
- Use Better Auth's `user.deleteUser` with a `beforeDelete` hook that
  cascades manually (prices → transactions → assets per profile → category
  targets, cmc mappings, risk profiles → profiles). This is necessary because
  SQLite's `ALTER TABLE ADD COLUMN` silently drops `ON DELETE CASCADE`, so the
  FKs can't be relied on.

## Impact

- Affected capabilities: `auth`.
- Breaking? No.
- DB migration? No.
- Config / env vars? None new.
