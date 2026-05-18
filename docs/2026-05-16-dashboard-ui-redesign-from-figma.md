# Dashboard UI redesign from Figma — 2026-05-16

Dashboard-only visual redesign aligned with the approved Figma Make “founder finance” concept. **No backend, schema, or data-fetching changes.**

## What was changed

### Dashboard page (`/dashboard`)

- Full-width canvas on `#F7F8FA` with `max-w-[1440px]` content
- **Header:** title, subtitle, search placeholder, Last 30 days / Export controls, date, notification + avatar placeholders
- **KPI grid (6 cards):** Revenue, Expenses, Net Profit, Pending Invoices, Pending Payouts, Upcoming Tasks — values from existing `getDashboardSummary()`; decorative trend pills are presentation-only
- **Analytics row:** Revenue vs Expenses area chart (Recharts); Quick Actions; Finance Snapshot
- **Detail row:** Pending Invoices table; Compliance & Tasks panel
- **Bottom row:** Recent Payments table; Expense Breakdown donut chart
- **DataSourceNote** retained for database/fallback transparency
- Footer note clarifying dummy table/task labels vs live KPI totals

### Presentation layer (new)

- `src/lib/dashboard/presentation.ts` — dummy client names, generic accounts, static task/payment/invoice rows, chart series built from `mockMonthlyPl` + summary month totals, expense breakdown weights

### New dashboard components

| Component | Role |
|-----------|------|
| `dashboard-header.tsx` | Client header + search |
| `dashboard-kpi-card.tsx` | Premium KPI card |
| `dashboard-panel-card.tsx` | White section shell |
| `revenue-vs-expenses-chart.tsx` | Recharts area chart |
| `expense-breakdown-chart.tsx` | Recharts donut + legend |
| `dashboard-quick-actions.tsx` | Add Invoice/Payment/Expense/Task links |
| `finance-snapshot-card.tsx` | Snapshot metrics list |
| `task-priority-dot.tsx` | Priority indicator |

### Sidebar / mobile (minimal, dashboard-adjacent)

- **Internal Finance card** replaces generic help copy: Monthly Close, 6/9 checks, link to tasks
- **Founder OS** sublabel under app title
- Same nav items unchanged

## Figma concept → code mapping

| Figma block | Implementation |
|-------------|----------------|
| KPI cards with icons & trend pills | `DashboardKpiCard` + `KPI_TRENDS` |
| Revenue vs Expenses dual area chart | `RevenueVsExpensesChart` + `buildRevenueExpenseChartSeries()` |
| Quick Actions | `DashboardQuickActions` → existing CRUD routes |
| Finance Snapshot | `FinanceSnapshotCard` (static counts + `workspaceRecoveryPending` from summary) |
| Pending Invoices table | `getPendingInvoicesPresentation()` + `DataTable` |
| Compliance & Tasks | `getComplianceTasksPresentation()` + `StatusBadge` |
| Recent Payments | `getRecentPaymentsPresentation()` |
| Expense Breakdown donut | `ExpenseBreakdownChart` + `buildExpenseBreakdown()` |
| Internal sidebar card | `InternalFinanceCard` |

## Files changed

- `src/app/(app)/dashboard/page.tsx` — full redesign
- `src/lib/dashboard/presentation.ts` — new
- `src/components/dashboard/*` — new (8 files)
- `src/components/layout/internal-finance-card.tsx` — new
- `src/components/layout/app-sidebar.tsx` — Founder OS + internal card
- `src/components/layout/mobile-nav.tsx` — internal card in sheet footer

## Intentionally not changed

- `src/lib/data/dashboard.ts` and all Supabase/query logic
- `supabase/schema.sql`, `supabase/seed.sql`
- Other app routes (invoices, payments, etc.) — only linked from dashboard actions
- CRUD permissions and fallback behaviour
- Global `AppHeader` (dashboard has its own header block)

## Privacy / dummy-data rule

- **KPI totals** use live `getDashboardSummary()` aggregates (no client/team names).
- **Tables and task list** on the dashboard use presentation-only labels:
  - Clients: Client Alpha, Beta, Gamma, Delta
  - Accounts: Main Account, Payroll, Operations
  - No real team member names, no bank identifiers, no full account numbers
- Trend percentages on KPI cards are **decorative** and not computed from financial data.

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0) |
| `npm run build` | **Passed** (exit 0; `/dashboard` and all routes build) |

---

*Resume Supabase CRUD QC on non-dashboard modules when ready.*
