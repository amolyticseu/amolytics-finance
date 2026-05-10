# Phase 2 — Task 8: Read-only Expenses (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **Domain types** in `src/types/index.ts`: **`ExpenseCategoryDb`** and **`ExpenseStatus`**, matching `schema.sql` check constraints (categories: emi, rent, utilities, subscription, workspace, tax, compliance, other; statuses: pending, paid, overdue, cancelled). Existing **`ExpenseCategory`** (Phase 1 UI shape) is unchanged.
- **Supabase types** in `src/lib/supabase/types.ts`: **`ExpenseRow`**, **`ExpenseListItem`** (with `client_name`, `client_code`, `bank_display`), and **`Database.public.Tables.expenses`**.
- **Data access** in `src/lib/data/expenses.ts`: **`getExpenses()`** — no env → fallback; query error → `console.warn` + fallback; **zero rows** → fallback; else normalized rows with **`clients(name, code)`** and **`bank_accounts(account_name, institution_name)`**, **`deleted_at IS NULL`**, sort **expense_date desc → due_date desc → created_at desc**.
- **Expenses page** (`src/app/(app)/expenses/page.tsx`): **`dynamic = "force-dynamic"`**, uses **`getExpenses()`**, table shows dates (expense + optional due), category, name, amount, currency, status, recurring/rebillable, linked client, bank label, payment ref, notes; muted DB vs mock note; **`SectionCard`** description by source.
- **Fallback** builds **seven seed-aligned lines**: Kotak / IDFC / Axis EMIs (INR), Malta rent & utilities (EUR), workspace recovery €163.08 (rebillable, linked BMF client). **`mockExpenseLines`** remains in `src/data/mock/tables.ts` for continuity.

## Files changed

| File | Change |
|------|--------|
| `src/types/index.ts` | `ExpenseCategoryDb`, `ExpenseStatus` |
| `src/lib/supabase/types.ts` | Expense row/list types + `expenses` table |
| `src/lib/data/expenses.ts` | **New** — `getExpenses()` |
| `src/app/(app)/expenses/page.tsx` | Wired to `getExpenses()`, expanded read-only table |
| `docs/2026-05-10-phase-2-task-8-readonly-expenses.md` | **New** — this document |

## Why Expenses after Salaries

**Expenses** tie together **clients** (e.g. EMI / workspace linkage), **bank accounts**, and operational cost lines. With **team**, **invoices**, **payments**, and **salaries** already on read-only Supabase paths, expenses complete the core **money-out** register before dashboard/report work.

## How fallback mode works

`getExpenses()` uses **`hasSupabaseEnv()`** from `src/lib/supabase/env.ts`.

1. **Missing env** → seed-style fallback list, `source: "fallback"`.
2. **Query error or exception** → `console.warn` + fallback.
3. **Success with zero rows** → fallback (useful when only `seed.sql` is applied and you expect rows — empty still shows demo lines locally).
4. **Success with rows** → database rows, `source: "database"`.

Soft-deleted rows excluded via **`.is("deleted_at", null)`**.

## Supabase tables read

- **`public.expenses`**
- **`public.clients`** (embed when `linked_client_id` is set)
- **`public.bank_accounts`** (embed when `bank_account_id` is set)

No writes; **dashboard**, **reports**, and **tasks** not wired; **salaries** / **payments** unchanged except shared type surface.

## Intentionally not implemented

- Expense **CRUD** UI.
- **Dashboard** / **reports** / **tasks** Supabase integration.
- Removing or rewriting **`mockExpenseLines`** (still present).

## How to verify locally

**Without `.env.local`:** `/expenses` shows **seven** fallback rows (EMIs, Malta lines, workspace recovery) with correct currencies and **Rebillable = Yes** on workspace.

**With Supabase:** seeded **`expenses`** from `seed.sql` should load with joins; manual inserts should appear when non-empty.

**Regression:** `/settings`, `/team`, `/invoices`, `/payments`, `/salaries` behavior unchanged in intent.

## Next recommended task

- **Phase 2 Task 9 (suggested):** read-only **dashboard** aggregates (optional) or **tasks** list with the same fallback pattern, **or** extend documentation/QC for expenses.
