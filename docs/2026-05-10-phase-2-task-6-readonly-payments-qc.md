# Phase 2 Task 6 Read-only Payments QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Payments Supabase integration with fallback mode  
Status: Pending Antigravity QC

## Objective

Verify that the Payments page has been safely connected to Supabase in read-only mode while preserving fallback behavior and keeping the rest of the app stable.

This QC pass should confirm that payments can be read safely from Supabase when configured, and fallback mock data is shown when Supabase is unavailable, errors, or returns zero rows.

## Scope

Check these areas:

1. Payments data access
   - src/lib/data/payments.ts exists
   - getPayments() exists
   - Missing Supabase env vars return fallback payment data
   - Supabase query errors return fallback payment data with console.warn
   - Successful query with zero rows returns fallback payment data
   - Successful query with rows returns normalized database payment rows
   - Soft-deleted payments are excluded if deleted_at exists
   - Payments are sorted by payment_date desc, then created_at desc
   - Return source is `"database"` or `"fallback"`
   - Query includes linked invoice number using invoices(invoice_number) where possible
   - Query includes bank display using bank_accounts(account_name, institution_name) where possible

2. Payment database types
   - src/lib/supabase/types.ts includes:
     - PaymentDirection
     - PaymentTypeDb
     - PaymentRow
     - PaymentListItem
   - Payment type supports:
     - id
     - payment_type
     - direction
     - invoice_id
     - salary_payment_id
     - expense_id
     - bank_account_id
     - amount
     - currency
     - payment_date
     - reference
     - payer_payee_name
     - notes
     - created_at
     - updated_at
     - deleted_at
   - Numeric values are handled safely if returned as string or number from Postgres
   - Joined invoice_number and bank_display are supported safely

3. Payments UI
   - /payments uses getPayments()
   - /payments is dynamic if needed
   - /payments renders fallback payment rows without .env.local
   - /payments shows:
     - payment date
     - direction
     - type
     - amount
     - currency
     - linked invoice number when available
     - bank/account
     - reference
     - payer/payee name
     - notes when available
   - /payments includes a muted fallback/database mode note
   - SectionCard description reflects database vs fallback source
   - UI remains visually consistent with Phase 1

4. Fallback payment data
   - Existing mock payment data remains available
   - Fallback payments contain meaningful BMF / 8BMF8 examples where present
   - Mock data in src/data/mock/tables.ts was not unnecessarily deleted

5. Existing read-only integrations
   - /settings still works
   - /team still works
   - /invoices still works
   - Clients and bank account shared data layers still work
   - No regression from Tasks 2–5

6. Supabase scope
   - /settings remains connected to Supabase-backed read-only data access
   - /team remains connected to Supabase-backed read-only data access
   - /invoices remains connected to Supabase-backed read-only data access
   - /payments is now connected to Supabase-backed read-only data access
   - /dashboard remains mock-based
   - /salaries remains mock-based
   - /expenses remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No payment create/edit/delete was introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

7. Documentation
   - docs/2026-05-10-phase-2-task-6-readonly-payments.md exists
   - It explains:
     - what was implemented
     - files changed
     - why payments were chosen after invoices
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

Perform a complete QC pass for Phase 2 Task 6.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-6-readonly-payments.md
   - docs/2026-05-10-phase-2-task-6-readonly-payments-qc.md
   - src/lib/data/payments.ts
   - src/lib/data/invoices.ts
   - src/lib/data/clients.ts
   - src/lib/data/bank-accounts.ts
   - src/lib/data/settings.ts
   - src/lib/data/team.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/app/(app)/payments/page.tsx
   - src/data/mock/tables.ts

2. Run sequentially:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /payments loads
   - Confirm /payments shows fallback payment rows
   - Confirm payment fields render correctly:
     - payment date
     - direction
     - type
     - amount
     - currency
     - linked invoice number when available
     - bank/account
     - reference
     - payer/payee name
     - notes when available
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Payments page content:
   - Source note uses database/fallback consistently
   - Direction and type values are readable
   - Currency formatting remains correct
   - Linked invoice and bank/account labels are readable
   - Layout is readable on desktop and mobile
   - Tables do not overflow badly or become unreadable

