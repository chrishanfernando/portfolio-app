# Transactions Delta — Fees & cost transparency

## MODIFIED Requirements

### Requirement: Transaction record shape
Each transaction SHALL carry: `id`, `assetId`, `date` (ISO `YYYY-MM-DD`), `action`, `quantity`, optional `unitPriceLocal`, optional `localCurrency`, optional `fxRate`, `unitPriceAud`, `splitMultiplier` (default `1`), `adjustedQty`, `totalAud`, optional `feeAud` (brokerage paid for this trade, AUD; nullable means unknown — historical rows imported before this capability remain null), optional `source`, optional `comment`.

`total_aud` retains its existing semantic: the gross consideration including brokerage. `fee_aud` is the explicit slice — it is stored alongside, not subtracted from, `total_aud`, so cost-basis math and import-idempotency keys remain unchanged.

#### Scenario: Foreign-currency buy
- **GIVEN** a buy of 10 shares at USD 100 with FX 0.65 USD/AUD and brokerage USD 5
- **THEN** the row stores `unit_price_local = 100`, `local_currency = "USD"`, `fx_rate = 0.65`, `unit_price_aud ≈ 153.85`, `total_aud ≈ 1538.46 + 7.69 = 1546.15` (gross including brokerage)
- **AND** `fee_aud ≈ 7.69`

#### Scenario: AUD-native trade with known brokerage
- **GIVEN** a buy of 100 shares at AUD 50 with brokerage AUD 11
- **THEN** `unit_price_aud = 50`, `total_aud = 5011`, and `fee_aud = 11`

#### Scenario: AUD-native trade with unknown brokerage
- **GIVEN** a manual entry where the user did not record brokerage
- **THEN** `fee_aud = null` (unknown), not `0`

## ADDED Requirements

### Requirement: Importer brokerage extraction
Importers SHALL populate `fee_aud` when the source file or message exposes a
brokerage / commission / trade-fee field. Brokerage SHALL be stored in
`fee_aud` in AUD and SHALL NOT be subtracted from `total_aud`.

#### Scenario: CMC web CSV
- **GIVEN** a CMC CSV row whose "Brokerage" column reads `$11.00`
- **WHEN** the importer creates the transaction
- **THEN** the resulting row has `fee_aud = 11.00`
- **AND** `total_aud` continues to reflect the CSV's "Trade Value" field (gross consideration)
- **AND** `source = "cmc"`

#### Scenario: CMC trade-confirmation email
- **GIVEN** a CMC email whose body contains `Brokerage: AUD 9.95`
- **WHEN** the email parser ingests the message
- **THEN** the created transaction has `fee_aud = 9.95` and `source = "cmc-email"`

#### Scenario: Stake AU CSV
- **GIVEN** a Stake CSV row with `Brokerage AUD = 3.00`
- **WHEN** the importer creates the transaction
- **THEN** the row has `fee_aud = 3.00` and `source = "stake"`

#### Scenario: Swyftx CSV
- **GIVEN** a Swyftx row with `Fee AUD = 1.23`
- **WHEN** the importer creates the transaction
- **THEN** the row has `fee_aud = 1.23` and `source = "swyftx"`

#### Scenario: Interactive Brokers report
- **GIVEN** an IR flex-query row whose Commission column is `-5.00 USD` and FX is `0.65`
- **WHEN** the importer creates the transaction
- **THEN** the row has `fee_aud ≈ 7.69` (`|commission_local| / fx_rate`) and `source = "ir"`

#### Scenario: Importer source omits brokerage
- **GIVEN** a source file with no brokerage column or field
- **WHEN** the importer creates the transaction
- **THEN** `fee_aud = null` (unknown), not `0`

### Requirement: Manual brokerage entry
The transactions UI SHALL allow the user to set or override `fee_aud` when
creating or editing a transaction. Empty input SHALL persist as `null`, not
`0`.

#### Scenario: New manual transaction with brokerage
- **WHEN** the user submits the new-transaction form with `feeAud = 11`
- **THEN** the inserted row has `fee_aud = 11`

#### Scenario: Editing a historical transaction
- **GIVEN** a transaction with `fee_aud = null` (pre-existing)
- **WHEN** the user edits it and sets `feeAud = 9.95`
- **THEN** the row updates to `fee_aud = 9.95` and `unknownBrokerageCount` decreases on the next `/api/fees` response
