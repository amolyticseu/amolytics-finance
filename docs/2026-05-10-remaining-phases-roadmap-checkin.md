# Remaining Phases Roadmap Check-in — Amolytics Finance

Date: 2026-05-10  
Status: Roadmap checkpoint after Phase 2 Task 8 QC

## Current Completed Work

Summarize completed and QC-passed work:

### Phase 1

- UI foundation (Next.js app structure, Tailwind/shadcn-style shell components)
- App shell with responsive layout
- Sidebar and header navigation (`StatCard`, `SectionCard`, `DataTable`, etc.)
- Placeholder routes for all core finance views
- Mock dashboard driven by `src/data/mock`
- Mock tables for invoices, payments, team, salaries, expenses, tasks, P&L hints
- Reports page with Recharts monthly P&L chart (mock series)
- Phase 1 Antigravity QC passed

### Phase 2 completed so far

Documentation and QC artifacts in `docs/`:

| Task | Focus | Task doc | QC doc |
|------|--------|----------|--------|
| 1 | Supabase foundation | `2026-05-10-phase-2-supabase-foundation.md` | `2026-05-10-phase-2-supabase-foundation-qc.md` |
| 2 | Read-only Settings | `2026-05-10-phase-2-task-2-readonly-settings.md` | `2026-05-10-phase-2-task-2-readonly-settings-qc.md` |
| 3 | Read-only Team | `2026-05-10-phase-2-task-3-readonly-team.md` | `2026-05-10-phase-2-task-3-readonly-team-qc.md` |
| 4 | Shared Clients + Bank Accounts | `2026-05-10-phase-2-task-4-clients-bank-accounts-readonly.md` | `2026-05-10-phase-2-task-4-clients-bank-accounts-readonly-qc.md` |
| 5 | Read-only Invoices | `2026-05-10-phase-2-task-5-readonly-invoices.md` | `2026-05-10-phase-2-task-5-readonly-invoices-qc.md` |
| 6 | Read-only Payments | `2026-05-10-phase-2-task-6-readonly-payments.md` | `2026-05-10-phase-2-task-6-readonly-payments-qc.md` |
| 7 | Read-only Salaries | `2026-05-10-phase-2-task-7-readonly-salaries.md` | `2026-05-10-phase-2-task-7-readonly-salaries-qc.md` |
| 8 | Read-only Expenses | `2026-05-10-phase-2-task-8-readonly-expenses.md` | `2026-05-10-phase-2-task-8-readonly-expenses-qc.md` |

Each of Tasks 1–8 has a dedicated implementation note and Antigravity QC checklist; this checkpoint assumes **Task 8 has passed QC** and read-only coverage is complete through Expenses.

Implementation touchpoints (inspected):

- **App routes** under `src/app/(app)/`: `dashboard`, `invoices`, `payments`, `team`, `salaries`, `expenses`, `tasks`, `reports`, `settings` — each has a `page.tsx`.
- **Data layer** under `src/lib/data/`: `settings.ts`, `team.ts`, `clients.ts`, `bank-accounts.ts`, `invoices.ts`, `payments.ts`, `salaries.ts`, `expenses.ts`.
- **Hand-written Supabase types** in `src/lib/supabase/types.ts` for the tables wired so far (subset of `supabase/schema.sql`).
- **SQL**: `supabase/schema.sql` and `supabase/seed.sql` define and seed the core model (including `tasks`, `monthly_snapshots`, `exchange_rates` not yet consumed by Dashboard/Reports pages).

## Current Architecture Snapshot

Document current state:

- **Supabase foundation** exists (client/server helpers, env checks per `src/lib/supabase/env.ts` and related docs).
- **Schema and seed** exist (`supabase/schema.sql`, `supabase/seed.sql`).
- **Safe env handling** exists: missing URL/anon key avoids throwing in read paths that gate on `hasSupabaseEnv()`; pages use **fallback mock-derived data** when env is absent, queries fail, or non-deleted rows are empty (per-module behavior documented in each task doc).
- **Fallback mode** is consistent across read-only modules: `source: "database" | "fallback"` (or equivalent) and user-visible notes on several pages.
- **Read-only Supabase-backed modules** (pages and/or shared data layers) currently include:
  - **Settings** — FX + embedded reads for clients/bank accounts on the settings page
  - **Team** — `team_members`
  - **Invoices** — `invoices` + `clients`
  - **Payments** — `payments` + `invoices` + `bank_accounts`
  - **Salaries** — `salary_payments` + `team_members` + `bank_accounts`
  - **Expenses** — `expenses` + `clients` + `bank_accounts`
  - **Shared Clients** — `clients` (`src/lib/data/clients.ts`)
  - **Shared Bank Accounts** — `bank_accounts` (`src/lib/data/bank-accounts.ts`)
- **Still mock-based** (no `src/lib/data` module wired to Supabase for these UIs yet):
  - **Dashboard** (`src/app/(app)/dashboard/page.tsx`)
  - **Tasks** (`src/app/(app)/tasks/page.tsx`)
  - **Reports** (`src/app/(app)/reports/page.tsx`)
- **Not started / not in codebase** for Phase 2 as of this checkpoint:
  - **CRUD forms** for any module
  - **Auth/login UI** and **protected routes** (RLS noted as future in schema comments)
  - **PDF invoice generation**
  - **Bank CSV import**
  - **AI features**

## Remaining Phase 2 Work

Break remaining Phase 2 into practical tasks.

Recommended remaining Task list:

### Task 9 — Read-only Tasks / Compliance

