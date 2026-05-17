# Settings — delta

## MODIFIED Requirements

### Requirement: Notification dispatch
Notification gate now also requires `EMAIL_FROM` to be set (previously only
`emailNotifications`, `email`, `RESEND_API_KEY`).

## ADDED Requirements

### Requirement: Verified sender domain
The system SHALL require `EMAIL_FROM` to be set to an address on a domain verified
in Resend before sending any transactional email. There is no sandbox / unverified
fallback.

#### Scenario: EMAIL_FROM missing
- **GIVEN** the email module is loaded and `EMAIL_FROM` is unset
- **WHEN** any caller invokes the send helper
- **THEN** the helper throws (or returns an error result) without contacting Resend

#### Scenario: Outbound email headers
- **WHEN** the system sends transactional email
- **THEN** the message has both an `html` and a `text` body
- **AND** if `EMAIL_REPLY_TO` is set, the `Reply-To` header carries that address
- **AND** for rebalance alerts, if `EMAIL_UNSUBSCRIBE_MAILTO` is set, the message includes
  `List-Unsubscribe` (mailto) and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers
