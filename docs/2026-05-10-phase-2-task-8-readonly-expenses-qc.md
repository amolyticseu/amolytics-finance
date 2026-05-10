# Phase 2 Task 8 Read-only Expenses QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Expenses Supabase integration with fallback mode  
Status: Pending Antigravity QC

## Objective

Verify that the Expenses page has been safely connected to Supabase in read-only mode while preserving fallback behavior and keeping the rest of the app stable.

This QC pass should confirm that expenses can be read safely from Supabase when configured, and fallback expense data is shown when Supabase is unavailable, errors, or returns zero rows.

## Scope

Check these areas:

1. Expenses data access
   - src/lib/data/expenses.ts exists
   - getExpenses() exists
   - Missing Supabase env vars return fallback expense data
   - Supabase query errors return fallback expense data with console.warn
   - Successful query with zero rows returns fallback expense data
   - Successful query with rows returns normalized database expense rows
   - Soft-deleted expenses are excluded if deleted_at exists
   - Expenses are sorted by expense_date desc, due_date desc, then created_at desc
   - Return source is `"database"` or `"fallback"`
   - Query includes linked client using clients(name, code) where possible
   - Query includes bank display using bank_accounts(account_name, institution_name) where possible

2. Expense database/domain types
   - src/types/index.ts includes:
     - ExpenseCategoryDb
     - ExpenseStatus
   - Legacy ExpenseCategory remains unchanged
   - src/lib/supabase/types.ts includes:
     - ExpenseRow
     - ExpenseListItem
     - Database.public.Tables.expenses
   - Expense type supports:
     - id
     - category
     - name
     - amount
     - currency
     - expense_date
     - due_date
     - status
     - recurring
     - rebillable
     - linked_client_id
     - bank_account_id
     - payment_reference
     - notes
     - created_at
     - updated_at
     - deleted_at if present
   - Numeric values are handled safely if returned as string or number from Postgres
   - Joined client_name, client_code, and bank_display are supported safely

3. Expense categories and statuses
   - Statuses support:
     - pending
     - paid
     - overdue
     - cancelled
   - Categories support:
     - emi
     - rent
     - utilities
     - subscription
     - workspace
     - tax
     - compliance
     - other
   - StatusBadge renders expense statuses correctly

4. Expenses UI
   - /expenses uses getExpenses()
   - /expenses is dynamic if needed
   - /expenses renders fallback expense rows without .env.local
   - /expenses shows:
     - expense date or due date
     - category
     - name
     - amount
     - currency
     - status
     - recurring yes/no
     - rebillable yes/no
     - linked client when available
     - bank/account
     - payment reference
     - notes when available
   - /expenses includes a muted fallback/database mode note
   - SectionCard description reflects database vs fallback source
   - UI remains visually consistent with Phase 1

5. Fallback expense data
   - Fallback includes:
     - Kotak EMI ₹16,352
     - IDFC EMI ₹20,528
     - Axis 1 EMI ₹26,619
     - Axis 2 EMI ₹6,099
     - Malta rent €500
     - Malta utilities €125
     - Workspace recovery pending €163.08 as rebillable workspace item
   - Workspace recovery is linked/displayed with BMF or 8BMF8 client context
   - Existing mockExpenseLines remains available and was not unnecessarily deleted

6. Existing read-only integrations
   - /settings still works
   - /team still works
   - /invoices still works
   - /payments still works
   - /salaries still works
   - Clients and bank account shared data layers still work
   - No regression from Tasks 2–7

7. Supabase scope
   - /settings remains connected to Supabase-backed read-only data access
   - /team remains connected to Supabase-backed read-only data access
   - /invoices remains connected to Supabase-backed read-only data access
   - /payments remains connected to Supabase-backed read-only data access
   - /salaries remains connected to Supabase-backed read-only data access
   - /expenses is now connected to Supabase-backed read-only data access
   - /dashboard remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No expense create/edit/delete was introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

8. Documentation
   - docs/2026-05-10-phase-2-task-8-readonly-expenses.md exists
   - It explains:
     - what was implemented
     - files changed
     - why expenses were chosen after salaries
     - fallback behavior
     - Supabase tables read
     - what is intentionally not implemented
     - how to verify with and without Supabase env vars
     - next recommended task

9. Technical checks
   - npm run lint passes
   - npm run build passes
   - npm run dev starts
   - App works without .env.local
   - No real secrets are committed
   - No service role key is used

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer.

Perform a complete QC pass for Phase 2 Task 8.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-8-readonly-expenses.md
   - docs/2026-05-10-phase-2-task-8-readonly-expenses-qc.md
   - src/lib/data/expenses.ts
   - src/lib/data/salaries.ts
   - src/lib/data/payments.ts
   - src/lib/data/clients.ts
   - src/lib/data/bank-accounts.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/types/index.ts
   - src/components/shell/status-badge.tsx
   - src/app/(app)/expenses/page.tsx
   - src/data/mock/tables.ts

