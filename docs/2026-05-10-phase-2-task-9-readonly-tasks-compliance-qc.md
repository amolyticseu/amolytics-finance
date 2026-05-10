# Phase 2 Task 9 Read-only Tasks / Compliance QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Tasks / Compliance Supabase integration with fallback mode  
Status: Passed Antigravity QC

## Objective

Verify that the Tasks / Compliance page has been safely connected to Supabase in read-only mode while preserving fallback behavior and keeping the rest of the app stable.

This QC pass should confirm that tasks can be read safely from Supabase when configured, and fallback task/compliance data is shown when Supabase is unavailable, errors, or returns zero rows.

## Scope

Check these areas:

1. Tasks data access
   - src/lib/data/tasks.ts exists
   - getTasks() exists
   - Missing Supabase env vars return fallback task data
   - Supabase query errors return fallback task data with console.warn
   - Successful query with zero rows returns fallback task data
   - Successful query with rows returns normalized database task rows
   - Tasks are sorted by:
     - incomplete first
     - due_date ascending, nulls last
     - priority urgent/high before medium/low
     - created_at descending as final tie-breaker
   - Return source is `"database"` or `"fallback"`

2. Task database/domain types
   - src/types/index.ts includes:
     - TaskCategoryDb
     - TaskDbStatus
     - TaskPriorityDb
   - Phase 1 TaskStatus remains available for mocks if still needed
   - FinanceStatus includes task DB statuses where needed
   - src/lib/supabase/types.ts includes:
     - TaskRow
     - Database.public.Tables.tasks

3. Task fields
   - Task type supports:
     - id
     - title
     - description
     - category
     - status
     - priority
     - due_date
     - completed_at
     - related_entity_type
     - related_entity_id
     - notes
     - created_at
     - updated_at

4. Task categories, statuses, and priorities
   - Categories support:
     - invoice
     - payment
     - salary
     - compliance
     - tax
     - company
     - bank
     - other
   - Statuses support:
     - todo
     - in_progress
     - done
     - blocked
   - Priorities support:
     - low
     - medium
     - high
     - urgent
   - StatusBadge renders todo and blocked clearly
   - Blocked is visually distinct enough to catch attention

5. Tasks UI
   - /tasks uses getTasks()
   - /tasks is dynamic if needed
   - /tasks renders fallback task rows without .env.local
   - /tasks shows:
     - title
     - category
     - status
     - priority
     - due date
     - completed date if done
     - related entity type/id when available
     - description or notes in detail
   - /tasks includes a muted fallback/database mode note
   - SectionCard description reflects database vs fallback source
   - UI remains visually consistent with Phase 1

6. Fallback task data
   - Fallback includes meaningful rows for:
     - India OPC bank account follow-up
     - PAN/TAN or MCA email follow-up
     - Malta VAT registration exploration
     - Invoice follow-up
     - Workspace recovery follow-up
     - Accountant/CA follow-up
     - Payment reminder
     - At least one done task
     - At least one blocked task
   - Existing mockComplianceTasks remains available and was not unnecessarily deleted

7. Existing read-only integrations
   - /settings still works
   - /team still works
   - /invoices still works
   - /payments still works
   - /salaries still works
   - /expenses still works
   - Clients and bank account shared data layers still work
   - No regression from Tasks 2–8

8. Supabase scope
   - /settings remains connected to Supabase-backed read-only data access
   - /team remains connected to Supabase-backed read-only data access
   - /invoices remains connected to Supabase-backed read-only data access
   - /payments remains connected to Supabase-backed read-only data access
   - /salaries remains connected to Supabase-backed read-only data access
   - /expenses remains connected to Supabase-backed read-only data access
   - /tasks is now connected to Supabase-backed read-only data access
   - /dashboard remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No task create/edit/delete/complete actions were introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

9. Documentation
   - docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance.md exists
   - It explains:
     - what was implemented
     - files changed
     - why tasks/compliance were chosen after expenses
     - fallback behavior
     - Supabase table read
     - what is intentionally not implemented
     - how to verify with and without Supabase env vars
     - next recommended task

10. Technical checks
   - npm run lint passes
   - npm run build passes
   - npm run dev starts
   - App works without .env.local
   - No real secrets are committed
   - No service role key is used

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer.

Perform a complete QC pass for Phase 2 Task 9.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance.md
   - docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance-qc.md
   - src/lib/data/tasks.ts
   - src/lib/data/expenses.ts
   - src/lib/data/salaries.ts
   - src/lib/data/payments.ts
   - src/lib/data/invoices.ts
   - src/lib/data/clients.ts
   - src/lib/data/bank-accounts.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/types/index.ts
   - src/components/shell/status-badge.tsx
   - src/app/(app)/tasks/page.tsx
   - src/data/mock/tables.ts

