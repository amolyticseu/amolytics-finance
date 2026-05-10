# Phase 2 — Task 9: Read-only Tasks / Compliance (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **Domain types** in `src/types/index.ts`: **`TaskCategoryDb`**, **`TaskDbStatus`** (`todo` | `in_progress` | `done` | `blocked`), **`TaskPriorityDb`**. **`FinanceStatus`** includes **`TaskDbStatus`** so task rows work with **`StatusBadge`**. Legacy **`TaskStatus`** (`open` | …) remains for Phase 1 **`mockComplianceTasks`**.
- **`StatusBadge`** (`src/components/shell/status-badge.tsx`): labels/styles for **`todo`** and **`blocked`**; **`blocked`** uses the destructive variant for visibility.
- **Supabase types** (`src/lib/supabase/types.ts`): **`TaskRow`**, **`Database.public.Tables.tasks`**.
- **Data access** (`src/lib/data/tasks.ts`): **`getTasks()`** selects `*` from **`public.tasks`** when env is present; on missing env, error, or **zero rows**, returns **fallback** tasks. **`sortTaskRows`**: incomplete before **done**, **`due_date` ascending** (nulls last), **priority** urgent → high → medium → low, **`created_at` descending** tie-break. Exported **`sortTaskRows`** for tests/reuse.
- **Tasks page** (`src/app/(app)/tasks/page.tsx`): **`dynamic = "force-dynamic"`**, **`getTasks()`**, table shows title, category, status, priority, due, completed (date slice), related entity type/id, description/notes; muted DB vs fallback note; **`SectionCard`** description by source.
- **Fallback**: eight illustrative compliance/finance tasks (OPC bank, PAN/MCA, Malta VAT, invoice follow-up, workspace recovery, CA checklist, blocked payment reminder, one **done** payroll row). **`mockComplianceTasks`** in `src/data/mock/tables.ts` is **unchanged**.

## Files changed

| File | Change |
|------|--------|
| `src/types/index.ts` | `TaskCategoryDb`, `TaskDbStatus`, `TaskPriorityDb`; `FinanceStatus` |
| `src/components/shell/status-badge.tsx` | `todo`, `blocked`; blocked destructive |
| `src/lib/supabase/types.ts` | `TaskRow`, `tasks` table |
| `src/lib/data/tasks.ts` | **New** — `getTasks()`, `sortTaskRows` |
| `src/app/(app)/tasks/page.tsx` | Wired to `getTasks()`, expanded columns |
| `docs/2026-05-10-phase-2-task-9-readonly-tasks-compliance.md` | **New** — this document |

## Why Tasks / Compliance after Expenses

**Tasks** are cross-cutting (invoice, payment, salary, compliance, tax, company, bank). With **expenses** and all money registers on read-only paths, the **compliance checklist** is the last major **list-first** surface before **dashboard** and **reports** aggregates.

## How fallback mode works

`getTasks()` uses **`hasSupabaseEnv()`** (`src/lib/supabase/env.ts`).

1. **Missing env** → fallback list, `source: "fallback"`.
2. **Query error** → `console.warn` + fallback.
3. **Zero rows** → fallback (seed inserts **one** task; empty project DB still gets demo rows).
4. **Otherwise** → normalized rows, `source: "database"`.

There is **no `deleted_at`** on **`tasks`** in `schema.sql`; no soft-delete filter.

## Supabase table read

- **`public.tasks`** only (no joins).

## Intentionally not implemented

- Task **CRUD**, complete/reopen actions, owners/assignees column (not in schema).
- **Dashboard** / **reports** wiring.
- Changes to **expenses** / **payments** / **salaries** modules beyond shared **`FinanceStatus`** / badge.

## How to verify locally

**Without `.env.local`:** `/tasks` shows eight fallback rows; **blocked** payment task is visually distinct; one **done** row sorts last.

**With Supabase:** seeded task(s) appear; sorting matches rules above.

**Regression:** `/settings`, `/team`, `/invoices`, `/payments`, `/salaries`, `/expenses` unchanged in intent.

## Next recommended task

- **Phase 2 Task 10 — Dashboard real summary data:** consume invoices, expenses, salaries, payments, and **tasks** for “upcoming” widgets with the same fallback discipline.
