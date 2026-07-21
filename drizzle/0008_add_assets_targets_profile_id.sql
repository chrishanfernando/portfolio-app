-- Custom SQL migration file, put your code below! --
-- Adds the multi-tenant profile_id column to `assets` and `category_targets`.
-- schema.ts (and drizzle-kit push local DBs) already have this column, but the
-- generated SQL migrations never added it — so migrate-built databases (prod, CI)
-- were missing it, causing "no such column: profile_id" 500s on import/rebalance.
-- DEFAULT 1 backfills any existing rows to the first profile (matches schema.ts .default(1)).
ALTER TABLE `assets` ADD `profile_id` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `category_targets` ADD `profile_id` integer DEFAULT 1 NOT NULL;
