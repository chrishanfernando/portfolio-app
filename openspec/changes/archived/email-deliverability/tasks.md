# Tasks

- [x] Remove the sandbox `from` fallback in `src/lib/email.ts`
- [x] Throw at startup / first send when `EMAIL_FROM` is unset
- [x] Add plain-text body alongside HTML for verification, password-reset, and rebalance alert templates
- [x] Wire `EMAIL_REPLY_TO` into the `Reply-To` header
- [x] Wire `EMAIL_UNSUBSCRIBE_MAILTO` into `List-Unsubscribe` + `List-Unsubscribe-Post` headers on rebalance alerts
- [x] Document the verified-domain requirement in `docs/email-deliverability-setup.md`
- [x] Update `settings` spec
- [x] Manually verify: send rebalance alert to Gmail, confirm one-click unsubscribe renders; confirm verification email passes SPF/DKIM/DMARC
