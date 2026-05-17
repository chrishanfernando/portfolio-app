# Tasks

- [x] Diagnose: confirm `risk_profiles` not in production schema (cause: 0002 collision)
- [x] Rename / regenerate the risk-profile migration as `0003_ambitious_doctor_spectrum.sql`
- [x] Update `drizzle/meta/_journal.json` to register `0003`
- [x] Add `TURSO_AUTH_TOKEN` to `drizzle.config.ts` for CI/Vercel auth
- [x] Change `package.json` build script to `drizzle-kit migrate && next build`
- [x] Update `project.md` "Migrations" convention to mention build-time migrate
- [x] Manually verify: fresh Vercel deploy applies `0003`; `POST /api/risk-profile` succeeds in prod