2. Run sequentially:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /expenses loads
   - Confirm /expenses shows fallback expense rows for:
     - Kotak EMI ₹16,352
     - IDFC EMI ₹20,528
     - Axis 1 EMI ₹26,619
     - Axis 2 EMI ₹6,099
     - Malta rent €500
     - Malta utilities €125
     - Workspace recovery €163.08
   - Confirm expense fields render correctly:
     - date
     - category
     - name
     - amount
     - currency
     - status
     - recurring
     - rebillable
     - linked client
     - bank/account
     - payment reference
     - notes
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Expenses page content:
   - Source note uses database/fallback consistently
   - Status badges are readable
   - INR and EUR formatting remain correct
   - Recurring and rebillable values are readable
   - Workspace recovery is clearly rebillable
   - Linked BMF/8BMF8 client context is visible where applicable
   - Bank/account labels are readable
   - Layout is readable on desktop and mobile
   - Tables do not overflow badly or become unreadable

5. Verify existing read-only pages:
   - /settings loads
   - /team loads
   - /invoices loads
   - /payments loads
   - /salaries loads
   - Fallback behavior still works for all

6. Verify other pages remain mock-based:
   - Visit /dashboard
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
     - salaries data/page files
     - expenses data/page files
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
   - Confirm dashboard/reports/tasks were not prematurely connected

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

## Expenses UI Review

Comment on expense table readability, INR/EUR formatting, status display, category display, recurring/rebillable display, linked client display, and bank/account display.

## Supabase Scope Review

Confirm whether Supabase integration is limited to Settings, Team, Invoices, Payments, Salaries, Expenses, and shared data layers only.

## Security / Secrets Review

Confirm whether any real secrets or unsafe keys were found.

## Build/Lint Review

Confirm sequential lint/build results.

## Missing Items

List anything missing from Phase 2 Task 8 scope.

## Technical Risks

List architecture or maintainability risks.

## Final Recommendation

Choose one:
- Pass Phase 2 Task 8 and move to Task 9
- Pass with minor fixes
- Needs fixes before Task 9

## Expected Results

Expected result: Phase 2 Task 8 should pass with no critical or high-severity issues.

The app must build, lint, run without .env.local, and show fallback Expenses data when Supabase is not configured or not seeded.

## Passed Checks

- `src/lib/data/expenses.ts` successfully implements robust fallback behaviors, Supabase queries, and strongly typed `ExpenseListItem` mappings including `clients` and `bank_accounts` joins.
- `src/lib/supabase/types.ts` correctly adds the `expenses` table type definitions along with `ExpenseCategoryDb` and `ExpenseStatus` schemas mapping accurately back to `src/types/index.ts`.
- `src/app/(app)/expenses/page.tsx` flawlessly renders the expenses module as an async server component containing dynamic columns (recurring/rebillable boolean flags, date/due-date clusters).
- Fallback logic triggers correctly when `.env.local` is omitted, successfully injecting the exact seven mock records (Kotlin, IDFC, Axis EMIs, Malta rent/utilities, and Workspace recovery) without database errors.
- `/settings`, `/team`, `/invoices`, `/payments`, and `/salaries` remain fully operational in read-only integration.
- Unaffected routes (`/dashboard`, `/tasks`, `/reports`) load without disruption and safely retain their localized mock states.
- Sequential `npm run lint` and `npm run build` pass effortlessly.
- Technical documentation correctly aligns with the executed changes.

## Failed Checks / Bugs

None. No issues or regressions surfaced during testing.

## Fallback Mode Review

Fallback mechanism is fully operational:
- **Missing env vars:** Correctly intercepts Supabase initialisation and successfully constructs the required seven INR and EUR fallback arrays directly. Confirmed by executing the server locally without `.env.local`.
- **Query errors / zero-row successful queries:** The try/catch paths correctly capture query exceptions and zero-result evaluations, firing the exact same fallback response predictably while logging standard terminal warnings.

## Expenses UI Review

The Expenses interface is highly polished:
- INR and EUR mapping holds true via native localization helpers.
- Rebillable and Recurring boolean values appropriately output as Yes/No.
- Embedded Client values output accurately (e.g., matching the Workspace recovery line to "Amolytics · BMF (8BMF8)").
- Status values tie directly to the generic badges and represent as Pending, Paid, Cancelled, Overdue natively.
- UI elements do not overflow their containers even with longer client labels or notes.

## Supabase Scope Review

Verified through grep searching. Supabase-backed imports and logic remain strictly confined to:
- `settings`
- `team`
- `invoices`
- `payments`
- `salaries`
- `expenses`
- Shared data layers and core utility libraries.
No CRUD workflows, unapproved page transitions, or unprotected auth scopes have been pushed. Dashboard, reports, and tasks remain explicitly mocked.

## Security / Secrets Review

Grep scanning verified that zero production passwords, `service_role` secrets, non-safe environment parameters, or raw `.supabase.co` domains have leaked into the repository.

## Build/Lint Review

- `npm run lint`: Completed sequentially with zero errors.
- `npm run build`: Compiled perfectly, correctly treating the new `/expenses` page as a dynamic node.

## Missing Items

None. All scope elements listed for Phase 2 Task 8 have been rigorously executed.

## Technical Risks

None discovered. The boolean conversions (`toBool`) natively catch Postgres edge-cases ('t', 'true', 1) extremely efficiently. The pattern is completely robust.

## Final Recommendation

- **Pass Phase 2 Task 8 and move to Task 9**

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASS**. The module is fully verified and ready for Phase 2 Task 9.
