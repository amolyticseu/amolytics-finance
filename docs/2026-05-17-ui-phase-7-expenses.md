# UI Phase 7 — Expenses

Date: 2026-05-17  
Status: Complete (expenses module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/expenses/page.tsx` | Full list-page redesign |
| `src/app/(app)/expenses/[id]/edit/page.tsx` | Token-styled saved banner |
| `src/lib/expenses/presentation.ts` | **New** — KPIs, charts, proof/lifecycle/focus/burn helpers |
| `src/components/expenses/expense-panel-card.tsx` | **New** — premium section shell |
| `src/components/expenses/expense-proof-compact.tsx` | **New** — table proof progress bar |
| `src/components/expenses/expense-trend-chart.tsx` | **New** — total/recurring/rebillable area chart |
| `src/components/expenses/category-breakdown-chart.tsx` | **New** — donut + legend by category |
| `src/components/expenses/expenses-rebillable-focus.tsx` | **New** — `FocusPanel` wrapper |
| `src/components/expenses/expenses-recurring-burn.tsx` | **New** — recurring burn widget |
| `src/components/expenses/expenses-proof-checklist.tsx` | **New** — `ProgressMetric` checklist widget |
| `src/components/expenses/expenses-lifecycle.tsx` | **New** — `LifecyclePipeline` section |
| `src/components/expenses/expense-form.tsx` | Visual tokens + `ExpensePanelCard` sections |

**Not changed:** `src/lib/data/expenses.ts`, server actions, validation schemas, Supabase, other app routes.

## Expenses sections updated

1. **Page header** — Subtitle aligned with Figma; Add expense action unchanged.
2. **Data source** — `DataSourceNote` in bordered card; database/fallback + `canMutate` unchanged.
3. **KPI row (5)** — Total Expenses, Recurring Burn, Rebillable Pending, Overdue Expenses, Proof Completion (EUR-equivalent from list).
4. **Expense Trend** — Area chart (amber total, blue recurring, green rebillable).
5. **Category Breakdown** — Operations, Team, Software, Infrastructure, Compliance, Misc.
6. **Expense lifecycle** — Recorded → Approved → Paid → Proof Complete → Closed.
7. **Expenses register** — New columns; Show removed toggle preserved.
8. **Rebillable Recovery** — Focus panel (visual only).
9. **Recurring Burn** — Software, Infrastructure, Workspace, Operations, Compliance buckets with monthly/annual/due/status.
10. **Expense Proof Overview** — Five `ProgressMetric` rows (no uploads).

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | Category, type chips, status, linked client |
| `FocusPanel` | Rebillable recovery widget |
| `ProgressMetric` | Proof checklist overview |
| `LifecyclePipeline` | Stage counts |
| `toneProgressFill` | Compact proof bar in table |

## Form styling changes

- `ExpensePanelCard` replaces `FormSection` for consistent premium cards.
- Select/textarea use `--af-border`, `--af-surface`, focus ring tokens.
- Fields, server actions, Save/Cancel expense behavior unchanged.
- Form client/bank dropdowns still show real labels when Supabase is connected.

## Privacy / dummy display approach

- **Register vendor column:** `displayVendorLabel()` → Vendor Alpha/Beta/Nova.
- **Linked client column:** `displayClientLabel()` → Client Alpha–Gamma when linked.
- **Payment ref:** Truncated generic display; no full bank names on list.
- **KPIs / charts:** EUR equivalents via `amountToEur()` (INR converted with existing `inrToEur` constant).
- **Proof / lifecycle / focus:** Derived from row fields only; no schema changes.

## What was intentionally not changed

- Backend, Supabase, CRUD, validation, server actions
- `getExpenses`, `getExpenseById`, `getExpenseFormOptions`, fallback mock lines
- Salaries, Team, Tasks, Reports, Settings, Dashboard, Invoices, Payments pages
- No Subscriptions route, CSV import, recurring automation, or upload flows

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing warnings on unrelated files) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 8 — Salaries page:** Apply KPI row, premium register, focus panel, and token styling to `/salaries` without changing the data layer.
