# Phase 2 — Task 6: Read-only Payments (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **Typed `payments` rows** in `src/lib/supabase/types.ts`: `PaymentDirection`, `PaymentTypeDb`, `PaymentRow`, and `PaymentListItem` (row plus `invoice_number` and `bank_display` from joins).
- **Data access** in `src/lib/data/payments.ts`: `getPayments()` reads from Supabase when env vars are present, selects `invoices(invoice_number)` and `bank_accounts(account_name, institution_name)`, filters `deleted_at IS NULL`, normalizes `amount` (string/number from Postgres), sorts by `payment_date` desc then `created_at` desc, returns `source: "database" | "fallback"`.
- **Payments page** (`src/app/(app)/payments/page.tsx`) is an async server component with `dynamic = "force-dynamic"`. It shows date, direction, type, amount, currency, linked invoice number, bank/account label, reference, payer/payee, notes, plus a muted database vs fallback note and a `SectionCard` description that reflects the source.
- **Fallback** reuses `mockPayments` in `src/data/mock/tables.ts` (BMF / 8BMF8-style client receipts and accounts) without deleting mock data. Mock rows map to `client_receipt` / `other`, direction `in`, and `CLIENT_LABEL` as payer/payee when tied to an invoice.

## Files changed

| File | Change |
|------|--------|
| `src/lib/supabase/types.ts` | Payment types + `Database.public.Tables.payments` |
| `src/lib/data/payments.ts` | **New** — `getPayments()` |
| `src/app/(app)/payments/page.tsx` | Wired to `getPayments()`, expanded read-only table |
| `docs/2026-05-10-phase-2-task-6-readonly-payments.md` | **New** — this document |

## Why Payments after Invoices

**Payments** often reference **invoices** (`invoice_id`) and always use **bank accounts** (`bank_account_id`). After clients, bank accounts, and read-only invoices, the payment register can show meaningful joins (invoice number, account label) when the database is seeded.

## How fallback mode works

`getPayments()` uses `hasSupabaseEnv()` from `src/lib/supabase/env.ts`.

1. **Missing Supabase env** → mock-derived `PaymentListItem[]`, `source: "fallback"`.
2. **Query error or exception** → `console.warn` + fallback, `source: "fallback"`.
3. **Success with zero rows** (e.g. `seed.sql` does not insert payments) → fallback, `source: "fallback"`.
4. **Success with rows** → normalized joined rows, `source: "database"`.

Soft-deleted payments are excluded via `.is("deleted_at", null)`.

## Supabase tables read

- **`public.payments`** — primary list.
- **`public.invoices`** — embedded `invoice_number` when `invoice_id` is set.
- **`public.bank_accounts`** — embedded `account_name`, `institution_name` for display (masked IBAN is not required for this list).

No writes; no salaries, expenses, dashboard, reports, or tasks wiring in this task.

## Intentionally not implemented

- Payment **CRUD** UI (create / edit / delete).
- **Reconciliation** workflows or automatic invoice matching.
- Connecting **salaries**, **expenses**, **dashboard**, **reports**, or **tasks** to Supabase.
- Changes to **invoice** read logic beyond shared types.
- Seeding **payments** in `seed.sql` (optional follow-up).

## How to verify locally

**Without Supabase (no `.env.local`):**

- `npm run dev` → `/payments` shows **mock** BMF-style rows (Wise / Revolut / HSBC, references like `BMF-T02-MAY`).

**With Supabase:**

- Set Supabase URL + anon key per existing app setup.
- Insert `payments` rows with valid `bank_account_id` (and optional `invoice_id`).
- `/payments` should show **database** rows with joined invoice number and bank label when FKs resolve.

**Regression:**

- `/settings`, `/team`, `/invoices` unchanged in intent.
- `/dashboard`, `/salaries`, `/expenses`, `/tasks`, `/reports` remain mock-based unless already covered by earlier tasks.

## Next recommended task

- **Phase 2 Task 7 (suggested):** read-only **Expenses** (or **Salary payments**) with the same fallback pattern, **or** extend `seed.sql` with sample `payments` (and optionally `invoices`) so `/payments` and `/invoices` exercise database paths without manual inserts.
