# Phase 2 Supabase CRUD Functional QC Plan — Amolytics Finance

Date: 2026-05-16  
Status: Pending Supabase-mode Antigravity QC

## Objective

Verify real Supabase-backed create/edit/deactivate/delete/cancel/status actions for Phase 2 Tasks 13–18 before Phase 2 final regression.

## Prerequisites

**Before running Supabase-mode QC**, confirm `.env.local` has **non-empty** values (do not paste real secrets into docs or commits):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If either is missing or empty, Supabase CRUD functional QC is **blocked** — as occurred for Task 13 on 2026-05-16.

- `.env.local` is configured with valid credentials (local only; never commit)
- `supabase/schema.sql` has been applied
- `supabase/seed.sql` has been applied
- `npm run lint` passes
- `npm run build` passes
- `npm run dev` starts successfully
- Use test records only where possible
- Do not enter full sensitive bank account numbers
- Use masked bank identifiers only

## Test Order

Run in this order:

1. Task 13 — Clients + Bank Accounts CRUD
2. Task 14 — Invoices CRUD
3. Task 15 — Payments CRUD
4. Task 16 — Team + Salaries CRUD
5. Task 17 — Expenses CRUD
6. Task 18 — Tasks / Compliance CRUD
7. Task 19 — Final regression QC

## Task 13 — Clients + Bank Accounts CRUD

Test:

- Create a test client
- Edit the test client
- Deactivate the test client
- Confirm inactive toggle shows it
- Confirm active clients list excludes inactive client where expected

Bank accounts:

- Create a test bank account
- Confirm full number is masked if pasted
- Edit the test bank account
- Deactivate the test bank account
- Confirm inactive/deleted toggle shows it
- Confirm active bank account lists exclude deactivated accounts where expected
- Confirm no full sensitive bank details are exposed in UI

## Task 14 — Invoices CRUD

Test:

- Create a test invoice
- Edit the test invoice
- Cancel the test invoice
- Confirm **Show cancelled** displays it
- Confirm client select works
- Confirm bank account select works
- Confirm T01/T02/T03 period works
- Confirm workspace recovery amount can be saved
- Confirm no PDF generation exists yet
- Confirm no payment row is auto-created

## Task 15 — Payments CRUD

Test:

- Create a test payment
- Edit the test payment
- Soft-delete the test payment
- Confirm removed toggle displays it if available
- Confirm invoice link is optional
- Confirm salary payment link is optional
- Confirm expense link is optional
- Confirm bank account is required
- Confirm no forced invoice link exists

## Task 16 — Team + Salaries CRUD

Team:

- Create a test team member
- Edit the test team member
- Deactivate the test team member
- Confirm inactive toggle displays it

Salaries:

- Create a test salary payment linked to a team member
- Edit the test salary payment
- Soft-delete the test salary payment
- Confirm pending/partial/paid statuses work
- Confirm bank account link is optional
- Confirm total amount is manual

## Task 17 — Expenses CRUD

Test:

- Create a test expense
- Edit the test expense
- Cancel/soft-delete the test expense
- Confirm recurring and rebillable flags save correctly
- Confirm linked client is optional
- Confirm bank account is optional
- Confirm workspace recovery can be manually represented
- Confirm no CSV import exists yet
- Confirm no recurring automation exists yet

## Task 18 — Tasks / Compliance CRUD

Test:

- Create a test task
- Edit the test task
- Mark done
- Mark blocked
- Reopen
- Delete task
- Confirm `in_progress` status can be selected from the form
- Confirm no reminders/notifications exist yet

## Cross-module checks

After the above:

- Dashboard loads and updates where revalidation is implemented
- Reports loads
- Settings loads
- No route crashes
- No unsafe secrets found
- `npm run lint` passes
- `npm run build` passes

## Documentation Update Requirements

After Antigravity completes Supabase-mode QC:

- Update Task 13 QC doc — `docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud-qc.md`
- Update Task 14 QC doc — `docs/2026-05-10-phase-2-task-14-invoices-crud-qc.md`
- Update Task 15 QC doc — `docs/2026-05-10-phase-2-task-15-payments-crud-qc.md`
- Update Task 16 QC doc — `docs/2026-05-10-phase-2-task-16-team-salaries-crud-qc.md`
- Update Task 17 QC doc — `docs/2026-05-10-phase-2-task-17-expenses-crud-qc.md`
- Update Task 18 QC doc — `docs/2026-05-10-phase-2-task-18-tasks-compliance-crud-qc.md`
- Update master execution plan — `docs/2026-05-10-master-remaining-phases-execution-plan.md`

Each task should show:

| Layer | Expected after Supabase QC |
|-------|----------------------------|
| Static QC | Passed |
| Fallback functional QC | Passed |
| Supabase CRUD functional QC | Passed or Failed |
| Overall status | Full pass only if Supabase CRUD passed; otherwise Failed or partial with findings |

## Final Recommendation Rule

Only if Tasks 13–18 Supabase CRUD functional QC pass, proceed to:

`docs/2026-05-10-phase-2-task-19-final-regression-qc.md`

Do **not** mark Phase 2 passed before Task 19 final regression passes.

## Related docs

- `docs/2026-05-10-master-remaining-phases-execution-plan.md`
- `docs/2026-05-10-phase-2-task-19-final-regression-qc.md`
- `docs/2026-05-16-business-context-update-hsbc-documents-rebillables.md`
- Phase 2 Task 13–18 implementation and QC docs under `docs/2026-05-10-phase-2-task-*`
