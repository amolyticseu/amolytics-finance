# Phase 2 Tasks 11–18 Cursor Prompt Pack — Amolytics Finance

Date: 2026-05-10  
Status: Prompt pack only  
Purpose: Ready-to-copy Cursor prompts for remaining Phase 2 implementation tasks

## Execution Rule

Each task must be completed separately.

For every task:

1. Cursor implements only that task.
2. Cursor creates the task implementation doc.
3. Cursor creates the task QC doc.
4. Antigravity runs QC.
5. The QC report is reviewed.
6. Only then proceed to the next task.

Do not implement Tasks 11–18 together in one code change.

---

# Task 11 — Reports Real Monthly P&L

## Cursor Prompt

We are starting Phase 2 Task 11 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-master-remaining-phases-execution-plan.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- docs/2026-05-10-phase-2-task-10-dashboard-real-summary.md
- docs/2026-05-10-phase-2-task-10-dashboard-real-summary-qc.md
- supabase/schema.sql
- supabase/seed.sql
- src/lib/data/dashboard.ts
- src/lib/data/invoices.ts
- src/lib/data/payments.ts
- src/lib/data/salaries.ts
- src/lib/data/expenses.ts
- src/lib/data/settings.ts
- src/lib/supabase/env.ts
- src/lib/supabase/types.ts
- src/data/mock/tables.ts
- src/app/(app)/reports/page.tsx
- any chart component used by Reports

Goal:

Connect the Reports page to real read-only monthly P&L data with safe fallback behavior.

Important:

- Do not build CRUD forms yet.
- Do not add auth/login UI.
- Do not add protected routes.
- Do not modify Dashboard behavior unless sharing safe utilities is necessary.
- Do not remove existing mock report data yet.
- Keep fallback data when Supabase env vars are missing, query fails, or tables have zero useful rows.
- Build and lint must pass.

Implement:

1. Add monthly_snapshots support in src/lib/supabase/types.ts.
2. Create src/lib/data/reports.ts with getMonthlyProfitLossReport().
3. Prefer monthly_snapshots as the report source.
4. If monthly_snapshots has no useful rows, fallback to mock monthly P&L.
5. Do not derive reports from all raw transaction records yet unless very simple and safe.
6. Sort monthly series by year ascending, month ascending.
7. Connect src/app/(app)/reports/page.tsx to getMonthlyProfitLossReport().
8. Keep Recharts chart working.
9. Add summary stat cards:
   - totalRevenueEur
   - totalExpensesEur
   - totalProfitLossEur
   - totalSalaryInr
   - totalEmiInr
   - latestMonthLabel
10. Add muted note:
   “Using database values when configured; fallback defaults are shown in local mock mode.”
11. Create docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl.md.
12. Create docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl-qc.md with Antigravity QC instructions.
13. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- /reports works without .env.local
- /reports uses fallback when no database data exists
- /reports is database-backed when monthly_snapshots exists
- /dashboard and all previous read-only pages still work
- No CRUD forms are introduced

---

# Task 12 — CRUD Foundation Pattern

## Cursor Prompt

We are starting Phase 2 Task 12 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-master-remaining-phases-execution-plan.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- all Phase 2 Task 1–11 docs and QC docs
- src/app/(app)
- src/lib/data
- src/lib/supabase
- src/components
- package.json

Goal:

Create the reusable CRUD foundation pattern before module-specific CRUD.

Important:

- Do not implement full CRUD for any module yet.
- Do not add auth/login UI yet.
- Do not add protected routes yet.
- Do not remove fallback read-only behavior.
- Build and lint must pass.

Implement:

1. Choose simple full-page or section-based forms first, not complex modals.
2. Add reusable form components if needed:
   - FormSection
   - FormActions
   - FieldError
   - SubmitButton
3. Add Zod validation setup.
4. Add React Hook Form integration if not already present.
5. Add a safe server action or mutation pattern.
6. Add loading, submit, success, and error patterns.
7. Add revalidate/redirect pattern for successful mutations.
8. Add soft-delete/deactivate strategy notes.
9. Do not wire this to full business modules yet.
10. Create one tiny internal example or utility if needed, but avoid visible unfinished UX.
11. Create docs/2026-05-10-phase-2-task-12-crud-foundation-pattern.md.
12. Create docs/2026-05-10-phase-2-task-12-crud-foundation-pattern-qc.md.
13. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- CRUD foundation exists
- No module CRUD is prematurely implemented
- All read-only pages still work
- No auth or middleware is introduced

---

# Task 13 — Clients + Bank Accounts CRUD

## Cursor Prompt

