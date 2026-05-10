# Master Remaining Phases Execution Plan — Amolytics Finance

Date: 2026-05-10  
Status: Master plan — Phase 2 Task 9 QC passed; remaining read-only work is Dashboard + Reports

## Current State Summary

Summarize current project status:

- **Phase 1** completed and QC passed (UI shell, mock pages, dashboard/reports placeholders, Antigravity QC per project sign-off).
- **Phase 2 Tasks 1–9** completed with paired implementation + QC docs under `docs/` (through Supabase foundation, Settings, Team, Clients + Bank Accounts shared layers, Invoices, Payments, Salaries, Expenses, **Tasks / Compliance**).
- **Phase 2 Task 9** — read-only **Tasks / Compliance**: **PASSED** Antigravity QC. Implementation: `docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance.md`. QC: `docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance-qc.md`. `/tasks` is read-only Supabase-backed with fallback mode.
- **Current read-only Supabase-backed modules** (pages and/or `src/lib/data`):
  - **Settings** — FX (`exchange_rates`) plus embedded clients/bank accounts on the settings page
  - **Team** — `team_members`
  - **Clients** — shared `clients` layer
  - **Bank Accounts** — shared `bank_accounts` layer
  - **Invoices** — `invoices` + `clients`
  - **Payments** — `payments` + `invoices` + `bank_accounts`
  - **Salaries** — `salary_payments` + `team_members` + `bank_accounts`
  - **Expenses** — `expenses` + `clients` + `bank_accounts`
  - **Tasks** — `tasks` (no joins; no `deleted_at` on table)
- **Still mock-based (only remaining main nav pages)**:
  - **Dashboard** (`src/app/(app)/dashboard/page.tsx`)
  - **Reports** (`src/app/(app)/reports/page.tsx`)
- **Data layer files** (`src/lib/data/`): `settings.ts`, `team.ts`, `clients.ts`, `bank-accounts.ts`, `invoices.ts`, `payments.ts`, `salaries.ts`, `expenses.ts`, `tasks.ts`.
- **Schema / seed** (`supabase/schema.sql`, `supabase/seed.sql`): core tables including `monthly_snapshots` (not yet consumed by Reports UI).
- **Not in codebase yet**:
  - CRUD forms / mutations for money modules
  - Auth/login UI and protected routes (RLS deferred per schema comments)
  - PDF generation
  - Bank CSV import
  - AI features

## Execution Rule

Document this rule clearly:

**Every implementation task must be followed by an Antigravity QC task before moving forward.**

For each module:

1. Cursor implements  
2. Cursor creates `docs/YYYY-MM-DD-topic.md`  
3. Cursor creates `docs/YYYY-MM-DD-topic-qc.md`  
4. Antigravity runs QC  
5. QC result is reviewed  
6. Only then continue  

## Remaining Work Count

List remaining work count:

### Phase 2 Remaining

- Task 10 Dashboard real summary data  
- Task 10 QC  
- Task 11 Reports real monthly P&L  
- Task 11 QC  
- Task 12 CRUD foundation pattern  
- Task 12 QC  
- Task 13 Clients + Bank Accounts CRUD  
- Task 13 QC  
- Task 14 Invoices CRUD  
- Task 14 QC  
- Task 15 Payments CRUD  
- Task 15 QC  
- Task 16 Team + Salaries CRUD  
- Task 16 QC  
- Task 17 Expenses CRUD  
- Task 17 QC  
- Task 18 Tasks / Compliance CRUD  
- Task 18 QC  
- Task 19 Final Phase 2 regression QC  

### Phase 3 Remaining

- Phase 3 Task 1 PDF invoice generation  
- Phase 3 Task 1 QC  
- Phase 3 Task 2 Cash-flow forecast  
- Phase 3 Task 2 QC  
- Phase 3 Task 3 Workspace recovery tracker  
- Phase 3 Task 3 QC  
- Phase 3 Task 4 Bank CSV import  
- Phase 3 Task 4 QC  
- Phase 3 Task 5 Compliance tracker upgrade  
- Phase 3 Task 5 QC  
- Phase 3 Task 6 Export CSV/PDF reports  
- Phase 3 Task 6 QC  
- Phase 3 Final regression QC  

### Phase 4 Remaining

- Phase 4 Task 1 AI monthly summary  
- Phase 4 Task 1 QC  
- Phase 4 Task 2 Anomaly detection  
- Phase 4 Task 2 QC  
- Phase 4 Task 3 Smart suggestions  
- Phase 4 Task 3 QC  
- Phase 4 Task 4 Founder finance assistant UX  
- Phase 4 Task 4 QC  
- Phase 4 Task 5 SaaS product direction review  
- Phase 4 Task 5 QC  
- Phase 4 Final regression QC  

## Phase 2 Detailed Execution Plan

