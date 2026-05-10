# Phase 2 — Task 11: Reports real monthly P&L (Supabase + fallback)

Date: 2026-05-10

## What was implemented

- **`MonthlySnapshotRow`** and **`public.monthly_snapshots`** table typing in **`src/lib/supabase/types.ts`**.
- **`src/lib/data/reports.ts`** with **`getMonthlyProfitLossReport()`** returning **`MonthlyProfitLossReport`** plus **`source: "database" | "fallback"`**.
- **Read-only** `monthly_snapshots` query ordered by **year ascending, month ascending**; rows count as data only if at least one of **`revenue_eur`**, **`expenses_eur`**, or **`profit_loss_eur`** is present and finite after normalization.
- **Fallback** uses **`mockMonthlyPl`** from **`src/data/mock/tables.ts`** (extended labels with planning year **2026**); mock **`totalEmiInr`** = **`MONTHLY_EMI_INR_TOTAL × row count`**; **`totalSalaryInr`** = **0** (no per-month salary in the mock series).
- **`src/app/(app)/reports/page.tsx`** is async with **`dynamic = "force-dynamic"`**, consumes **`getMonthlyProfitLossReport()`**, adds **six** summary **StatCards** and the same muted **database vs fallback** note pattern as the dashboard.
- **`src/components/reports/monthly-pl-chart.tsx`** accepts a **`data`** prop so Recharts plots the resolved series (database or mock).

## Files changed

| File | Change |
|------|--------|
| `src/lib/supabase/types.ts` | `MonthlySnapshotRow` + `monthly_snapshots` on `Database` |
| `src/lib/data/reports.ts` | **New** — `getMonthlyProfitLossReport()` |
| `src/app/(app)/reports/page.tsx` | Wired to reports data layer; stat cards + note |
| `src/components/reports/monthly-pl-chart.tsx` | `data` prop; exported point type |
| `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl.md` | **New** — this document |

## Report aggregation rules

| Field | Rule |
|--------|------|
| **series** | One point per snapshot: **month** label = short month + year (en-GB); **revenue** / **expenses** from EUR columns (missing → **0** for the chart). |
| **totalRevenueEur** | Sum of monthly **revenue** values. |
| **totalExpensesEur** | Sum of monthly **expenses** values. |
| **totalProfitLossEur** | Per row: **`profit_loss_eur`** if set, else **revenue − expenses**; then summed. |
| **totalSalaryInr** | Sum of **`salary_total_inr`** (nullable in seed). |
| **totalEmiInr** | Sum of **`emi_total_inr`**. |
| **latestMonthLabel** | Last row after **year, month** sort. |

## Fallback mode

1. **No Supabase env** → mock series + totals above.  
2. **Query error** → `console.warn` + mock series.  
3. **Zero rows** or **no rows with revenue/expense/P&L figures** → mock series.  
4. **Unexpected throw** → mock series.

**Mock data is not removed**; it remains the source for fallback and for other pages.

## Intentionally not implemented

- Deriving monthly P&L from full **invoices / expenses / payments** history (deferred; snapshots are the contract).  
- CRUD for **`monthly_snapshots`**, auth, protected routes.  
- Changes to **Dashboard** behavior.

## How to verify locally

- **No `.env.local`:** `/reports` shows mock series, **Source: mock monthly P&L**, six cards populated.  
- **With Supabase + seed:** `/reports` reads **`monthly_snapshots`** (e.g. May 2026 seed row), **Source: monthly_snapshots**.  
- Regression: **`/dashboard`** and other read-only modules unchanged aside from shared patterns.

## Next recommended task

- **Phase 2 Task 12 — CRUD foundation pattern** (per master plan).
