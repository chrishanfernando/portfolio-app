# Change: Require verified sender domain for transactional email

> Shipped 2026-05-10 (commit c0a612f, PR #16). Backfilled 2026-05-17.

## Why

The previous email path silently fell back to Resend's sandbox domain when
`EMAIL_FROM` wasn't set, which meant verification + reset emails would deliver
in dev but get rejected (or land in spam) in production with strict DMARC. Once
the app is open to sign-ups, we cannot ship deliverability surprises.

## What

- Remove the sandbox fallback. The email module throws at first call if
  `EMAIL_FROM` is unset.
- Require `EMAIL_FROM` to be an address on a Resend-verified domain (operator
  responsibility; not enforced at runtime).
- Always include a plain-text body alongside HTML for every transactional
  email.
- Add `Reply-To` header from `EMAIL_REPLY_TO` when set.
- For rebalance alerts, add `List-Unsubscribe` (mailto) and
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click` when
  `EMAIL_UNSUBSCRIBE_MAILTO` is set, so Gmail's "unsubscribe" affordance
  renders.

## Impact

- Affected capabilities: `settings`.
- Breaking? Yes for production deploys missing `EMAIL_FROM` — they will error
  on first send. Documented in `docs/email-deliverability-setup.md`.
- DB migration? No.
- Config / env vars? `EMAIL_FROM` now required; `EMAIL_REPLY_TO` and
  `EMAIL_UNSUBSCRIBE_MAILTO` newly optional.