- Connect **tasks** page to Supabase read-only (`public.tasks`)
- Fallback task data (reuse or extend `src/data/mock/tables.ts` patterns)
- Respect schema categories (invoice, payment, salary, compliance, tax, company, bank, other) and status/priority checks
- Antigravity QC

### Task 10 — Dashboard Real Summary Data

- Create **dashboard summary** data layer (aggregate or query summaries)
- Revenue this month, expenses this month, salaries this month, estimated profit/loss
- Pending invoices, pending salaries, upcoming tasks
- Keep **fallback** when env/queries/empty
- Antigravity QC

### Task 11 — Reports Real Monthly P&L

- Create **reports** data layer
- Read `monthly_snapshots` and/or derive from invoices, expenses, salary_payments, payments with clear rules
- Keep **Recharts** chart; fallback monthly P&L series when needed
- Antigravity QC

### Task 12 — CRUD Foundation Pattern

- Decide form pattern (Server Actions vs route handlers)
- Reusable form primitives, mutation pattern, **Zod** validation
- **No** full module CRUD yet — scaffold only
- Antigravity QC

### Task 13 — Clients + Bank Accounts CRUD

- Create/edit clients and bank accounts; soft delete / deactivate
- Masked display for sensitive bank fields
- Antigravity QC

### Task 14 — Invoices CRUD

- Create/edit invoices; status transitions; sent/paid/due dates; workspace recovery; soft delete/cancel
- Antigravity QC

### Task 15 — Payments CRUD

- Create/edit payments; link invoice, bank account; references
- Antigravity QC

### Task 16 — Team + Salaries CRUD

- Create/edit team members and salary payments; partial/paid/pending; transaction reference
- Antigravity QC

### Task 17 — Expenses CRUD

- Create/edit expenses; recurring/rebillable; linked client; payment reference
- Antigravity QC

### Task 18 — Tasks / Compliance CRUD

- Create/edit/complete tasks; categories, priority, due dates
- Antigravity QC

### Task 19 — Phase 2 Final Regression QC

- Full app route QC; Supabase read/write QC; fallback QC
- `npm run lint` / `npm run build`; security/secrets scan; docs completeness
- Final Phase 2 pass/fail gate

## Phase 3 Planned Scope

**Status: not started** — forward-looking only; aligns with `docs/2026-05-10-phase-2-data-model-and-crud-plan.md` themes (manual entry first, automation later).

Include:

- PDF invoice generation
- Cash-flow forecast
- Workspace recovery tracking improvements
- Bank CSV import
- Compliance tracker improvements
- Possible reminders / notifications
- More advanced reporting exports

Proposed tasks:

### Phase 3 Task 1 — PDF Invoice Generation

### Phase 3 Task 2 — Cash-flow Forecast

### Phase 3 Task 3 — Workspace Recovery Tracker

### Phase 3 Task 4 — Bank CSV Import

### Phase 3 Task 5 — Compliance Tracker Upgrade

### Phase 3 Task 6 — Export CSV/PDF Reports

### Phase 3 Final QC

## Phase 4 Planned Scope

**Status: not started** — exploratory product direction.

Include:

- AI monthly summary
- Anomaly detection
- Smart suggestions
- Founder finance assistant
- Possible SaaS packaging direction

Proposed tasks:

### Phase 4 Task 1 — AI Monthly Summary

### Phase 4 Task 2 — Anomaly Detection

### Phase 4 Task 3 — Smart Suggestions

### Phase 4 Task 4 — Founder Finance Assistant UX

### Phase 4 Task 5 — SaaS Product Direction Review

### Phase 4 Final QC

## Recommended Next Task

Recommend continuing with:

**Phase 2 Task 9 — Read-only Tasks / Compliance**

Why:

- **Tasks** is the last major **list page** still mock-only; completing it finishes the read-only sweep before dashboard/reports aggregates.
- **Task 10 (Dashboard)** naturally needs **upcoming tasks** and other live signals; Task 9 reduces mock dependency first.
- **Compliance / company / tax / bank** task categories match `schema.sql` and the product’s control-tower goals.
- Preserves the **read-only-first + safe fallback** pattern proven in Tasks 2–8.

## Risks / Watch-outs

- **CRUD** should roll out only after read-only and aggregates are stable; start with **Task 12** foundation, then one module at a time.
- **Auth**: avoid over-engineering before real user model; RLS and policies are called out as future in schema comments.
- **Fallback** must stay consistent for local dev and empty databases — document per module.
- **Soft delete** (`deleted_at`) already used on several tables; mutations must respect it and never hard-delete financial history casually.
- **Money**: keep Postgres `numeric` normalization (string/number) in data layers; consistent **EUR/INR** formatting in UI.
- **Dashboard summaries**: define single sources of truth to **avoid double-counting** (e.g. payments vs invoices vs expenses).
- **QC workflow**: keep **Cursor + Antigravity** task doc + QC doc pairs for every module through Phase 2 regression.

## Final Recommendation

The project should proceed with:

1. Finish remaining **read-only** modules: **Tasks**, then **Dashboard**, then **Reports** (Tasks 9–11).
2. Introduce **CRUD foundation** (Task 12) with validation and a single mutation pattern.
3. Apply **CRUD module by module** (Tasks 13–18) with masking, soft delete, and QC each time.
4. Run **full Phase 2 regression QC** (Task 19).
5. **Only after Phase 2 passes**, move to **Phase 3** (PDF, imports, forecasts, exports), then **Phase 4** (AI/assistant) as separately scoped work.
