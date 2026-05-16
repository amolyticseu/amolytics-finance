# Phase 2 Task 19 Final Regression QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Full Phase 2 regression QC  
Status: Pending Antigravity QC

## QC status summary

| Layer | Status |
|-------|--------|
| **Static QC** (lint / build / code review) | **Passed** (partial — not sufficient alone) |
| **Tasks 13–18 functional CRUD QC** | **Pending** |
| **Final regression QC** (end-to-end, fallback + Supabase) | **Pending** |

> **Note (2026-05-16):** A prior Antigravity run verified `npm run lint`, `npm run build`, and static code review across Phase 2 but did **not** provide sufficient evidence of full browser/Supabase CRUD functional testing for Tasks 13–18. **Do not mark Task 19 or Phase 2 as PASSED** until Tasks 13–18 functional QC is complete and this regression pass is executed end-to-end.

## Objective

Perform a full end-to-end regression check for Phase 2 after read-only integrations and CRUD modules have been implemented.

This QC must confirm that the app is stable, consistent, secure, and ready before moving to Phase 3.

## Current Phase 2 Status

### Passed earlier

- Task 1 Supabase Foundation — `docs/2026-05-10-phase-2-supabase-foundation.md` / `docs/2026-05-10-phase-2-supabase-foundation-qc.md`
- Task 2 Read-only Settings — `docs/2026-05-10-phase-2-task-2-readonly-settings.md` / `docs/2026-05-10-phase-2-task-2-readonly-settings-qc.md`
- Task 3 Read-only Team — `docs/2026-05-10-phase-2-task-3-readonly-team.md` / `docs/2026-05-10-phase-2-task-3-readonly-team-qc.md`
- Task 4 Clients + Bank Accounts Data Layers — `docs/2026-05-10-phase-2-task-4-clients-bank-accounts-readonly.md` / `docs/2026-05-10-phase-2-task-4-clients-bank-accounts-readonly-qc.md`
- Task 5 Read-only Invoices — `docs/2026-05-10-phase-2-task-5-readonly-invoices.md` / `docs/2026-05-10-phase-2-task-5-readonly-invoices-qc.md`
- Task 6 Read-only Payments — `docs/2026-05-10-phase-2-task-6-readonly-payments.md` / `docs/2026-05-10-phase-2-task-6-readonly-payments-qc.md`
- Task 7 Read-only Salaries — `docs/2026-05-10-phase-2-task-7-readonly-salaries.md` / `docs/2026-05-10-phase-2-task-7-readonly-salaries-qc.md`
- Task 8 Read-only Expenses — `docs/2026-05-10-phase-2-task-8-readonly-expenses.md` / `docs/2026-05-10-phase-2-task-8-readonly-expenses-qc.md`
- Task 9 Read-only Tasks / Compliance — `docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance.md` / `docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance-qc.md`
- Task 10 Dashboard Real Summary — `docs/2026-05-10-phase-2-task-10-dashboard-real-summary.md` / `docs/2026-05-10-phase-2-task-10-dashboard-real-summary-qc.md`
- Task 11 Reports Real Monthly P&L — `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl.md` / `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl-qc.md`
- Task 12 CRUD Foundation Pattern — `docs/2026-05-10-phase-2-task-12-crud-foundation-pattern.md` / `docs/2026-05-10-phase-2-task-12-crud-foundation-pattern-qc.md`

### Implemented — static QC passed; functional CRUD QC pending

- Task 13 Clients + Bank Accounts CRUD — static **Passed** / functional **Pending**
- Task 14 Invoices CRUD — static **Passed** / functional **Pending**
- Task 15 Payments CRUD — static **Passed** / functional **Pending**
- Task 16 Team + Salaries CRUD — static **Passed** / functional **Pending**
- Task 17 Expenses CRUD — static **Passed** / functional **Pending**
- Task 18 Tasks / Compliance CRUD — static **Passed** / functional **Pending**

See each module QC doc under `docs/2026-05-10-phase-2-task-13-*` through `task-18-*`.

### Pending

- **Task 19** — Final regression QC (this document) — **Pending** until Tasks 13–18 **functional** QC is complete

**Phase 2 gate:** Phase 2 must **not** be marked **PASSED** until Tasks 13–18 **functional** module QC and Task 19 **final regression** QC all pass. Static lint/build/code review alone is **not** sufficient.

## Regression Scope

Check all routes:

### Main routes

- `/dashboard`
- `/settings`
- `/team`
- `/invoices`
- `/payments`
- `/salaries`
- `/expenses`
- `/tasks`
- `/reports`

### CRUD routes

- `/settings/clients`
- `/settings/clients/new`
- `/settings/clients/[id]/edit`
- `/settings/bank-accounts`
- `/settings/bank-accounts/new`
- `/settings/bank-accounts/[id]/edit`
- `/invoices/new`
- `/invoices/[id]/edit`
- `/payments/new`
- `/payments/[id]/edit`
- `/team/new`
- `/team/[id]/edit`
- `/salaries/new`
- `/salaries/[id]/edit`
- `/expenses/new`
- `/expenses/[id]/edit`
- `/tasks/new`
- `/tasks/[id]/edit`

## Core Checks

### 1. Build and lint

- `npm run lint`
- `npm run build`
- `npx tsc --noEmit` if available and useful

### 2. Fallback mode without Supabase env

Confirm app works without `.env.local`.

Expected:

- All list pages load
- Fallback rows render
- CRUD actions are disabled or safely blocked
- `local-fallback-*` rows are read-only
- No runtime crash from missing Supabase env vars

