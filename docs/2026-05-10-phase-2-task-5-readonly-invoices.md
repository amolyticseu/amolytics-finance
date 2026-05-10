# Phase 2 — Task 5: Read-only Invoices (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **Typed `invoices` rows** in `src/lib/supabase/types.ts` (`InvoiceRow`, `InvoiceListItem` with optional client display fields).
- **Data access** in `src/lib/data/invoices.ts`: `getInvoices()` reads from Supabase when env vars are present, joins `clients(name, code)` for display, filters `deleted_at IS NULL`, normalizes Postgres `numeric` fields (string or number), sorts by year → month → period code → `created_at`, and returns `source: "database" | "fallback"`.
- **Invoices page** (`src/app/(app)/invoices/page.tsx`) is an async server component with `dynamic = "force-dynamic"`. It renders an expanded read-only table: invoice number, client, period, month/year, hours, rate, amount, status, sent date, paid date (or “Pending”), payment reference (or “Bank account on file” when only `bank_account_id` is set).
- **Fallback behavior** reuses existing `mockInvoices` in `src/data/mock/tables.ts` (BMF / 8BMF8-style examples) without deleting mock data.
- **`InvoiceStatus`** includes `cancelled` to match the DB check constraint; `StatusBadge` supports it.

## Files changed

| File | Change |
|------|--------|
| `src/lib/supabase/types.ts` | Invoice table types + `Database.public.Tables.invoices` |
| `src/types/index.ts` | `InvoiceStatus` + `cancelled` |
| `src/components/shell/status-badge.tsx` | `cancelled` label + styling |
| `src/lib/data/invoices.ts` | **New** — `getInvoices()` |
| `src/app/(app)/invoices/page.tsx` | Wired to `getInvoices()`, expanded columns, source note |
| `docs/2026-05-10-phase-2-task-5-readonly-invoices.md` | **New** — this document |

## Why Invoices after Clients and Bank Accounts

Invoices **depend on** clients (and optionally bank accounts for settlement metadata). Phase 2 progressed **foundational entities first** (clients, bank accounts) so foreign keys and joins are meaningful before listing invoice rows. Settings/team reads were already in place; invoices complete the core billing read path for the register UI.

## How fallback mode works

`getInvoices()` uses `hasSupabaseEnv()` from `src/lib/supabase/env.ts`.

1. **Missing Supabase env** → return mock-derived `InvoiceListItem[]`, `source: "fallback"` (no console noise).
2. **Query error or thrown exception** → `console.warn` with context, same fallback list, `source: "fallback"`.
3. **Success with zero rows** (e.g. after `seed.sql` with no invoice inserts) → same fallback list, `source: "fallback"` (empty register is treated as “use demo data” for local UX).
4. **Success with rows** → normalized joined rows, `source: "database"`.

Soft-deleted invoices are excluded via `.is("deleted_at", null)`.

## Supabase tables read

- **`public.invoices`** — primary list; embed **`clients(name, code)`** via `client_id` FK.

No writes, no PDF, no payments/salaries/expenses/dashboard/reports wiring in this task.

## Intentionally not implemented

- Invoice **CRUD** UI (create / edit / delete).
- **PDF** generation.
- Linking **payments** to invoices, **salaries**, **expenses**, **dashboard**, **reports**, or **tasks** to Supabase.
- Seeding invoice rows in `seed.sql` (optional future step).

## How to verify locally

**Without Supabase (no `.env.local`):**

- `npm run dev`
- Open `/invoices` — table shows **mock-style** BMF / 8BMF8 examples; note indicates **built-in mock register**.

**With Supabase:**

- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and server key if your `createClient` path requires it — match existing app setup).
- Insert at least one row into `invoices` for a valid `client_id` (from `clients`), with `deleted_at` null.
- `/invoices` should show **database** rows and client name/code from the join.
- If the table is **empty**, the page still shows **fallback** mock rows (expected for current seed).

**Regression:**

- `/settings` and `/team` unchanged in behavior.
- Other app areas remain on mock data unless already wired in earlier tasks.

## Next recommended task

- **Phase 2 Task 6 (suggested):** read-only **Payments** (or **Expenses**) with the same env / error / empty fallback pattern, **or** extend `seed.sql` with sample `invoices` rows so `/invoices` exercises the database path out of the box.