### Phase 2 Task 9 QC — Read-only Tasks / Compliance QC *(complete — PASSED)*

Goal:

- Complete Antigravity QC for implemented read-only Tasks / Compliance module.

Result:

- **PASSED.** `/tasks` confirmed for fallback, UI, scope, build, lint, and secrets checks (see `docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance-qc.md`).

### Phase 2 Task 10 — Dashboard Real Summary Data

Goal:

Replace dashboard mock summary cards with Supabase-backed summary data and fallback mode.

Inputs:

- invoices  
- payments  
- salaries  
- expenses  
- tasks  
- exchange_rates  

Dashboard should show:

- Revenue this month  
- Expenses this month  
- Salaries this month  
- Estimated profit/loss  
- Pending invoices  
- Pending salaries  
- Upcoming tasks  
- Workspace recovery pending  
- Cash position placeholder if needed  

Rules:

- Read-only only  
- Fallback when env missing, query error, or zero rows  
- Avoid double-counting invoices and payments  
- Keep conservative summary logic documented  

### Phase 2 Task 11 — Reports Real Monthly P&L

Goal:

Connect Reports to real data or `monthly_snapshots`.

Approach:

- Prefer `monthly_snapshots` when available  
- Fallback to derived data if safe  
- Keep Recharts chart  
- Fallback to mock monthly P&L  

Show:

- Monthly revenue  
- Monthly expenses  
- Profit/loss  
- Salary total  
- EMI total  
- EUR/INR conversion assumptions  

### Phase 2 Task 12 — CRUD Foundation Pattern

Goal:

Create the reusable CRUD foundation before module-specific CRUD.

Include:

- Form layout pattern  
- Page or sheet/modal decision  
- Zod validation  
- React Hook Form integration  
- Server action or mutation pattern  
- Submit/error/loading states  
- Reusable form components  
- Safe redirect/revalidate pattern  
- Soft-delete strategy  
- No full module CRUD yet  

Recommended decision:

- Use full-page or section-based forms first, not complex modals.

### Phase 2 Task 13 — Clients + Bank Accounts CRUD

Goal:

Add create/edit/deactivate flows for clients and bank accounts.

Rules:

- Do not expose full sensitive bank details  
- Use masked/display fields  
- Bank accounts must remain flexible table records, not enums  
- Support active/inactive  
- Soft delete/deactivate  

### Phase 2 Task 14 — Invoices CRUD

Goal:

Add manual invoice create/edit/cancel flows.

Include:

- Client selection  
- Period T01/T02/T03  
- Month/year  
- Hours  
- Rate  
- Amount calculation or manual override  
- Status draft/sent/paid/overdue/cancelled  
- Sent/due/paid dates  
- Bank account  
- Payment reference  
- Workspace recovery amount  
- Notes  

Not included:

- PDF generation, which belongs to Phase 3  

### Phase 2 Task 15 — Payments CRUD

Goal:

Add manual incoming/outgoing payment tracking.

Include:

- Direction  
- Type  
- Amount/currency  
- Date  
- Bank account  
- Link invoice when applicable  
- Reference  
- Payer/payee  
- Notes  

Rules:

- Payment should optionally link invoice, salary payment, or expense  
- Do not force all payments to invoices  

### Phase 2 Task 16 — Team + Salaries CRUD

Goal:

Add CRUD for team members and salary payments.

Include:

- Team member create/edit/deactivate  
- Salary payment create/edit  
- Month/year  
- Base amount  
- Reimbursement  
- Deduction  
- Total  
- Status pending/partial/paid  
- Payment date  
- Bank account  
- Transaction reference  
- Notes  

### Phase 2 Task 17 — Expenses CRUD

Goal:

Add manual expense tracking.

Include:

- Category  
- Name  
- Amount/currency  
- Expense date  
- Due date  
- Status  
- Recurring  
- Rebillable  
- Linked client  
- Bank account  
- Payment reference  
- Notes  

### Phase 2 Task 18 — Tasks / Compliance CRUD

Goal:

Add manual task management.

Include:

- Title  
- Description  
- Category  
- Status  
- Priority  
- Due date  
- Completed date  
- Related entity type/id  
- Notes  

Actions:

- Create  
- Edit  
- Mark done  
- Mark blocked  
- Reopen  

### Phase 2 Task 19 — Final Phase 2 Regression QC

Goal:

Full Phase 2 pass/fail checkpoint.

Check:

- All routes  
- All read-only modules  
- All CRUD modules  
- Build/lint  
- Fallback mode  
- Supabase mode  
- Security scan  
- Docs consistency  
- No accidental secrets  
- No broken mobile views  

## Phase 3 Detailed Execution Plan

### Phase 3 Task 1 — PDF Invoice Generation

Goal:

Generate invoice PDFs from invoice records.

Include:

