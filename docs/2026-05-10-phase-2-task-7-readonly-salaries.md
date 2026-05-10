# Phase 2 — Task 7: Read-only Salaries (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **`SalaryPaymentStatus`** (`pending` | `partial` | `paid`) in `src/types/index.ts`, included in `FinanceStatus`; **`StatusBadge`** supports **`partial`**.
- **Typed `salary_payments`** in `src/lib/supabase/types.ts`: `SalaryPaymentRow`, `SalaryPaymentListItem` (plus `member_name`, `member_role`, `bank_display`), and `Database.public.Tables.salary_payments`.
- **Data access** in `src/lib/data/salaries.ts`: `getSalaryPayments()` reads from Supabase when env vars are present, embeds `team_members(name, role)` and `bank_accounts(account_name, institution_name)`, filters `deleted_at IS NULL`, normalizes numeric fields, sorts by **year desc → month desc → member name asc**, returns `source: "database" | "fallback"`.
- **Salaries page** (`src/app/(app)/salaries/page.tsx`) is async with `dynamic = "force-dynamic"`. It lists month/year, member, role, base / reimbursement / deduction / total, currency, status, pay date (or “Pending”), bank label, transaction reference, notes; includes the muted database vs mock note and a `SectionCard` description that reflects the source.
- **Fallback** uses **`mockTeamFallbackMembers`** (Ganpat, Kamal, Vinod, Vasudev, Siddhatta) to build one illustrative INR line per person for May 2026. **`mockSalaryRuns`** remains in `src/data/mock/tables.ts` for continuity / future use.

## Files changed

| File | Change |
|------|--------|
| `src/types/index.ts` | `SalaryPaymentStatus`; `FinanceStatus` union |
| `src/components/shell/status-badge.tsx` | `partial` label + styling |
| `src/lib/supabase/types.ts` | Salary payment row/list types + `salary_payments` table |
| `src/lib/data/salaries.ts` | **New** — `getSalaryPayments()` |
| `src/app/(app)/salaries/page.tsx` | Wired to `getSalaryPayments()`, expanded read-only table |
| `docs/2026-05-10-phase-2-task-7-readonly-salaries.md` | **New** — this document |

## Why Salaries after Team and Payments

**Salary payments** reference **`team_members`** (and optionally **`bank_accounts`**). The **Team** page already surfaces the India roster; **Payments** covers cash movement. Per-member **`salary_payments`** rows complete the payroll read path and align with `seed.sql` `team_members` without requiring payment-row changes.

## How fallback mode works

`getSalaryPayments()` uses `hasSupabaseEnv()` from `src/lib/supabase/env.ts`.

1. **Missing env** → fallback rows from `mockTeamFallbackMembers`, `source: "fallback"`.
2. **Query error or exception** → `console.warn` + same fallback, `source: "fallback"`.
3. **Success with zero rows** (seed has no `salary_payments` inserts) → fallback, `source: "fallback"`.
4. **Success with rows** → normalized joined rows, `source: "database"`.

Soft-deleted rows excluded via `.is("deleted_at", null)`.

## Supabase tables read

- **`public.salary_payments`**
- **`public.team_members`** (embed `name`, `role`)
- **`public.bank_accounts`** (embed `account_name`, `institution_name`)

No writes; no expenses, dashboard, reports, or tasks wiring; **payments** module unchanged except shared types (`FinanceStatus` / badge).

## Intentionally not implemented

- Salary **CRUD** UI.
- Aggregated “batch” view replacing per-member rows (legacy `mockSalaryRuns` style).
- Linking salary runs to **`payments`** rows.
- **Expenses**, **dashboard**, **reports**, **tasks** Supabase reads.

## How to verify locally

**Without `.env.local`:** `npm run dev` → `/salaries` shows five fallback lines (named engineers), INR amounts, mixed statuses.

**With Supabase:** insert `salary_payments` with valid `team_member_id` (and optional `bank_account_id`). Page should show database rows with joined names and bank labels.

**Regression:** `/settings`, `/team`, `/invoices`, `/payments` unchanged in intent.

## Next recommended task

- **Phase 2 Task 8 (suggested):** read-only **Expenses** with the same fallback pattern, **or** extend **`seed.sql`** with sample **`salary_payments`** so `/salaries` hits the database path without manual inserts.
