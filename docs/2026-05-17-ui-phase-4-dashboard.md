# UI Phase 4 — Dashboard

Date: 2026-05-17  
Status: Complete (dashboard page only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/dashboard/page.tsx` | Full layout alignment with design system |
| `src/lib/dashboard/presentation.ts` | Soft-status mapping, compliance rows helper, token chart colors |
| `src/components/dashboard/dashboard-panel-card.tsx` | `--af-*` card shell and typography |
| `src/components/dashboard/dashboard-quick-actions.tsx` | Token borders/backgrounds |
| `src/components/dashboard/finance-snapshot-card.tsx` | Token text colors |
| `src/components/dashboard/revenue-vs-expenses-chart.tsx` | Revenue blue / expense amber via CSS vars |
| `src/components/dashboard/expense-breakdown-chart.tsx` | Token text colors |
| `src/components/dashboard/dashboard-compliance-tasks.tsx` | **New** — compliance widget + `SoftStatusBadge` |
| `src/components/dashboard/dashboard-monthly-close.tsx` | **New** — `ProgressMetric` widget (6/9 checks) |

**Not changed:** `src/lib/data/dashboard.ts`, server actions, Supabase, other app routes, `src/components/shell/status-badge.tsx` (still used on module pages).

**Legacy (unused by dashboard, kept for reference):** `dashboard-header.tsx`, `dashboard-kpi-card.tsx`, `task-priority-dot.tsx`.

## Dashboard sections updated

1. **Page intro** — `PageHeader` with title + short description (replaces heavy `DashboardHeader`).
2. **Data source** — `DataSourceNote` inside a bordered surface card; database/fallback state unchanged.
3. **KPI grid (6)** — `PremiumKpiCard` with icon shells, badge pills from `KPI_TRENDS`, helper text; values from `getDashboardSummary()`.
4. **Analytics row** — Revenue vs Expenses chart; right column: Quick Actions, Finance Snapshot, Monthly Close widget.
5. **Detail row** — Pending Invoices table; Compliance & Tasks panel.
6. **Bottom row** — Recent Payments table; Expense Breakdown chart + legend.
7. **Privacy footer** — Note that tables use presentation-only labels.

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Six KPI metrics |
| `SoftStatusBadge` | Invoice, payment, and task status in tables/widgets |
| `ProgressMetric` | Monthly Close (6/9, “Review missing proofs”) |
| `toneRowSurface` | Compliance task row backgrounds |

Charts remain in `src/components/dashboard/*` (Recharts) with colors bound to `--af-primary-blue`, `--af-warning`, `--af-success`, etc.

## Duplicate header handling

- **Removed:** `DashboardHeader` (in-page search, export, avatar duplicated the global shell).
- **Kept:** Global `AppHeader` (Phase 3) for search and preview actions.
- **Added:** Lightweight `PageHeader` for dashboard title and one-line description only.

## Privacy / dummy display approach

- **KPI totals:** Live from `getDashboardSummary()` when database is available; fallback aggregates otherwise.
- **Tables & tasks:** Static rows in `presentation.ts` only — Client Alpha–Delta, generic accounts (Main Account, Operations Account, Payroll Account), no real names or bank identifiers.
- **Mapping:** `financeStatusToSoftToken()` maps app `FinanceStatus` to design-system badge tokens for display only; stored data is not modified.
- **Finance snapshot:** Counts are presentation constants (8 clients, 12 team); rebillable pending uses `summary.workspaceRecoveryPending`.

## What was intentionally not changed

- Backend, Supabase config, CRUD, validation, server actions
- `getDashboardSummary()` and fallback/database selection logic
- Invoices, Payments, Expenses, Salaries, Team, Tasks, Reports, Settings pages
- Navigation routes (`src/lib/navigation.ts`) — no Subscriptions, Documents, Monthly Closing page, AI, CSV, or PDF routes
- `(app)/layout.tsx` shell wrapper

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing warnings on unrelated files) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 5 — Invoices page:** Apply `PageHeader`, design-system tables/badges, and token styling to `/invoices` (list + forms) without changing data layer or routes.
