# UI Phase 11 — Reports

Date: 2026-05-17  
Status: Complete (reports module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/reports/page.tsx` | Full page redesign |
| `src/lib/reports/presentation.ts` | **New** — KPIs, breakdowns, snapshots, focus, export helpers |
| `src/components/reports/reports-panel-card.tsx` | **New** — premium section shell |
| `src/components/reports/reports-proof-compact.tsx` | **New** — table proof progress bar |
| `src/components/reports/reports-monthly-pl-chart.tsx` | **New** — revenue/expenses bars + profit line |
| `src/components/reports/reports-health-checklist.tsx` | **New** — `ProgressMetric` report health widget |
| `src/components/reports/reports-breakdown-row.tsx` | **New** — revenue, expense, cash breakdown cards |
| `src/components/reports/reports-closing-focus.tsx` | **New** — `FocusPanel` wrapper |
| `src/components/reports/reports-available-grid.tsx` | **New** — in-page report cards grid |
| `src/components/reports/reports-export-panel.tsx` | **New** — visual export options (no implementation) |

**Not changed:** `src/lib/data/reports.ts`, `src/components/reports/monthly-pl-chart.tsx` (superseded on page by new chart), other app routes.

## Reports sections updated

1. **Page header** — Subtitle on P&L, cash, and closing readiness.
2. **Data source** — `DataSourceNote` in bordered card; database/fallback unchanged.
3. **KPI row (5)** — Total Revenue, Total Expenses, Net Profit, Salary Burn, Closing Readiness.
4. **Monthly P&L** — Composed chart (revenue blue, expenses amber, profit green line).
5. **Report Health** — Data Completeness, Proof Readiness, Reconciliation, Monthly Close.
6. **Financial breakdown** — Revenue, Expense, and Cash Movement compact cards.
7. **Monthly Snapshots** — Full register with proof bars and close status badges.
8. **Closing Readiness** — Focus panel (visual only).
9. **Available Reports** — Six in-page cards with Ready/Partial/Pending and View anchors.
10. **Export Options** — Visual panel; no CSV/PDF implementation.

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | P&L, close status, report card status |
| `FocusPanel` | Closing readiness widget |
| `ProgressMetric` | Report health checklist |
| `toneProgressFill` | Compact proof bar in snapshots table |
| Recharts | Monthly P&L composed chart |

## Privacy / dummy display approach

- **Breakdown labels:** Client Revenue, Rebillable Recovery, Operations, Team, Software, Compliance — no client or team names.
- **Snapshots table:** Month labels from series only; salary column uses distributed INR→EUR or presentation estimate.
- **Closing focus counts:** Derived from series length, not real entity IDs.
- **KPI values:** From `getMonthlyProfitLossReport()` totals — aggregated, not line-item sensitive data.

## What was intentionally not changed

- Backend, Supabase, `getMonthlyProfitLossReport`, fallback mock series
- Settings and all other module pages
- No monthly closing route, uploads, CSV import, PDF generation, or automation
- No new sidebar routes for report types

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 1 pre-existing warning on unrelated file) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 12 — Settings page:** Apply design tokens and premium cards to `/settings` and sub-pages without changing the data layer.