### 3. Supabase mode with env configured

When Supabase env is configured and schema/seed are applied:

Check:

- Lists read from database
- Create forms submit correctly
- Edit forms save correctly
- Deactivate/soft-delete/cancel actions work correctly
- Dashboard updates after relevant mutations
- Reports still load

### 4. Module CRUD checks

#### Clients

- Create client
- Edit client
- Deactivate client
- Inactive toggle works
- Settings still uses active clients

#### Bank Accounts

- Create bank account
- Edit bank account
- Deactivate bank account
- Masked ID is shown
- Full sensitive account numbers are not exposed
- Bank accounts remain flexible table rows, not enums

#### Invoices

- Create invoice
- Edit invoice
- Cancel invoice
- Show cancelled toggle works
- Client select works
- Bank account select works
- T01/T02/T03 works
- Workspace recovery amount works
- No PDF generation exists yet
- No payment row is auto-created

#### Payments

- Create payment
- Edit payment
- Soft-delete payment
- Invoice link is optional
- Salary payment link is optional
- Expense link is optional
- Bank account is required
- No forced invoice link

#### Team

- Create team member
- Edit team member
- Deactivate team member
- Show inactive works
- Active team list still works

#### Salaries

- Create salary payment
- Edit salary payment
- Soft-delete salary payment
- pending/partial/paid statuses work
- Team member required
- Bank account optional
- Total amount is manual

#### Expenses

- Create expense
- Edit expense
- Cancel/soft-delete expense
- recurring/rebillable flags work
- linked client optional
- bank account optional
- Workspace recovery can be manually represented
- No CSV import exists yet
- No recurring automation exists yet

#### Tasks / Compliance

- Create task
- Edit task
- Delete task
- Mark done
- Mark blocked
- Reopen task
- in_progress status still possible from form
- No reminders/notifications exist yet

### 5. Dashboard regression

Check:

- Dashboard loads
- Summary cards still render
- Dashboard fallback works
- Dashboard database mode works
- Revenue does not double-count payments
- Pending invoices and salaries logic still makes sense
- Tasks show correctly
- Revalidation after relevant mutations works where implemented

### 6. Reports regression

Check:

- Reports loads
- Chart renders
- Fallback monthly P&L works
- `monthly_snapshots` database mode works
- No CRUD affected reports unexpectedly

### 7. Security and secrets

Search for:

- `service_role`
- `SUPABASE_SERVICE_ROLE`
- `password`
- `secret`
- `supabase.co`
- real project URLs
- real API keys

Expected:

- No unsafe secrets committed
- No service role key in browser/client code
- No sensitive bank details exposed

### 8. UX and mobile checks

Check:

- Sidebar/header still work
- Mobile hamburger still works
- Tables are readable
- Forms are usable
- Buttons and destructive actions are clear
- Status badges are readable
- Empty/fallback states are understandable

### 9. Documentation checks

Confirm docs exist for:

- Phase 2 Tasks 1–18 (implementation + QC pairs)
- Task 19 final regression QC doc (this file)
- Master remaining phases execution plan (`docs/2026-05-10-master-remaining-phases-execution-plan.md`)

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer.

Perform a full Phase 2 regression pass.

**Important:** Start with module-level QC for Tasks 13–18 if they have not already been independently tested. Then run this final regression pass.

Steps:

1. Run:
   - `npm run lint`
   - `npm run build`
   - `npx tsc --noEmit` if available

2. Test fallback mode without `.env.local`:
   - Start app
   - Visit every main route
   - Visit CRUD routes where possible
   - Confirm fallback lists work
   - Confirm mutations are blocked safely when Supabase is not configured
   - Confirm `local-fallback-*` rows are read-only

3. Test Supabase mode if env is configured:
   - Confirm schema and seed are applied
   - Create/edit/deactivate clients
   - Create/edit/deactivate bank accounts
   - Create/edit/cancel invoices
   - Create/edit/soft-delete payments
   - Create/edit/deactivate team members
   - Create/edit/soft-delete salary payments
   - Create/edit/cancel expenses
   - Create/edit/delete/update-status tasks

4. Check dashboard and reports after CRUD mutations.

5. Run security scan for secrets.

6. Check mobile layout and table readability.

Return a structured QC report with the sections below.

## Passed Checks

*(Pending Antigravity report.)*

## Failed Checks / Bugs

*(Pending Antigravity report.)*

For each issue, document:

- Module
- Route
- Severity: critical / high / medium / low
- What happened
- Expected behavior
- Suggested fix

## CRUD Regression Review

*(Pending Antigravity report.)*

## Fallback Mode Review

*(Pending Antigravity report.)*

## Supabase Mode Review

*(Pending Antigravity report.)*

## Dashboard / Reports Review

*(Pending Antigravity report.)*

## Security / Secrets Review

*(Pending Antigravity report.)*

## UX / Mobile Review

*(Pending Antigravity report.)*

## Documentation Review

*(Pending Antigravity report.)*

## Final Recommendation

Choose one:

- Pass Phase 2 and move to Phase 3
- Pass with minor fixes
- Needs fixes before Phase 3

*(Pending Antigravity report.)*

## Issues Found

Pending Antigravity report.

## Fixes Applied

Pending.

## Final QC Status

- **Overall:** **Pending**
- **Static QC:** **Passed** (lint/build/code review only — insufficient for Phase 2 sign-off)
- **Tasks 13–18 functional CRUD QC:** **Pending**
- **Final regression QC:** **Pending**

Do **not** run or sign off Task 19 final regression until Tasks 13–18 functional CRUD QC is complete.
