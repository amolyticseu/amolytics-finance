# Master Remaining Phases Execution Plan — Amolytics Finance

Date: 2026-05-10  
Status: Master plan — Phase 2 **not complete**; Tasks 13–18 static QC passed, functional CRUD QC + Task 19 regression **pending**

## Current State Summary

Summarize current project status:

- **Phase 1** completed and QC passed (UI shell, mock pages, dashboard/reports placeholders, Antigravity QC per project sign-off).
- **Phase 2 Tasks 1–12** — implemented and **QC passed** (read-only modules, Dashboard real summary, Reports monthly P&L, CRUD foundation). Paired docs under `docs/2026-05-10-phase-2-*`.
- **Phase 2 Tasks 13–18** — **implemented** (Cursor); **static QC passed** (lint/build/code review); **functional CRUD QC** in progress:
  - Task 13 — Clients + Bank Accounts CRUD — **fallback functional QC passed**; **Supabase CRUD QC blocked** (env not configured) (`/settings/clients`, `/settings/bank-accounts`)
  - Task 14 — Invoices CRUD — **fallback functional QC passed**; **Supabase CRUD QC pending**
  - Task 15 — Payments CRUD — **fallback functional QC passed**; **Supabase CRUD QC pending**
  - Task 16 — Team + Salaries CRUD — **fallback functional QC passed** (nav regression reverted); **Supabase CRUD QC pending**
  - Task 17 — Expenses CRUD
  - Task 18 — Tasks / Compliance CRUD
- **Phase 2 Task 19** — Final regression QC — **Pending** (must not pass until Tasks 13–18 **functional** QC is complete). Doc: `docs/2026-05-10-phase-2-task-19-final-regression-qc.md`.
- **QC correction (2026-05-16):** A prior Antigravity run marked Tasks 13–19 as Pass after lint/build/static review only. Documentation was corrected: static ≠ full module pass; Phase 2 remains **not PASSED**.
- **Supabase-backed modules** (read + CRUD where implemented):
  - **Settings** — FX (`exchange_rates`); clients/bank accounts via settings CRUD routes
  - **Team** — `team_members` (read + CRUD)
  - **Clients / Bank Accounts** — shared layers + settings CRUD
  - **Invoices, Payments, Salaries, Expenses, Tasks** — list/read with fallback + CRUD routes
  - **Dashboard** — aggregates from invoices, expenses, salaries, tasks, exchange rates (read-only)
  - **Reports** — `monthly_snapshots` with fallback derived P&L (read-only)
- **Data layer** (`src/lib/data/`): `settings.ts`, `team.ts`, `clients.ts`, `bank-accounts.ts`, `invoices.ts`, `payments.ts`, `salaries.ts`, `expenses.ts`, `tasks.ts`, `dashboard.ts`, `reports.ts`.
- **Server actions** (`src/lib/actions/`): `clients.ts`, `bank-accounts.ts`, `invoices.ts`, `payments.ts`, `team-members.ts`, `salary-payments.ts`, `expenses.ts`, `tasks.ts`.
- **Schema / seed** (`supabase/schema.sql`, `supabase/seed.sql`): unchanged in Task 19 doc pass; `tasks` has no `deleted_at` (Task 18 uses hard delete).
- **Not in codebase yet** (Phase 3+):
  - Auth/login UI and protected routes (RLS deferred per schema comments)
  - PDF generation
  - Bank CSV import
  - Recurring expense automation, task reminders/notifications
  - AI features

### Phase 2 completion gate

**Phase 2 must not be marked PASSED** until:

1. **Functional CRUD QC** passes for **Tasks 13–18** (browser + Supabase; not lint/build alone), and  
2. **Task 19** final regression QC passes end-to-end (`docs/2026-05-10-phase-2-task-19-final-regression-qc.md`).

Static QC (lint/build/code review) for Tasks 13–18 is **Passed** as of 2026-05-16; that alone does **not** close Phase 2.

