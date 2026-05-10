# Phase 2 Task 7 Read-only Salaries QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Salaries Supabase integration with fallback mode  
Status: Pending Antigravity QC

## Objective

Verify that the Salaries page has been safely connected to Supabase in read-only mode while preserving fallback behavior and keeping the rest of the app stable.

This QC pass should confirm that salary payments can be read safely from Supabase when configured, and fallback salary data is shown when Supabase is unavailable, errors, or returns zero rows.

## Scope

Check these areas:

1. Salaries data access
   - src/lib/data/salaries.ts exists
   - getSalaryPayments() exists
   - Missing Supabase env vars return fallback salary data
   - Supabase query errors return fallback salary data with console.warn
   - Successful query with zero rows returns fallback salary data
   - Successful query with rows returns normalized database salary rows
   - Soft-deleted salary payments are excluded if deleted_at exists
   - Salary rows are sorted by year desc, month desc, then team member name asc
   - Return source is `"database"` or `"fallback"`
   - Query includes team member name/role using team_members(name, role) where possible
   - Query includes bank display using bank_accounts(account_name, institution_name) where possible

2. Salary database/domain types
   - src/lib/supabase/types.ts includes:
     - SalaryPaymentRow
     - SalaryPaymentListItem
     - Database.public.Tables.salary_payments
   - SalaryPaymentStatus exists in src/types/index.ts
   - SalaryPaymentStatus supports:
     - pending
     - partial
     - paid
   - FinanceStatus includes salary payment statuses where needed
   - StatusBadge supports partial clearly

3. Salary payment fields
   - Salary type supports:
     - id
     - team_member_id
     - month
     - year
     - base_amount
     - reimbursement
     - deduction
     - total_amount
     - currency
     - status
     - payment_date
     - bank_account_id
     - transaction_reference
     - notes
     - created_at
     - updated_at
     - deleted_at if present
   - Numeric values are handled safely if returned as string or number from Postgres
   - Joined member_name, member_role, and bank_display are supported safely

4. Salaries UI
   - /salaries uses getSalaryPayments()
   - /salaries is dynamic if needed
   - /salaries renders fallback salary rows without .env.local
   - /salaries shows:
     - month/year
     - team member
     - role when available
     - base amount
     - reimbursement
     - deduction
     - total amount
     - currency
     - status
     - payment date or pending marker
     - bank/account
     - transaction reference
     - notes when available
   - /salaries includes a muted fallback/database mode note
   - SectionCard description reflects database vs fallback source
   - UI remains visually consistent with Phase 1

5. Fallback salary data
   - Fallback includes meaningful salary rows for:
     - Ganpat
     - Kamal
     - Vinod
     - Vasudev
     - Siddhatta
   - Fallback rows are for May 2026 INR
   - Existing mockSalaryRuns remains available and was not unnecessarily deleted

6. Existing read-only integrations
   - /settings still works
   - /team still works
   - /invoices still works
   - /payments still works
   - Clients and bank account shared data layers still work
   - No regression from Tasks 2–6

7. Supabase scope
   - /settings remains connected to Supabase-backed read-only data access
   - /team remains connected to Supabase-backed read-only data access
   - /invoices remains connected to Supabase-backed read-only data access
   - /payments remains connected to Supabase-backed read-only data access
   - /salaries is now connected to Supabase-backed read-only data access
   - /dashboard remains mock-based
   - /expenses remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No salary create/edit/delete was introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

8. Documentation
   - docs/2026-05-10-phase-2-task-7-readonly-salaries.md exists
   - It explains:
     - what was implemented
     - files changed
     - why salaries were chosen after team and payments
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

Perform a complete QC pass for Phase 2 Task 7.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-7-readonly-salaries.md
   - docs/2026-05-10-phase-2-task-7-readonly-salaries-qc.md
   - src/lib/data/salaries.ts
   - src/lib/data/team.ts
   - src/lib/data/payments.ts
   - src/lib/data/bank-accounts.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/types/index.ts
   - src/components/shell/status-badge.tsx
   - src/app/(app)/salaries/page.tsx
   - src/data/mock/tables.ts

2. Run sequentially:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /salaries loads
   - Confirm /salaries shows fallback salary rows for:
     - Ganpat
     - Kamal
     - Vinod
     - Vasudev
     - Siddhatta
   - Confirm salary fields render correctly:
     - month/year
     - team member
     - role
     - base amount
     - reimbursement
     - deduction
     - total amount
     - currency
     - status
     - payment date or pending marker
     - bank/account
     - transaction reference
     - notes
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Salaries page content:
   - Source note uses database/fallback consistently
   - Status badges are readable
   - Partial status badge is visually distinct and readable
   - INR formatting remains correct
   - Bank/account labels are readable
   - Layout is readable on desktop and mobile
   - Tables do not overflow badly or become unreadable

