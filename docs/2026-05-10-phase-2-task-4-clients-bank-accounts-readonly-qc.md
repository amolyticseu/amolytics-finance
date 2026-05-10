# Phase 2 Task 4 Clients + Bank Accounts Read-only QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Shared read-only Clients and Bank Accounts data layers  
Status: Pending Antigravity QC

## Objective

Verify that Clients and Bank Accounts were extracted into clean shared read-only data layers, Settings still works correctly, and no new CRUD/auth/module wiring was introduced prematurely.

This QC pass should confirm that the app is ready to proceed toward invoice and payment read-only integration.

## Scope

Check these areas:

1. Clients data layer
   - src/lib/data/clients.ts exists
   - getActiveClients() exists
   - Missing Supabase env vars return fallback client data
   - Supabase query errors return fallback client data with console.warn
   - Successful query with zero rows returns fallback client data
   - Successful query with rows returns normalized database client rows
   - Only active clients are returned by default
   - Clients are sorted by name ascending
   - Return source is `"database"` or `"fallback"`
   - Fallback client includes:
     - 8BMF8 / BMF
     - contact Mariusz
     - €15/hr
     - EUR

2. Bank Accounts data layer
   - src/lib/data/bank-accounts.ts exists
   - getActiveBankAccounts() exists
   - Missing Supabase env vars return fallback bank account data
   - Supabase query errors return fallback bank account data with console.warn
   - Successful query with zero rows returns fallback bank account data
   - Successful query with rows returns normalized database bank account rows
   - Only active and non-deleted bank accounts are returned by default
   - Bank accounts are sorted by institution_name, then account_name
   - Return source is `"database"` or `"fallback"`
   - Fallback bank accounts include:
     - Wise EUR personal
     - Revolut
     - HSBC Malta
     - ICICI India
     - Future Amolytics OPC current account placeholder
   - UI does not expose full sensitive account details

3. Settings refactor
   - src/lib/data/settings.ts now only handles getLatestExchangeRate()
   - Settings imports client data from src/lib/data/clients.ts
   - Settings imports bank account data from src/lib/data/bank-accounts.ts
   - Settings imports exchange rate data from src/lib/data/settings.ts
   - Settings still renders:
     - exchange rate
     - active/default client
     - bank accounts
     - planning references
     - preferences
   - Settings clearly displays database vs fallback source where applicable
   - Settings still works without .env.local

4. Team integrity
   - /team still works
   - /team fallback behavior is unchanged
   - Team page was not unintentionally modified

5. Supabase scope
   - /settings remains connected to Supabase-backed read-only data access
   - /team remains connected to Supabase-backed read-only data access
   - /dashboard remains mock-based
   - /invoices remains mock-based
   - /payments remains mock-based
   - /salaries remains mock-based
   - /expenses remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

6. Type coverage
   - src/lib/supabase/types.ts includes usable clients row type
   - src/lib/supabase/types.ts includes usable bank_accounts row type
   - src/lib/supabase/types.ts includes usable exchange_rates row type
   - Numeric fields are safely handled if returned as string or number from Postgres
   - Masked/display bank account fields are used safely

7. Documentation
   - docs/2026-05-10-phase-2-task-4-clients-bank-accounts-readonly.md exists
   - It explains:
     - what was implemented
     - files changed
     - why clients and bank accounts were extracted before invoices/payments
     - fallback behavior
     - Supabase tables read
     - what is intentionally not implemented
     - how to verify with and without Supabase env vars
     - next recommended task

8. Technical checks
   - npm run lint passes
   - npm run build passes
   - npm run dev starts
   - App works without .env.local
   - No real secrets are committed
   - No service role key is used

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer.

Perform a complete QC pass for Phase 2 Task 4.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-4-clients-bank-accounts-readonly.md
   - docs/2026-05-10-phase-2-task-4-clients-bank-accounts-readonly-qc.md
   - src/lib/data/clients.ts
   - src/lib/data/bank-accounts.ts
   - src/lib/data/settings.ts
   - src/lib/data/team.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/app/(app)/settings/page.tsx
   - src/app/(app)/team/page.tsx

2. Run sequentially:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /settings loads
   - Confirm /settings shows fallback exchange rate
   - Confirm /settings shows fallback client:
     - 8BMF8 / BMF
     - Mariusz
     - €15/hr
     - EUR
   - Confirm /settings shows fallback bank accounts:
     - Wise
     - Revolut
     - HSBC Malta
     - ICICI India
     - Amolytics OPC placeholder
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Settings page content:
   - Exchange rate is visible
   - Client defaults are visible
   - Bank account list is visible
   - Source indicators use database/fallback consistently
   - No full sensitive bank account details are exposed
   - Layout is readable on desktop and mobile