Only then start Phase 3.

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

| Item | Static QC | Fallback functional QC | Supabase functional QC | Notes |
|------|-------------|------------------------|------------------------|--------|
| Tasks 1–12 | Passed | Passed | Passed | Complete |
| Task 13 Clients + Bank Accounts CRUD | **Passed** | **Passed** | **Blocked** — env not configured | Pending — configure `.env.local` and re-run Supabase QC |
| Task 14 Invoices CRUD | **Passed** | **Passed** | **Pending** | Partial pass — Supabase CRUD not tested |
| Task 15 Payments CRUD | **Passed** | **Passed** | **Pending** | Partial pass — Supabase CRUD not tested |
| Task 16 Team + Salaries CRUD | **Passed** | **Passed** | **Pending** | Partial pass — Supabase CRUD not tested; Expenses nav restored after QC |
| Task 17 Expenses CRUD | **Passed** | **Pending** | **Pending** | Implemented |
| Task 18 Tasks / Compliance CRUD | **Passed** | **Pending** | **Pending** | Implemented |
| Task 19 Final regression QC | **Passed** (lint/build only) | **Pending** | **Pending** | Blocked until Tasks 13–18 Supabase functional QC |
| **Phase 2 overall** | — | — | **Not PASSED** | Do not start Phase 3 |

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

### Phase 2 Task 10 — Dashboard Real Summary Data *(implemented — QC passed)*

Goal:

Replace dashboard mock summary cards with Supabase-backed summary data and fallback mode.

Docs: `docs/2026-05-10-phase-2-task-10-dashboard-real-summary.md`, `docs/2026-05-10-phase-2-task-10-dashboard-real-summary-qc.md`.

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

### Phase 2 Task 11 — Reports Real Monthly P&L *(implemented — QC passed)*

Goal:

Connect Reports to real data or `monthly_snapshots`.

Docs: `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl.md`, `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl-qc.md`.

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

### Phase 2 Task 12 — CRUD Foundation Pattern *(implemented — QC passed)*

Goal:

Create the reusable CRUD foundation before module-specific CRUD.

Docs: `docs/2026-05-10-phase-2-task-12-crud-foundation-pattern.md`, `docs/2026-05-10-phase-2-task-12-crud-foundation-pattern-qc.md`.

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

### Phase 2 Task 13 — Clients + Bank Accounts CRUD *(pending — fallback QC passed; Supabase CRUD QC blocked — env not configured)*

Goal:

Add create/edit/deactivate flows for clients and bank accounts.

Docs: `docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud.md`, `docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud-qc.md`.

Rules:

- Do not expose full sensitive bank details  
- Use masked/display fields  
- Bank accounts must remain flexible table records, not enums  
- Support active/inactive  
- Soft delete/deactivate  

### Phase 2 Task 14 — Invoices CRUD *(partial pass — fallback functional QC passed; Supabase CRUD QC pending)*

Goal:

Add manual invoice create/edit/cancel flows.

Docs: `docs/2026-05-10-phase-2-task-14-invoices-crud.md`, `docs/2026-05-10-phase-2-task-14-invoices-crud-qc.md`.

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

### Phase 2 Task 15 — Payments CRUD *(partial pass — fallback functional QC passed; Supabase CRUD QC pending)*

Goal:

Add manual incoming/outgoing payment tracking.

Docs: `docs/2026-05-10-phase-2-task-15-payments-crud.md`, `docs/2026-05-10-phase-2-task-15-payments-crud-qc.md`.

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

### Phase 2 Task 16 — Team + Salaries CRUD *(partial pass — fallback functional QC passed; Supabase CRUD QC pending)*

Goal:

Add CRUD for team members and salary payments.

Docs: `docs/2026-05-10-phase-2-task-16-team-salaries-crud.md`, `docs/2026-05-10-phase-2-task-16-team-salaries-crud-qc.md`.

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