5. Verify existing read-only pages:
   - /settings loads
   - /team loads
   - /invoices loads
   - /payments loads
   - Fallback behavior still works for all

6. Verify other pages remain mock-based:
   - Visit /dashboard
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
     - salaries data/page files
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
   - Confirm expenses/dashboard/reports/tasks were not prematurely connected

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

## Salaries UI Review

Comment on salary table readability, INR formatting, status display, partial badge, team member display, and bank/account display.

## Supabase Scope Review

Confirm whether Supabase integration is limited to Settings, Team, Invoices, Payments, Salaries, and shared data layers only.

## Security / Secrets Review

Confirm whether any real secrets or unsafe keys were found.

## Build/Lint Review

Confirm sequential lint/build results.

## Missing Items

List anything missing from Phase 2 Task 7 scope.

## Technical Risks

List architecture or maintainability risks.

## Final Recommendation

Choose one:
- Pass Phase 2 Task 7 and move to Task 8
- Pass with minor fixes
- Needs fixes before Task 8

## Expected Results

Expected result: Phase 2 Task 7 should pass with no critical or high-severity issues.

The app must build, lint, run without .env.local, and show fallback Salaries data when Supabase is not configured or not seeded.

## Passed Checks

- `src/lib/data/salaries.ts` was implemented successfully with robust fallback mechanisms, Supabase queries, typed mappings, and deeply embedded join data (team members and bank accounts).
- `src/lib/supabase/types.ts` correctly added the `salary_payments` table types and `SalaryPaymentListItem`.
- `src/types/index.ts` appropriately introduced `SalaryPaymentStatus` (`pending`, `partial`, `paid`) and integrated it into the `FinanceStatus` union.
- `src/components/shell/status-badge.tsx` successfully supports the new `partial` status visually.
- `src/app/(app)/salaries/page.tsx` gracefully maps all properties, utilizing async data fetching and conditional styling.
- Fallback logic for `getSalaryPayments()` triggers correctly when `.env.local` is omitted, returning 5 dynamic INR mock rows mapped perfectly to Ganpat, Kamal, Vinod, Vasudev, and Siddhatta.
- `/settings`, `/team`, `/invoices`, and `/payments` continue working as read-only pages without friction.
- Unaffected routes (`/dashboard`, `/expenses`, `/tasks`, `/reports`) load without errors and stay mocked.
- Lint (`eslint`) and Build (`next build`) pass sequentially with zero errors.
- Documentation aligns with implementation.

## Failed Checks / Bugs

None. No issues or regressions were detected during this review.

## Fallback Mode Review

Fallback behavior works natively:
- **Missing env vars:** Correctly intercepts the process before Supabase initialisation and successfully generates the INR mock objects dynamically based on the `mockTeamFallbackMembers`. Verified locally by testing without `.env.local`.
- **Query errors / zero-row successful queries:** The try/catch paths in `src/lib/data/salaries.ts` effectively guard against bad states by logging warnings and immediately returning the identical fallback payload.

## Salaries UI Review

The salaries table performs wonderfully:
- INR formatting remains completely precise using custom localization configurations.
- The `partial` status badge correctly uses Amber coloring matching the rest of the app's established design language.
- Month/Year formatting evaluates beautifully as e.g., "May 2026".
- Data mapping seamlessly handles embedded joins (names and bank arrays) while showing fallback markers ("—") for missing roles or disconnected bank/transaction info.

## Supabase Scope Review

Verified via global grep search. Supabase-backed imports and logic remain rigidly confined to:
- `settings`
- `team`
- `invoices`
- `payments`
- `salaries`
- Shared data layers and type registries.
Crucially, no CRUD flows, authentication walls, or unapproved page injections have snuck in.

## Security / Secrets Review

Grep scanning verified that zero active passwords, `service_role` secrets, unsafe environment setups, or live `.supabase.co` addresses are committed.

## Build/Lint Review

- `npm run lint`: Zero errors.
- `npm run build`: Compiled perfectly, accurately treating `/salaries` as dynamic.

## Missing Items

None. All scope items outlined for Phase 2 Task 7 were flawlessly executed.

## Technical Risks

None identified. The new `toFiniteNumberOrNull()` implementation makes the data layer incredibly resilient against edge cases from database numerical coercions.

## Final Recommendation

- **Pass Phase 2 Task 7 and move to Task 8**

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASS**. The module is fully verified and ready for Phase 2 Task 8.
