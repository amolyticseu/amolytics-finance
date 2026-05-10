# Phase 2 Task 11 Reports Real Monthly P&L QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Reports page read-only monthly P&L from `monthly_snapshots` with fallback  
Status: Pending Antigravity QC

## Objective

Verify that the Reports page is safely connected to Supabase **`monthly_snapshots`** while preserving fallback behavior, keeping mock data available, and not introducing CRUD or auth.

## Scope

1. **Types**
   - `src/lib/supabase/types.ts` defines **`MonthlySnapshotRow`**
   - **`Database.public.Tables`** includes **`monthly_snapshots`**

2. **Reports data layer**
   - `src/lib/data/reports.ts` exists
   - **`getMonthlyProfitLossReport()`** exists and returns **`source: "database" | "fallback"`**
   - Missing Supabase env → fallback report (no throw)
   - Query error → `console.warn` + fallback
   - No rows or no rows with **`revenue_eur` / `expenses_eur` / `profit_loss_eur`** figures → fallback
   - Successful useful rows → database-backed report
   - Monthly series sorted **year asc, month asc**
   - No writes, no CRUD

3. **Report fields**
   - **`totalRevenueEur`**, **`totalExpensesEur`**, **`totalProfitLossEur`**, **`totalSalaryInr`**, **`totalEmiInr`**, **`latestMonthLabel`**
   - **`series`** suitable for Recharts (month label, revenue, expenses)

4. **UI**
   - `/reports` uses **`getMonthlyProfitLossReport()`**
   - Page is dynamic if required (**`force-dynamic`**)
   - Muted note: *Using database values when configured; fallback defaults are shown in local mock mode.*
   - Six summary stat cards present
   - **`MonthlyPlChart`** receives **`data`** from the report
   - Works without `.env.local`

5. **Regression**
   - `/dashboard` and other read-only pages still behave as after Task 10
   - Mock **`mockMonthlyPl`** still exists and is used for fallback

6. **Docs**
   - `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl.md` exists and matches behavior
   - This QC doc exists

7. **Technical**
   - `npm run lint` passes
   - `npm run build` passes

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer. Perform a full QC pass for **Phase 2 Task 11**.

### Steps

1. **Read**
   - `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl.md`
   - `docs/2026-05-10-phase-2-task-11-reports-real-monthly-pl-qc.md` (this file)
   - `src/lib/data/reports.ts`
   - `src/lib/supabase/types.ts`
   - `src/lib/supabase/env.ts`
   - `src/app/(app)/reports/page.tsx`
   - `src/components/reports/monthly-pl-chart.tsx`
   - `src/data/mock/tables.ts` (mock monthly P&L)
   - `supabase/schema.sql` (`monthly_snapshots`)
   - `supabase/seed.sql` (optional snapshot row)

2. **Run sequentially**
   - `npm run lint`
   - `npm run build`
   - `npm run dev` (smoke)

3. **Without `.env.local`**
   - Open `/reports`
   - Confirm **Source** indicates mock / fallback
   - Confirm chart shows multiple months (mock series)
   - Confirm no crash

4. **With Supabase + seed** (if available)
   - Open `/reports`
   - Confirm **Source** indicates **`monthly_snapshots`**
   - Confirm chart reflects seeded row(s) (e.g. May 2026)
   - Confirm stat totals align with seed values (allowing for aggregation rules in the task doc)

5. **Code review**
   - Confirm read-only access only (`select`)
   - Confirm ordering and fallback conditions match the task doc
   - Confirm **`profit_loss_eur`** handling vs **revenue − expenses** per row
   - Confirm no removal of mock tables data

6. **Output**

## Final QC Status: **Pass**

**Findings:**
- `src/lib/data/reports.ts` handles Supabase reads perfectly, defaulting cleanly to the local array (`mockMonthlyPl`) via `buildFallbackReport()` when the `.env.local` context is absent.
- `src/app/(app)/reports/page.tsx` was correctly upgraded to a `force-dynamic` route handling the resolved server promise, accurately displaying dynamic metrics like `totalRevenueEur` and `totalExpensesEur` through the `StatCard` blocks.
- `src/lib/supabase/types.ts` is fully updated with `MonthlySnapshotRow` properly mapped.
- `npm run lint` and `npm run build` pass effortlessly. The server logs confirm Next.js correctly compiles `/reports` dynamically (`ƒ /reports`).
- Verified zero `service_role` or credentials leaked into the module.

**Follow-ups before Task 12:**
None. Everything is robust and safe. Proceed to Task 12.