### Phase 2 Task 17 — Expenses CRUD *(implemented — static QC passed; functional QC pending)*

Goal:

Add manual expense tracking.

Docs: `docs/2026-05-10-phase-2-task-17-expenses-crud.md`, `docs/2026-05-10-phase-2-task-17-expenses-crud-qc.md`.

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

### Phase 2 Task 18 — Tasks / Compliance CRUD *(implemented — static QC passed; functional QC pending)*

Goal:

Add manual task management.

Docs: `docs/2026-05-10-phase-2-task-18-tasks-compliance-crud.md`, `docs/2026-05-10-phase-2-task-18-tasks-compliance-crud-qc.md`.

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

### Phase 2 Task 19 — Final Phase 2 Regression QC *(static checks partial; final regression pending)*

Goal:

Full Phase 2 pass/fail checkpoint after Tasks 13–18 module QC.

Doc: `docs/2026-05-10-phase-2-task-19-final-regression-qc.md`.

Check:

- All main and CRUD routes  
- All read-only modules (Tasks 1–11) still stable  
- All CRUD modules (Tasks 13–18)  
- Build/lint/tsc  
- Fallback mode without `.env.local`  
- Supabase mode with schema/seed  
- Dashboard and reports regression  
- Security scan  
- Docs consistency  
- UX/mobile smoke checks  

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

Recommend this exact order from the current checkpoint:

1. **Antigravity functional CRUD QC Tasks 13–18** (browser + Supabase; in any sensible order) — static QC already passed  
2. **Antigravity Task 19** final regression QC (`docs/2026-05-10-phase-2-task-19-final-regression-qc.md`) — only after step 1  
3. Mark **Phase 2 PASSED** only if step 1 and 2 pass functionally  
4. Start **Phase 3 Task 1** (PDF invoice generation)  
5. Continue Phase 3 with QC after each task  
6. Only after Phase 3 final QC, start Phase 4  

*(Phase 2 Tasks 1–12 are fully QC-complete. Tasks 13–18: implementation + static QC complete; **functional CRUD QC** and **Task 19 regression** remain.)*

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

**Antigravity functional CRUD QC for Phase 2 Tasks 13–18**, then **Task 19 Final Regression QC**.

Do not start Phase 3 until Phase 2 is explicitly marked **PASSED** per the completion gate above. **Phase 2 is not complete** as of 2026-05-16 documentation correction.

The project should remain **step-by-step** with **Antigravity QC after every module** so regressions, secrets, and scope drift are caught before Phase 3.

## Roadmap Update — QC status correction (Tasks 13–19)

Date: 2026-05-16

- Phase 2 Tasks 1–12: implemented and **full QC passed**.
- Phase 2 Tasks 13–18: implemented; **static QC passed** (lint/build/code review); **functional CRUD QC** in progress.
- **Task 13:** fallback functional QC **passed** (2026-05-16); Supabase CRUD QC **blocked** — `.env.local` lacks valid Supabase credentials; overall **pending**.
- **Task 14:** fallback functional QC **passed** (2026-05-16, no Supabase env); Supabase invoice create/edit/cancel **not tested** — partial pass only.
- **Task 15:** fallback functional QC **passed** (2026-05-16, no Supabase env); Supabase payment create/edit/soft-delete **not tested** — partial pass only.
- **Task 16:** fallback functional QC **passed** (2026-05-16); Antigravity removed Expenses from nav — **restored by Cursor**; read-only Active Status on team edit **kept**; Supabase Team + Salaries CRUD **not tested** — partial pass only.
- Phase 2 Task 19: **final regression QC pending** — do not pass until Tasks 13–18 Supabase functional QC is done.
- Prior Antigravity run incorrectly implied full Pass from static checks only; QC docs and this master plan were corrected.
- **Next action:** Functional browser/Supabase CRUD QC for Tasks 13–18, then Task 19 end-to-end regression. **Phase 2 not PASSED.** No Phase 3 until gate clears.
