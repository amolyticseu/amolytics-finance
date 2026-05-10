# Phase 2 Task 5 Read-only Invoices QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Invoices Supabase integration with fallback mode  
Status: Pending Antigravity QC

## Objective

Verify that the Invoices page has been safely connected to Supabase in read-only mode while preserving fallback behavior and keeping the rest of the app stable.

This QC pass should confirm that invoices can be read safely from Supabase when configured, and fallback mock data is shown when Supabase is unavailable, errors, or returns zero rows.

## Scope

Check these areas:

1. Invoices data access
   - src/lib/data/invoices.ts exists
   - getInvoices() exists
   - Missing Supabase env vars return fallback invoice data
   - Supabase query errors return fallback invoice data with console.warn
   - Successful query with zero rows returns fallback invoice data
   - Successful query with rows returns normalized database invoice rows
   - Soft-deleted invoices are excluded if deleted_at exists
   - Invoices are sorted by year desc, month desc, period_code desc, then created_at desc where applicable
   - Return source is `"database"` or `"fallback"`
   - Query includes client information using clients(name, code) where possible

2. Invoice database types
   - src/lib/supabase/types.ts includes invoice row/list item support
   - Invoice type supports:
     - id
     - client_id
     - invoice_number
     - period_code
     - month
     - year
     - hours
     - hourly_rate
     - currency
     - amount
     - status
     - sent_date
     - due_date
     - paid_date
     - bank_account_id
     - payment_reference
     - workspace_recovery_amount
     - notes
     - created_at
     - updated_at
     - deleted_at if present
   - Numeric values are handled safely if returned as string or number from Postgres
   - Invoice status includes cancelled if needed

3. Invoices UI
   - /invoices uses getInvoices()
   - /invoices is dynamic if needed
   - /invoices renders fallback invoice rows without .env.local
   - /invoices shows:
     - invoice number
     - client
     - period
     - month/year
     - hours
     - rate
     - amount
     - status
     - sent date
     - paid date or pending marker
     - bank/payment reference when available
   - /invoices includes a muted fallback/database mode note
   - SectionCard description reflects database vs fallback source
   - UI remains visually consistent with Phase 1

4. Fallback invoice data
   - Existing mock invoice data remains available
   - Fallback invoices contain meaningful BMF / 8BMF8 examples
   - Mock data in src/data/mock/tables.ts was not unnecessarily deleted

5. Existing read-only integrations
   - /settings still works
   - /team still works
   - Clients and bank account shared data layers still work
   - No regression from Tasks 2–4

6. Supabase scope
   - /settings remains connected to Supabase-backed read-only data access
   - /team remains connected to Supabase-backed read-only data access
   - /invoices is now connected to Supabase-backed read-only data access
   - /dashboard remains mock-based
   - /payments remains mock-based
   - /salaries remains mock-based
   - /expenses remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No invoice create/edit/delete was introduced
   - No PDF generation was introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

7. Documentation
   - docs/2026-05-10-phase-2-task-5-readonly-invoices.md exists
   - It explains:
     - what was implemented
     - files changed
     - why invoices were chosen after clients and bank accounts
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

Perform a complete QC pass for Phase 2 Task 5.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-5-readonly-invoices.md
   - docs/2026-05-10-phase-2-task-5-readonly-invoices-qc.md
   - src/lib/data/invoices.ts
   - src/lib/data/clients.ts
   - src/lib/data/bank-accounts.ts
   - src/lib/data/settings.ts
   - src/lib/data/team.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/app/(app)/invoices/page.tsx
   - src/data/mock/tables.ts

2. Run sequentially:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /invoices loads
   - Confirm /invoices shows fallback BMF / 8BMF8 invoice rows
   - Confirm invoice fields render correctly:
     - invoice number
     - client
     - period
     - month/year
     - hours
     - rate
     - amount
     - status
     - sent date
     - paid date or pending marker
     - bank/payment reference when available
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Invoices page content:
   - Source note uses database/fallback consistently
   - Status badges are readable and appropriate
   - Currency formatting remains correct
   - Layout is readable on desktop and mobile
   - Tables do not overflow badly or become unreadable

