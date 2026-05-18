# UI Phase 8 — Salaries

Date: 2026-05-17  
Status: Complete (salaries module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/salaries/page.tsx` | Full list-page redesign |
| `src/app/(app)/salaries/new/page.tsx` | Token-styled alert banner |
| `src/app/(app)/salaries/[id]/edit/page.tsx` | Token banners; generic edit description |
| `src/lib/salaries/presentation.ts` | **New** — KPIs, charts, proof/lifecycle/focus/team helpers |
| `src/components/salaries/salary-panel-card.tsx` | **New** — premium section shell |
| `src/components/salaries/salary-proof-compact.tsx` | **New** — table proof progress bar |
| `src/components/salaries/salary-burn-trend-chart.tsx` | **New** — total/paid/pending area chart |
| `src/components/salaries/payout-status-chart.tsx` | **New** — payout status donut + legend |
| `src/components/salaries/salaries-payroll-focus.tsx` | **New** — `FocusPanel` wrapper |
| `src/components/salaries/salaries-team-payout-summary.tsx` | **New** — team function buckets widget |
| `src/components/salaries/salaries-proof-checklist.tsx` | **New** — `ProgressMetric` checklist widget |
| `src/components/salaries/salaries-lifecycle.tsx` | **New** — `LifecyclePipeline` section |
| `src/components/salaries/salary-payment-form.tsx` | Visual tokens + `SalaryPanelCard` sections |

**Not changed:** `src/lib/data/salaries.ts`, server actions, validation schemas, Supabase, other app routes.

## Salaries sections updated

1. **Page header** — Subtitle aligned with Figma; Add salary payment action unchanged.
2. **Data source** — `DataSourceNote` in bordered card; database/fallback + `canMutate` unchanged.
3. **KPI row (5)** — Total Salary Burn, Paid This Month, Pending Payouts, Partial Payments, Proof Completion.
4. **Salary Burn Trend** — Area chart (blue total, green paid, amber pending).
5. **Payout Status** — Paid, Pending, Partial, Scheduled breakdown (EUR-equiv.).
6. **Payroll lifecycle** — Draft → Scheduled → Paid → Proof Complete → Closed.
7. **Salaries register** — New columns; Show removed toggle preserved.
8. **Payroll Focus** — Pending, partial, missing proofs, inactive review (visual only).
9. **Team Payout Summary** — Developers, Design, QA, Support, Operations.
10. **Salary Proof Overview** — Five `ProgressMetric` rows (no uploads).

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | Status, reference chips |
| `FocusPanel` | Payroll focus widget |
| `ProgressMetric` | Proof checklist overview |
| `LifecyclePipeline` | Stage counts |
| `toneProgressFill` | Compact proof bar in table |

## Form styling changes

- `SalaryPanelCard` replaces `FormSection` for consistent premium cards.
- Select/textarea use `--af-border`, `--af-surface`, focus ring tokens.
- Fields, server actions, Save/soft-delete behavior unchanged; total amount remains manual entry.
- Form team/bank dropdowns still show real labels when Supabase is connected.

## Privacy / dummy display approach

- **Register team member column:** `displayTeamMember()` → Team Member 01–05.
- **Role column:** `displayRole()` → function bucket + “Staff” (no raw member names).
- **References:** Truncated; no bank institution names on list.
- **KPIs / charts:** EUR equivalents via `amountToEur()` (INR uses `inrToEur`).
- **Team summary:** Aggregated by role bucket only.

## What was intentionally not changed

- Backend, Supabase, CRUD, validation, server actions
- `getSalaryPayments`, `getSalaryPaymentById`, `getSalaryFormOptions`, fallback mock lines
- Team, Tasks, Reports, Settings, Dashboard, Invoices, Payments, Expenses pages
- No payroll automation, uploads, Subscriptions route, or CSV import

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 1 pre-existing warning on unrelated file) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 9 — Team page:** Apply KPI row, premium register, focus panel, and token styling to `/team` without changing the data layer.
