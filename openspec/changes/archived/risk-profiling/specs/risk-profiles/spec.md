# Risk Profiles — delta (NEW capability)

This change introduces the `risk-profiles` capability. Full requirements live
in `openspec/specs/risk-profiles/spec.md`:

- **Questionnaire structure** — exactly 5 multiple-choice questions, integer
  scoring, range 0–13
- **Tier derivation** — score → tier mapping (≤3 conservative · ≤6 balanced ·
  ≤9 growth · >9 aggressive)
- **Persistence** — one row per (user, profile); resubmission upserts in place
- **Read endpoint** — `GET /api/risk-profile` returns the saved row or `null`
- **Save endpoint** — `POST /api/risk-profile` with optional `applyTargets`
  that replaces `category_targets` for the active profile
- **Tier recommendations** — fixed `TIER_PROFILES` table of ETFs per tier with
  allocations summing to 100

See the canonical spec for the full scenarios.