5. Verify existing read-only pages:
   - /settings loads
   - /team loads
   - Fallback behavior still works for both

6. Verify other pages remain mock-based:
   - Visit /dashboard
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
     - invoices data/page files
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
   - Confirm this is read-only only
   - Confirm no CRUD forms were introduced
   - Confirm no PDF generation was introduced
   - Confirm no auth/protected-route/middleware work was introduced
   - Confirm payments/salaries/expenses/dashboard/reports were not prematurely connected

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

## Invoices UI Review

Comment on invoice table readability, formatting, and status display.

## Supabase Scope Review

Confirm whether Supabase integration is limited to Settings, Team, Invoices, and shared data layers only.

## Security / Secrets Review

Confirm whether any real secrets or unsafe keys were found.

## Build/Lint Review

Confirm sequential lint/build results.

## Missing Items

List anything missing from Phase 2 Task 5 scope.

## Technical Risks

List architecture or maintainability risks.

## Final Recommendation

Choose one:
- Pass Phase 2 Task 5 and move to Task 6
- Pass with minor fixes
- Needs fixes before Task 6

## Expected Results

Expected result: Phase 2 Task 5 should pass with no critical or high-severity issues.

The app must build, lint, run without .env.local, and show fallback Invoices data when Supabase is not configured or not seeded.

## Passed Checks

- `src/lib/data/invoices.ts` was successfully implemented with robust fallback behaviors, Supabase queries, typed `InvoiceListItem` maps, and safe numeric handling.
- `src/lib/supabase/types.ts` correctly adds the `invoices` table types and the `InvoiceStatus` includes `cancelled`.
- `src/app/(app)/invoices/page.tsx` was correctly refactored into a server component using `getInvoices()`, rendering all specified columns using fallback data.
- Fallback logic for `getInvoices()` works flawlessly without `.env.local`, returning the mock list safely.
- `/settings` and `/team` read-only pages maintain their functionality.
- Mock-based routes (`/dashboard`, `/payments`, `/salaries`, etc.) are completely unaffected and isolated.
- Lint and build pass sequentially without any issues.
- Documentation perfectly matches implementation details.

## Failed Checks / Bugs

None. No issues or regressions were found during the review.

## Fallback Mode Review

Fallback behavior functions as expected:
- **Missing env vars:** Correctly short-circuits to `fallbackInvoiceList()`. Verified locally by running without `.env.local`.
- **Query errors / zero-row successful queries:** The code paths in `src/lib/data/invoices.ts` successfully catch errors or zero-row returns, log a `console.warn`, and return the `fallback` source array.

## Invoices UI Review

The invoice table is highly readable and appropriately formatted:
- Currency formatting handles EUR and custom currencies dynamically.
- Period and Month/Year labels are clear.
- Status badges correctly display existing states including the new `cancelled` state.
- Layout remains consistent with the established design system (Phase 1) and scales cleanly across different viewports.

## Supabase Scope Review

Verified through grep search. Supabase-backed access is strictly isolated to:
- `settings` page/data
- `team` page/data
- `clients` data layer
- `bank-accounts` data layer
- `invoices` page/data
- Core Supabase utility files (`env.ts`, `server.ts`, `types.ts`, `middleware.ts`)
No CRUD logic, PDF generation, or premature auth/middleware work was introduced.

## Security / Secrets Review

Grep search confirmed that there are no unsafe keys, `service_role` secrets, passwords, or hardcoded `supabase.co` URLs in the codebase.

## Build/Lint Review

- `npm run lint`: Passed successfully.
- `npm run build`: Compiled successfully and optimized static pages without errors.

## Missing Items

None. All items outlined in the Phase 2 Task 5 scope are fully implemented.

## Technical Risks

None identified. The architecture cleanly separates the data fetching layer from the UI presentation. The consistent fallback approach handles absent configurations safely, laying a very stable ground for the upcoming Payments integration.

## Final Recommendation

- **Pass Phase 2 Task 5 and move to Task 6**

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASS**. The module is fully verified and ready for Phase 2 Task 6.