2. Run sequentially:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /tasks loads
   - Confirm /tasks shows fallback task rows for:
     - India OPC bank account follow-up
     - PAN/TAN or MCA email follow-up
     - Malta VAT registration
     - Invoice follow-up
     - Workspace recovery follow-up
     - Accountant/CA follow-up
     - Payment reminder
   - Confirm at least one done task is visible
   - Confirm at least one blocked task is visible
   - Confirm task fields render correctly:
     - title
     - category
     - status
     - priority
     - due date
     - completed date when done
     - related entity type/id
     - detail/description/notes
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Tasks page content:
   - Source note uses database/fallback consistently
   - Status badges are readable
   - Todo and blocked badges render clearly
   - Priority values are readable
   - Due dates are readable
   - Detail column is readable
   - Layout is readable on desktop and mobile
   - Tables do not overflow badly or become unreadable

5. Verify existing read-only pages:
   - /settings loads
   - /team loads
   - /invoices loads
   - /payments loads
   - /salaries loads
   - /expenses loads
   - Fallback behavior still works for all

6. Verify other pages remain mock-based:
   - Visit /dashboard
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
     - tasks data/page files
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
   - Confirm dashboard/reports were not prematurely connected

Return a structured QC report with:

## Passed Checks

- `src/lib/data/tasks.ts` successfully implements robust fallback behaviors, Supabase queries, and strongly typed `TaskRow` mappings without any problematic `.is("deleted_at", null)` clauses (as there is no soft delete on tasks).
- `src/lib/supabase/types.ts` correctly adds the `tasks` table type definitions along with `TaskCategoryDb`, `TaskDbStatus`, and `TaskPriorityDb` schemas mapping accurately back to `src/types/index.ts`.
- `src/components/shell/status-badge.tsx` successfully added and visually styled `todo` and `blocked` statuses with high-visibility classes.
- `src/app/(app)/tasks/page.tsx` flawlessly renders the tasks module as an async server component containing dynamic columns (related entities formatted nicely, descriptions/notes stacking well without overflowing).
- Fallback logic triggers correctly when `.env.local` is omitted, successfully injecting the exact eight mock records (OPC bank account follow-up, PAN/MCA, Malta VAT, Invoice follow-up, Workspace recovery, CA checklist, Payment reminder, and the single DONE payroll row).
- Task sorting (incomplete first, due date ascending, priority urgent-to-low, created_at desc) works flawlessly in the data layer itself.
- `/settings`, `/team`, `/invoices`, `/payments`, `/salaries`, and `/expenses` remain fully operational in read-only integration.
- Unaffected routes (`/dashboard`, `/reports`) load without disruption and safely retain their localized mock states.
- Sequential `npm run lint` and `npm run build` pass effortlessly.
- Technical documentation correctly aligns with the executed changes.

## Failed Checks / Bugs

None. No issues or regressions surfaced during testing.

## Fallback Mode Review

Fallback mechanism is fully operational:
- **Missing env vars:** Correctly intercepts Supabase initialisation and successfully constructs the required eight fallback arrays directly. Confirmed by executing the server locally without `.env.local`.
- **Query errors / zero-row successful queries:** The try/catch paths correctly capture query exceptions and zero-result evaluations, firing the exact same fallback response predictably while logging standard terminal warnings.

## Tasks UI Review

The Tasks interface is highly polished:
- Task statuses map beautifully into `StatusBadge`. `blocked` properly uses the destructive variant for immediate attention, and `todo` renders neutrally.
- Dates format uniformly into `YYYY-MM-DD` strings.
- Related IDs are cleanly truncated so they do not break UI lines.
- Priorities (`urgent`, `high`, `medium`, `low`) render textually cleanly in capitalizing format.
- Done tasks naturally drift to the bottom of the list.

## Supabase Scope Review

Verified through grep searching. Supabase-backed imports and logic remain strictly confined to:
- `settings`
- `team`
- `invoices`
- `payments`
- `salaries`
- `expenses`
- `tasks`
- Shared data layers and core utility libraries.
No CRUD workflows, unapproved page transitions, or unprotected auth scopes have been pushed. Dashboard and reports remain explicitly mocked.

## Security / Secrets Review

Grep scanning verified that zero production passwords, `service_role` secrets, non-safe environment parameters, or raw `.supabase.co` domains have leaked into the repository.

## Build/Lint Review

- `npm run lint`: Completed sequentially with zero errors.
- `npm run build`: Compiled perfectly, correctly treating the new `/tasks` page as a dynamic node.

## Missing Items

None. All scope elements listed for Phase 2 Task 9 have been rigorously executed.

## Technical Risks

None discovered.

## Final Recommendation

- **Pass Phase 2 Task 9 and move to Task 10**

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASS**. The module is fully verified and ready for Phase 2 Task 10.