5. Verify existing read-only pages:
   - /settings loads
   - /team loads
   - /invoices loads
   - Fallback behavior still works for all

6. Verify other pages remain mock-based:
   - Visit /dashboard
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
     - payments data/page files
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
   - Confirm no auth/protected-route/middleware work was introduced
   - Confirm salaries/expenses/dashboard/reports/tasks were not prematurely connected

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

## Payments UI Review

Comment on payment table readability, formatting, direction/type display, linked invoice, and bank/account display.

## Supabase Scope Review

Confirm whether Supabase integration is limited to Settings, Team, Invoices, Payments, and shared data layers only.

## Security / Secrets Review

Confirm whether any real secrets or unsafe keys were found.

## Build/Lint Review

Confirm sequential lint/build results.

## Missing Items

List anything missing from Phase 2 Task 6 scope.

## Technical Risks

List architecture or maintainability risks.

## Final Recommendation

Choose one:
- Pass Phase 2 Task 6 and move to Task 7
- Pass with minor fixes
- Needs fixes before Task 7

## Expected Results

Expected result: Phase 2 Task 6 should pass with no critical or high-severity issues.

The app must build, lint, run without .env.local, and show fallback Payments data when Supabase is not configured or not seeded.

## Passed Checks

- `src/lib/data/payments.ts` was successfully implemented with robust fallback behaviors, Supabase queries, typed `PaymentListItem` mappings, safe numeric handling, and embedded join data.
- `src/lib/supabase/types.ts` correctly adds the `payments` table types, supporting `PaymentDirection` and `PaymentTypeDb`.
- `src/app/(app)/payments/page.tsx` correctly refactored into an async server component using `getPayments()`, rendering all specified columns with fallback data properly.
- Fallback logic for `getPayments()` works seamlessly without `.env.local`, returning the mock list successfully.
- `/settings`, `/team`, and `/invoices` read-only pages maintain their functionality.
- Mock-based routes (`/dashboard`, `/salaries`, `/expenses`, `/tasks`, `/reports`) are unaffected and remain fully isolated.
- Lint and build pass sequentially without any issues.
- Documentation accurately reflects implementation details.

## Failed Checks / Bugs

None. No issues or regressions were found during the review.

## Fallback Mode Review

Fallback behavior works as designed:
- **Missing env vars:** Correctly circumvents the Supabase client creation and directly returns `fallbackPaymentList()`. Validated via local testing without `.env.local`.
- **Query errors / zero-row successful queries:** The exception paths in `src/lib/data/payments.ts` accurately handle connection failures, query errors, or empty results by logging a `console.warn` and returning the mock fallback data cleanly.

## Payments UI Review

The payment table layout and formatting pass validation:
- Direction and Payment Type text map cleanly via `formatDirection` and `formatPaymentType`.
- Currency formatting handles dynamic input.
- Linked Invoice logic surfaces the formatted invoice ID or falls back to a hyphen.
- Bank Account logic accurately displays the bank institution text or the fallback account reference ID cleanly without overflowing the container.
- Design patterns consistently map back to Phase 1 tokens and scales perfectly on desktop widths.

## Supabase Scope Review

Verified through grep search. Supabase-backed access is securely isolated to:
- `settings` page/data
- `team` page/data
- `invoices` page/data
- `payments` page/data
- Shared foundational data layers (`clients.ts`, `bank-accounts.ts`)
- Core Supabase utility files (`env.ts`, `server.ts`, `types.ts`)
No premature CRUD forms, auth interfaces, or unapproved page refactors were injected.

## Security / Secrets Review

Grep search confirms that there are no unsafe API keys, `service_role` secrets, passwords, or unauthorized `supabase.co` URLs hardcoded in the repository.

## Build/Lint Review

- `npm run lint`: Completed sequentially with zero errors or warnings.
- `npm run build`: Compiled perfectly, accurately handling the dynamic prerender paths for `payments`.

## Missing Items

None. All scope items requested for Phase 2 Task 6 have been fully implemented.

## Technical Risks

None identified. The table joins handle null states flawlessly when records are orphaned. The fallback pipeline is incredibly robust, keeping the local developer experience completely unbroken.

## Final Recommendation

- **Pass Phase 2 Task 6 and move to Task 7**

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASS**. The module is verified and ready for Phase 2 Task 7.