We are starting Phase 2 Task 13 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-phase-2-task-12-crud-foundation-pattern.md
- docs/2026-05-10-phase-2-task-12-crud-foundation-pattern-qc.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- supabase/schema.sql
- src/lib/data/clients.ts
- src/lib/data/bank-accounts.ts
- src/app/(app)/settings/page.tsx
- src/lib/supabase/types.ts

Goal:

Add CRUD flows for Clients and Bank Accounts.

Important:

- Do not expose full sensitive bank details.
- Keep masked/display account fields.
- Bank accounts must remain flexible table records, not enums.
- Use active/inactive or soft delete/deactivate.
- Do not build CRUD for invoices/payments/salaries/expenses/tasks yet.
- Build and lint must pass.

Implement:

1. Add create/edit/deactivate flows for clients.
2. Add create/edit/deactivate flows for bank accounts.
3. Use Zod validation.
4. Use the CRUD foundation pattern from Task 12.
5. Keep Settings page working.
6. Ensure fallback still works when Supabase is not configured.
7. Add user-friendly empty/error states.
8. Create docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud.md.
9. Create docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud-qc.md.
10. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- Clients can be created/edited/deactivated.
- Bank accounts can be created/edited/deactivated.
- Sensitive data remains masked.
- No other module CRUD is introduced.

---

# Task 14 — Invoices CRUD

## Cursor Prompt

We are starting Phase 2 Task 14 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud.md
- docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud-qc.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- supabase/schema.sql
- src/lib/data/invoices.ts
- src/lib/data/clients.ts
- src/lib/data/bank-accounts.ts
- src/app/(app)/invoices/page.tsx
- src/lib/supabase/types.ts

Goal:

Add manual invoice create/edit/cancel flows.

Important:

- Do not add PDF generation yet.
- Do not add payment CRUD here.
- Do not change dashboard/report calculations unless required.
- Build and lint must pass.

Implement:

1. Add invoice create flow.
2. Add invoice edit flow.
3. Add invoice cancel/soft-delete flow.
4. Fields:
   - client
   - invoice_number
   - period_code T01/T02/T03
   - month
   - year
   - hours
   - hourly_rate
   - amount
   - currency
   - status draft/sent/paid/overdue/cancelled
   - sent_date
   - due_date
   - paid_date
   - bank_account_id
   - payment_reference
   - workspace_recovery_amount
   - notes
5. Use Zod validation.
6. Use clients and bank accounts from database where configured.
7. Preserve fallback mode when Supabase is missing.
8. Create docs/2026-05-10-phase-2-task-14-invoices-crud.md.
9. Create docs/2026-05-10-phase-2-task-14-invoices-crud-qc.md.
10. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- Invoices can be created and edited.
- Invoices can be cancelled/soft-deleted.
- PDF generation is not introduced.
- Payments are not created here.

---

# Task 15 — Payments CRUD

## Cursor Prompt

We are starting Phase 2 Task 15 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-phase-2-task-14-invoices-crud.md
- docs/2026-05-10-phase-2-task-14-invoices-crud-qc.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- supabase/schema.sql
- src/lib/data/payments.ts
- src/lib/data/invoices.ts
- src/lib/data/bank-accounts.ts
- src/app/(app)/payments/page.tsx
- src/lib/supabase/types.ts

Goal:

Add manual payment create/edit/delete or soft-delete flows.

Important:

- Payments can optionally link invoice, salary payment, or expense.
- Do not force every payment to an invoice.
- Do not build salary/expense CRUD here.
- Build and lint must pass.

Implement:

1. Add payment create flow.
2. Add payment edit flow.
3. Add payment soft-delete flow.
4. Fields:
   - payment_type
   - direction
   - invoice_id optional
   - salary_payment_id optional
   - expense_id optional
   - bank_account_id
   - amount
   - currency
   - payment_date
   - reference
   - payer_payee_name
   - notes
5. Use Zod validation.
6. Validate links safely.
7. Preserve fallback mode when Supabase is missing.
8. Create docs/2026-05-10-phase-2-task-15-payments-crud.md.
9. Create docs/2026-05-10-phase-2-task-15-payments-crud-qc.md.
10. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- Payments can be created and edited.
- Payments can link to invoices/bank accounts.
- Optional links remain optional.
- No other module CRUD is introduced.

---

# Task 16 — Team + Salaries CRUD

## Cursor Prompt

We are starting Phase 2 Task 16 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-phase-2-task-15-payments-crud.md
- docs/2026-05-10-phase-2-task-15-payments-crud-qc.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- supabase/schema.sql
- src/lib/data/team.ts
- src/lib/data/salaries.ts
- src/lib/data/bank-accounts.ts
- src/app/(app)/team/page.tsx
- src/app/(app)/salaries/page.tsx
- src/lib/supabase/types.ts

