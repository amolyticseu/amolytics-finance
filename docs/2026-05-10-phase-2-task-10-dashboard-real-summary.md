# Phase 2 — Task 10: Dashboard real summary (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **`src/lib/data/dashboard.ts`** with **`getDashboardSummary()`** returning **`DashboardSummary`** plus **`source: "database" | "fallback"`**.
- **Parallel read-only queries** when Supabase is configured: **`invoices`**, **`expenses`**, **`salary_payments`**, **`tasks`** (plus **`getLatestExchangeRate()`** for EUR→INR).
- **`src/app/(app)/dashboard/page.tsx`** is async with **`dynamic = "force-dynamic"`**, consumes **`getDashboardSummary()`**, keeps existing **StatCard** / **SectionCard** / table layout, adds a muted **database vs fallback** note, and documents revenue logic in a StatCard hint.
- **Fallback** rebuilds the Phase 1 dashboard experience from **`src/data/mock/figures.ts`** and **`src/data/mock/tables.ts`** (mock data **not** removed).

## Files changed

| File | Change |
|------|--------|
| `src/lib/data/dashboard.ts` | **New** — `getDashboardSummary()`, types, aggregation + sort rules |
| `src/app/(app)/dashboard/page.tsx` | Wired to summary; source-aware copy |
| `docs/2026-05-10-phase-2-task-10-dashboard-real-summary.md` | **New** — this document |

## Why Dashboard after all read-only modules

The dashboard **aggregates** invoices, expenses, salaries, tasks, and FX. Those registers were wired first so summaries can be **honest, filterable, and documented** without inventing parallel mock-only paths for each metric.

## Dashboard summary logic (reference month = UTC calendar month)

| Metric | Rule |
|--------|------|
| **revenueThisMonth** | Sum **invoice `amount`** converted to **EUR** for rows in the reference month where **`status` ∈ {`paid`, `sent`, `overdue`}** (accrual-style “invoiced in period”). **`payments` are not used** for revenue. |
| **pendingInvoicesCount / Amount** | Invoices **`sent`** or **`overdue`** (any month); amounts converted to EUR. |
| **expensesThisMonth** | **`expenses`** with **`expense_date`** in the reference month; amounts converted to **EUR** for the total. |
| **Expense hints** | EMI → `emi`; Malta bundle → `rent` + `utilities`; **pending `workspace`** amounts roll into **workspaceRecoveryPending** (not double-counted in misc); other categories → misc hint bucket. |
| **salariesThisMonth** | Sum **`total_amount` (INR)** for **`salary_payments`** with matching **`year` / `month`**. |
| **pendingSalaries** | Same month, **`status` ∈ {`pending`, `partial`}`** — count and INR total. |
| **estimatedProfitLoss** | **`revenueThisMonth − expensesThisMonth − (salariesThisMonth / rate)`** (EUR). |
| **Tasks** | **Upcoming** = incomplete and (**no due** OR due in **next 14 days** from today UTC). **Overdue** = incomplete and **due &lt; today** (UTC date). List = first **4** incomplete by due date. |
| **recentInvoices** | Top **3** by **`created_at` desc** (amounts shown as EUR equivalent using the same rate). |

## Revenue counting and double-counting

- **Revenue** uses **invoice lines only** (paid/sent/overdue in month).  
- **Incoming `payments`** are **not** added to revenue, so amounts are **not** double-counted with invoice totals.

## EUR / INR assumption

- **Planning rate** = latest **`exchange_rates`** row **EUR→INR** via **`getLatestExchangeRate()`**, or **`INR_PER_EUR`** from mock constants when FX is missing or in full fallback mode.
- **Non-EUR invoice/expense amounts** are converted to EUR using **`amount / inrPerEur`** for INR (other currencies: pass-through as EUR for now — rare in seed).

## Fallback mode

1. **No Supabase env** → mock summary; FX row may still come from **`getLatestExchangeRate()`** (which itself falls back to constants).  
2. **Any Supabase query error** → `console.warn` + mock summary.  
3. **All four entity queries return zero rows total** → mock summary (empty database).  
4. **Otherwise** → **`source: "database"`**.

Fallback **estimated P&L** = **`mockMonthlyRevenueEur − mockMonthlyExpensesEur − (mockPendingSalaries.totalInr / rate)`** so salaries are reflected in profit (stricter than the old `mockEstimatedProfitEur` helper).

## Supabase tables read

- **`invoices`**, **`expenses`**, **`salary_payments`**, **`tasks`**, **`exchange_rates`** (via **`settings`** helper).

## Intentionally not implemented

- **Reports** page (still mock).  
- **CRUD**, auth, PDF, CSV import.  
- **Cash position** beyond placeholders in copy (no new balance APIs).  
- **Payments** table on dashboard (by design, to avoid double-counting with invoices).

## How to verify locally

- **No `.env.local`:** `/dashboard` matches Phase 1-style numbers and lists.  
- **With Supabase + seed:** metrics reflect May 2026 seed data for UTC “current month” (if your clock differs, numbers follow **server UTC month**).  
- Regression: **`/settings`**, **`/team`**, **`/invoices`**, **`/payments`**, **`/salaries`**, **`/expenses`**, **`/tasks`** unchanged in wiring; **`/reports`** still mock-only.

## Next recommended task

- **Phase 2 Task 11 — Reports real monthly P&L** (`monthly_snapshots` and/or safe derived series, Recharts, fallback).