- Invoice template  
- Company/client details  
- Wise/business bank details based on invoice flow  
- Invoice number format  
- Period T01/T02/T03  
- Hours/rate/amount  
- Workspace recovery line if applicable  
- Download PDF  

### Phase 3 Task 2 — Cash-flow Forecast

Goal:

Forecast upcoming cash needs and inflows.

Include:

- Expected invoices  
- Pending payments  
- Salary obligations  
- EMIs  
- Rent/utilities  
- Upcoming tasks/deadlines  
- EUR/INR planning rate  

### Phase 3 Task 3 — Workspace Recovery Tracker

Goal:

Track rebillable workspace amounts more clearly.

Include:

- March €81.00  
- April €24.30  
- May €57.78  
- Total €163.08  
- Link to client/invoices  
- Mark recovered/unrecovered  

### Phase 3 Task 4 — Bank CSV Import

Goal:

Import bank statements manually.

Support later:

- Wise  
- Revolut  
- HSBC Malta  
- ICICI India  
- OPC bank account  

Initial version:

- CSV upload  
- Preview rows  
- Manual mapping  
- Duplicate detection basics  
- No automation required  

### Phase 3 Task 5 — Compliance Tracker Upgrade

Goal:

Improve compliance tracking beyond simple tasks.

Include:

- India OPC setup  
- MCA/PAN/TAN follow-ups  
- Bank account opening  
- Malta VAT registration exploration  
- Tax/accountant reminders  
- Due dates and statuses  

### Phase 3 Task 6 — Export CSV/PDF Reports

Goal:

Allow exporting reports.

Include:

- Monthly P&L CSV  
- Expenses CSV  
- Invoice register CSV  
- Payment register CSV  
- Basic PDF summary report  

### Phase 3 Final Regression QC

Goal:

Confirm all Phase 3 features work with existing Phase 2 foundation.

## Phase 4 Detailed Execution Plan

### Phase 4 Task 1 — AI Monthly Summary

Goal:

Generate monthly finance summaries.

Include:

- Revenue  
- Expenses  
- Profit/loss  
- Pending invoices  
- Pending salaries  
- Cash pressure  
- Compliance warnings  

### Phase 4 Task 2 — Anomaly Detection

Goal:

Detect unusual finance patterns.

Examples:

- Revenue lower than expected  
- EMI/salary pressure  
- Expense spike  
- Invoice overdue  
- Missing payment reference  
- Workspace recovery not billed  

### Phase 4 Task 3 — Smart Suggestions

Goal:

Suggest useful actions.

Examples:

- Follow up invoice  
- Delay non-critical expense  
- Mark salary paid  
- Recover workspace cost  
- Prepare compliance task  

### Phase 4 Task 4 — Founder Finance Assistant UX

Goal:

Create a simple assistant-like interface inside the dashboard.

It should answer:

- What came in?  
- What went out?  
- What is pending?  
- Are we profit/loss this month?  
- What should I do next?  

### Phase 4 Task 5 — SaaS Product Direction Review

Goal:

Evaluate whether this internal tool can become a SaaS for freelancers/small agencies.

Include:

- Which features are reusable  
- What would need multi-tenant support  
- What is too specific to Amolytics  
- Possible product positioning  

### Phase 4 Final Regression QC

Goal:

Final QC for all AI and strategic features.

## Recommended Execution Order

Recommend this exact order:

1. Build Phase 2 Task 10 Dashboard summaries  
2. QC Task 10  
3. Build Phase 2 Task 11 Reports  
4. QC Task 11  
5. Build CRUD foundation  
6. QC CRUD foundation  
7. CRUD modules one by one  
8. Final Phase 2 regression QC  
9. Only then start Phase 3  
10. Only after Phase 3 final QC, start Phase 4  

*(Phase 2 Task 9 QC is complete and PASSED.)*

## What Not To Do

Clearly document:

- Do not implement all remaining phases at once  
- Do not build CRUD before read-only Dashboard/Reports are stable  
- Do not build PDF generation before invoice CRUD is stable  
- Do not build AI before the data model and summaries are reliable  
- Do not add complex auth/roles until internal workflow is stable  
- Do not remove fallback mode yet  

## Final Recommendation

Recommend continuing with:

**Phase 2 Task 10 — Dashboard Real Summary Data** (next implementation task).

After Task 10 ships, run **Task 10 Antigravity QC**, then proceed to **Task 11 — Reports**.

The project should remain **step-by-step** with Cursor implementation and **Antigravity QC after every module** so regressions, secrets, and scope drift are caught before the next build phase.

## Roadmap Update — Task 9 QC Passed

Date: 2026-05-10

- Phase 2 Task 9 Read-only Tasks / Compliance QC passed.
- `/tasks` is now confirmed as read-only Supabase-backed with fallback mode.
- Dashboard and Reports remain mock-based.
- Next task is Phase 2 Task 10 Dashboard Real Summary Data.