Goal:

Add CRUD flows for Team Members and Salary Payments.

Important:

- Do not build expense CRUD here.
- Do not build payroll automation.
- Manual entry only.
- Build and lint must pass.

Implement:

1. Team member create/edit/deactivate.
2. Salary payment create/edit/soft-delete.
3. Team fields:
   - name
   - role
   - base_salary
   - currency
   - bank_name
   - bank_account_masked
   - active
   - notes
4. Salary fields:
   - team_member_id
   - month
   - year
   - base_amount
   - reimbursement
   - deduction
   - total_amount
   - currency
   - status pending/partial/paid
   - payment_date
   - bank_account_id
   - transaction_reference
   - notes
5. Use Zod validation.
6. Preserve fallback mode when Supabase is missing.
7. Create docs/2026-05-10-phase-2-task-16-team-salaries-crud.md.
8. Create docs/2026-05-10-phase-2-task-16-team-salaries-crud-qc.md.
9. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- Team members can be managed.
- Salary payments can be managed.
- Partial/paid/pending statuses work.
- No automation is introduced.

---

# Task 17 — Expenses CRUD

## Cursor Prompt

We are starting Phase 2 Task 17 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-phase-2-task-16-team-salaries-crud.md
- docs/2026-05-10-phase-2-task-16-team-salaries-crud-qc.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- supabase/schema.sql
- src/lib/data/expenses.ts
- src/lib/data/clients.ts
- src/lib/data/bank-accounts.ts
- src/app/(app)/expenses/page.tsx
- src/lib/supabase/types.ts

Goal:

Add manual expense create/edit/soft-delete flows.

Important:

- Manual entry only.
- Do not add CSV import yet.
- Do not add recurring automation yet.
- Build and lint must pass.

Implement:

1. Add expense create flow.
2. Add expense edit flow.
3. Add expense soft-delete/cancel flow.
4. Fields:
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
5. Use Zod validation.
6. Support categories:
   - emi
   - rent
   - utilities
   - subscription
   - workspace
   - tax
   - compliance
   - other
7. Support statuses:
   - pending
   - paid
   - overdue
   - cancelled
8. Preserve fallback mode when Supabase is missing.
9. Create docs/2026-05-10-phase-2-task-17-expenses-crud.md.
10. Create docs/2026-05-10-phase-2-task-17-expenses-crud-qc.md.
11. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- Expenses can be created and edited.
- Rebillable and recurring flags work.
- Workspace recovery can be tracked manually.
- CSV import is not introduced.

---

# Task 18 — Tasks / Compliance CRUD

## Cursor Prompt

We are starting Phase 2 Task 18 for Amolytics Finance.

Before making changes, read:

- docs/2026-05-10-phase-2-task-17-expenses-crud.md
- docs/2026-05-10-phase-2-task-17-expenses-crud-qc.md
- docs/2026-05-10-phase-2-data-model-and-crud-plan.md
- supabase/schema.sql
- src/lib/data/tasks.ts
- src/app/(app)/tasks/page.tsx
- src/lib/supabase/types.ts

Goal:

Add manual Tasks / Compliance CRUD and status actions.

Important:

- Do not build advanced compliance automation yet.
- Do not add reminders/notifications yet.
- Manual task tracking only.
- Build and lint must pass.

Implement:

1. Add task create flow.
2. Add task edit flow.
3. Add task soft-delete if supported or safe delete if not.
4. Add status actions:
   - mark done
   - mark blocked
   - reopen
5. Fields:
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
6. Use Zod validation.
7. Support categories:
   - invoice
   - payment
   - salary
   - compliance
   - tax
   - company
   - bank
   - other
8. Support statuses:
   - todo
   - in_progress
   - done
   - blocked
9. Support priorities:
   - low
   - medium
   - high
   - urgent
10. Preserve fallback mode when Supabase is missing.
11. Create docs/2026-05-10-phase-2-task-18-tasks-compliance-crud.md.
12. Create docs/2026-05-10-phase-2-task-18-tasks-compliance-crud-qc.md.
13. Run sequentially:
   - npm run lint
   - npm run build

Expected:

- Tasks can be created and edited.
- Tasks can be marked done, blocked, or reopened.
- Compliance tracking works manually.
- No automation/reminders are introduced.

---

## Final Note

After Task 18 QC passes, the next task is:

**Phase 2 Task 19 — Final Phase 2 Regression QC**

This should check:

- all routes
- all read-only modules
- all CRUD modules
- Supabase mode
- fallback mode
- build/lint
- secrets/security
- mobile layout
- docs consistency
