# Phase 2 Task 2 Read-only Settings QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Settings Supabase integration with fallback mode  
Status: Pending Antigravity QC

## Objective

Verify that the first read-only Supabase integration is safe, scoped, and stable.

This QC pass should confirm that only the Settings page reads from Supabase and that the app works correctly with or without Supabase environment variables or seed data.

## Scope

Check these areas:

1. Environment handling
   - src/lib/supabase/env.ts exists
   - hasSupabaseEnv() returns true only when both public env vars are present and non-empty
   - getSupabaseEnv() does not run at import time
   - Missing env vars do not crash the app

2. Supabase clients
   - src/lib/supabase/client.ts uses getSupabaseEnv() safely
   - src/lib/supabase/server.ts uses getSupabaseEnv() safely
   - Supabase clients are typed with Database
   - No app route crashes without .env.local

3. Database types
   - src/lib/supabase/types.ts includes usable table types for:
     - clients
     - bank_accounts
     - exchange_rates
     - team_members
   - Types are compatible with Supabase createClient generics

4. Settings data layer
   - src/lib/data/settings.ts exists
   - getLatestExchangeRate() reads latest EUR to INR from exchange_rates when configured
   - getActiveBankAccounts() reads active, non-deleted bank accounts when configured
   - getActiveClientDefaults() reads active clients when configured
   - Missing env vars return fallback defaults
   - Query errors return fallback defaults with console.warn
   - Successful queries with zero rows return fallback defaults
   - Data normalization handles Postgres numeric values safely

5. Settings UI
   - /settings is the only page connected to Supabase
   - /settings renders with fallback defaults when env vars are missing
   - /settings shows:
     - default/latest exchange rate
     - active/default client
     - bank account list
     - planning references
     - preferences
   - /settings includes a clear note about database values vs fallback mock mode
   - /settings layout remains consistent with Phase 1 style

6. Other routes
   - /dashboard remains mock-based
   - /invoices remains mock-based
   - /payments remains mock-based
   - /team remains mock-based
   - /salaries remains mock-based
   - /expenses remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No other route imports the Settings data layer or Supabase client

7. Technical checks
   - npm run lint passes
   - npm run build passes
   - npm run dev starts
   - App works without .env.local
   - No real secrets are committed
   - No service role key is used
   - /settings is dynamic if needed
   - Other routes remain static/dynamic as appropriate

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer.

Perform a complete QC pass for Phase 2 Task 2.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-2-readonly-settings.md
   - docs/2026-05-10-phase-2-task-2-readonly-settings-qc.md
   - src/lib/supabase/env.ts
   - src/lib/supabase/client.ts
   - src/lib/supabase/server.ts
   - src/lib/supabase/types.ts
   - src/lib/data/settings.ts
   - src/app/(app)/settings/page.tsx

2. Run:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /settings loads
   - Confirm /settings shows fallback/default values
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Settings page content:
   - Exchange rate is shown
   - Client 8BMF8 / BMF or fallback equivalent is shown
   - Bank accounts/fallback accounts are shown
   - Note about fallback/database mode is visible
   - Layout is readable on desktop and mobile

5. Verify other pages:
   - Visit /dashboard
   - Visit /invoices
   - Visit /payments
   - Visit /team
   - Visit /salaries
   - Visit /expenses
   - Visit /tasks
   - Visit /reports
   - Confirm they still use mock data and do not crash

6. Code search:
   - Search for Supabase imports
   - Confirm only expected utility/data/settings files and /settings use Supabase
   - Search for:
     - service_role
     - SUPABASE_SERVICE_ROLE
     - password
     - secret
     - real Supabase project URL patterns
   - Confirm no unsafe secrets exist

7. Review fallback behavior:
   - Confirm missing env vars trigger fallback
   - Confirm query error path returns fallback
   - Confirm successful zero-row query path returns fallback
   - Confirm fallback behavior is documented

8. Review architecture:
   - Confirm this is a small read-only integration
   - Confirm no CRUD forms were introduced
   - Confirm no auth/protected-route/middleware work was introduced
   - Confirm dashboard/invoices/payments were not prematurely connected

Return a structured QC report with:

## Passed Checks

- **Environment Handling:** `hasSupabaseEnv` and `getSupabaseEnv` provide safe, clear handling. The app boots cleanly without `.env.local`.
- **Supabase Clients:** Configured with `Database` generic. They correctly avoid importing or connecting until requested safely by `settings.ts`.
- **Database Types:** Types are correctly partially scaffolded for the required tables (`clients`, `bank_accounts`, `exchange_rates`, `team_members`) and match the schema structure.
- **Settings Data Layer:** `settings.ts` successfully implements robust fallback logic for missing env vars, query errors, and zero-row returns.
- **Settings UI:** The `/settings` page dynamically loads (`force-dynamic`). When missing env vars, it gracefully shows the fallback mock data alongside a clear banner explaining the fallback state.
- **Other Routes:** All other pages (`/dashboard`, `/invoices`, `/payments`, etc.) remain fully mock-driven and static.
- **Technical Checks:** `npm run lint` and `npm run build` completed perfectly with 0 errors. The build correctly marked `/settings` as a dynamic server-rendered page.

## Failed Checks / Bugs

None. Zero issues found.

## Fallback Mode Review

**PASSED**. Fallback behavior correctly functions for all required paths:
- Missing env vars: Checked. `settings.ts` intercepts this via `hasSupabaseEnv()`.
- Query errors: Checked. Handled natively in the try-catch block and `warnFallback`.
- Zero-row queries: Checked. `!data` and `rows.length === 0` trigger fallbacks and warnings without breaking the app.

## Supabase Scope Review

**PASSED**. `grep` checks confirm only `settings/page.tsx` and the `lib/data/settings.ts` / `lib/supabase/*` utility files interact with Supabase logic. Other pages are completely untouched.

## Security / Secrets Review

**PASSED**. `grep` searches for `service_role`, `SUPABASE_SERVICE_ROLE`, `password`, and `secret` returned no results. No insecure API keys or URLs are committed.

## Missing Items

None. Everything is implemented according to the Phase 2 Task 2 spec.

## Technical Risks

None. The isolated, safe read-only approach works beautifully and prepares the foundation for Phase 2 Task 3 with zero technical debt or instability.

## Final Recommendation

**Pass Phase 2 Task 2 and move to Task 3.**

## Expected Results

Expected result: Phase 2 Task 2 should pass with no critical or high-severity issues.

The app must build, lint, run without `.env.local`, and show fallback Settings data when Supabase is not configured or not seeded.

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASSED**. Ready for Phase 2 Task 3.