5. Verify Team page still works:
   - /team loads
   - fallback team members still render
   - no regression from Task 3

6. Verify other pages remain mock-based:
   - Visit /dashboard
   - Visit /invoices
   - Visit /payments
   - Visit /salaries
   - Visit /expenses
   - Visit /tasks
   - Visit /reports
   - Confirm they still load and were not prematurely connected to Supabase

7. Code search:
   - Search for Supabase imports
   - Confirm only expected files use Supabase-backed access:
     - Supabase utility files
     - settings data/page files
     - team data/page files
     - clients data layer
     - bank-accounts data layer
   - Search for:
     - service_role
     - SUPABASE_SERVICE_ROLE
     - password
     - secret
     - real Supabase project URL patterns
   - Confirm no unsafe secrets exist

8. Review fallback behavior:
   - Confirm missing env vars trigger fallback
   - Confirm query error path returns fallback
   - Confirm successful zero-row query path returns fallback
   - Confirm fallback behavior is documented

9. Review architecture:
   - Confirm clients and bank accounts are now reusable for future invoices/payments
   - Confirm Settings no longer owns too much client/bank-account logic
   - Confirm this is read-only only
   - Confirm no CRUD forms were introduced
   - Confirm no auth/protected-route/middleware work was introduced

Return a structured QC report with:

## Passed Checks

List everything that passed.

## Failed Checks / Bugs

For each issue, include:
- File/page/component
- Severity: critical/high/medium/low
- What happened
- Expected behavior
- Suggested fix

## Fallback Mode Review

Confirm whether fallback behavior works for:
- missing env vars
- query errors
- zero-row successful queries

## Supabase Scope Review

Confirm whether Supabase integration is limited to Settings, Team, and shared clients/bank-accounts data access.

## Security / Secrets Review

Confirm whether any real secrets or unsafe keys were found.

## Build/Lint Review

Confirm sequential lint/build results.

## Missing Items

List anything missing from Phase 2 Task 4 scope.

## Technical Risks

List architecture or maintainability risks.

## Final Recommendation

Choose one:
- Pass Phase 2 Task 4 and move to Task 5
- Pass with minor fixes
- Needs fixes before Task 5

## Expected Results

Expected result: Phase 2 Task 4 should pass with no critical or high-severity issues.

The app must build, lint, run without .env.local, and show fallback Settings data when Supabase is not configured or not seeded.

## Passed Checks

- `src/lib/data/clients.ts` exists and implements `getActiveClients()` with proper sorting and fallback handling.
- `src/lib/data/bank-accounts.ts` exists and implements `getActiveBankAccounts()` correctly.
- Settings page logic was successfully refactored to consume the new shared modules.
- `/team` page was successfully verified to work without any regression.
- Mock-based routes (`/dashboard`, `/invoices`, `/payments`, etc.) load successfully and respond with status 200 without premature Supabase integration.
- Lint and build pass sequentially without any issues.
- Safe `numeric` handling and JSDoc typing verified in `src/lib/supabase/types.ts`.
- Documentation matches implementation.

## Failed Checks / Bugs

None. No issues were found during the review.

## Fallback Mode Review

Fallback behavior functions as intended:
- **Missing env vars:** Correctly short-circuits to fallback data. Verified locally by running without `.env.local`.
- **Query errors / zero-row successful queries:** The code paths in `src/lib/data/clients.ts` and `src/lib/data/bank-accounts.ts` successfully log a `console.warn` and return the `fallback` source arrays.

## Supabase Scope Review

Verified through grep search. Supabase-backed access is strictly limited to:
- Supabase utility files (`env.ts`, `server.ts`, `types.ts`, `middleware.ts`)
- `settings` page/data
- `team` page/data
- `clients` data layer
- `bank-accounts` data layer
No other CRUD forms, auth interfaces, or middlewares were introduced.

## Security / Secrets Review

Grep search confirmed that there are no unsafe keys, `service_role` secrets, passwords, or hardcoded `supabase.co` URLs in the codebase.

## Build/Lint Review

- `npm run lint`: Passed without errors.
- `npm run build`: Compiled successfully and prerendered static content without errors.

## Missing Items

None. All items outlined in Phase 2 Task 4 scope are fully implemented.

## Technical Risks

None identified. The architecture cleanly separates the data layer from UI rendering. The fallback approach is consistent and mitigates runtime errors during mock environments. The modules are properly staged for reuse in upcoming transactional invoice and payment flows.

## Final Recommendation

- **Pass Phase 2 Task 4 and move to Task 5**

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASS**. The module is verified and ready for Phase 2 Task 5.
