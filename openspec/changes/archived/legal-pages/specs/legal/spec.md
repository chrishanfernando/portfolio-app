# Legal — delta (NEW capability)

This change introduces the `legal` capability. Full requirements live in
`openspec/specs/legal/spec.md`:

- **Public routes** — `/disclaimer`, `/terms`, `/privacy` reachable without a
  session; auth middleware allowlist updated
- **Shared shell** — single `LegalShell` component with consistent header,
  footer, and contact-email placeholder substitution
- **Content scope** — disclaimer (no advice + data-accuracy limits), privacy
  (Privacy Act 1988 + APPs, data stored / where, links to export + deletion),
  terms (NSW governing law, contact, acceptable use)
- **Sign-up acknowledgement** — sign-up form links to `/terms` and `/privacy`
  with explicit acceptance copy

See the canonical spec for the full scenarios.
