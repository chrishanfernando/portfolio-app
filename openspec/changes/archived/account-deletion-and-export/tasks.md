# Tasks

- [x] Implement `GET /api/account/export` with full JSON snapshot + download header
- [x] Implement `GET /api/account/summary` (profile / asset / transaction counts)
- [x] Implement `GET /api/account/auth-method` returning `{ hasPassword }`
- [x] Wire Better Auth `beforeDelete` hook with manual cascade (prices, transactions, assets, category targets, cmc mappings, risk profiles, profiles)
- [x] UI: settings page section with export button + delete-account confirmation flow
- [x] Update auth spec
- [x] Manually verify: export downloads valid JSON; delete leaves no rows for the user in any table; FK errors do not zombie the `user` row
