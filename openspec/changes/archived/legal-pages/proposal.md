# Change: Disclaimer / Terms / Privacy pages

> Shipped 2026-05-10 (commit b1762b2) and filled in 2026-05-13 (commit 717b749, PR #15). Backfilled 2026-05-17.

## Why

Opening sign-up to anyone on the internet means we need three legal pages live
before launch: a disclaimer that the app is not financial advice, terms of use,
and a privacy notice complying with the Australian Privacy Act 1988. They have
to be reachable without a session so prospective users can read them on the
sign-up page.

## What

- Add public `/disclaimer`, `/terms`, `/privacy` routes (server-rendered).
- Add a shared `LegalShell` component so the three pages share the same header,
  footer, and contact-email placeholder substitution.
- Add the three paths to the auth middleware's public-path allowlist.
- Link from the sign-up form ("by creating an account you agree to…") and from
  the authed app footer.
- Content scope: disclaimer = no advice + data-accuracy limits; terms =
  governing jurisdiction (NSW); privacy = AU Privacy Act compliance, what's
  stored, where, and links to the export/deletion flows.

## Impact

- Affected capabilities: `legal` (new), `auth` (public-path allowlist).
- Breaking? No.
- DB migration? No.
- Config / env vars? None new.
