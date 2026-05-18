# UI Phase 6 — Payments

Date: 2026-05-17  
Status: Complete (payments module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/payments/page.tsx` | Full list-page redesign |
| `src/app/(app)/payments/new/page.tsx` | Token-styled alert banner |
| `src/app/(app)/payments/[id]/edit/page.tsx` | Token-styled saved banner |
| `src/lib/payments/presentation.ts` | **New** — KPIs, charts, proof/lifecycle/focus helpers |
| `src/components/payments/payment-panel-card.tsx` | **New** — premium section shell |
| `src/components/payments/payment-proof-compact.tsx` | **New** — table proof progress bar |
| `src/components/payments/cash-movement-chart.tsx` | **New** — inflow/outflow/net area chart |
| `src/components/payments/bank-distribution-chart.tsx` | **New** — donut + legend by generic account |
| `src/components/payments/payments-reconciliation-focus.tsx` | **New** — `FocusPanel` wrapper |
| `src/components/payments/payments-proof-checklist.tsx` | **New** — `ProgressMetric` checklist widget |
| `src/components/payments/payments-lifecycle.tsx` | **New** — `LifecyclePipeline` section |
| `src/components/payments/payment-form.tsx` | Visual tokens + `PaymentPanelCard` sections |

**Not changed:** `src/lib/data/payments.ts`, server actions, validation schemas, Supabase, other app routes.

## Payments sections updated

1. **Page header** — Subtitle aligned with Figma; Add payment action unchanged.
2. **Data source** — `DataSourceNote` in bordered card; database/fallback + `canMutate` unchanged.
3. **KPI row (5)** — Total Inflow, Total Outflow, Net Movement, Unmapped Payments, Proof Completion (EUR list-derived).
4. **Cash Movement** — Area chart (green inflow, red outflow, teal net) from payment dates.
5. **Bank Distribution** — Donut/list with Main / Payroll / Operations / Reserve labels only.
6. **Payment lifecycle** — Detected → Linked → Verified → Proof Complete → Closed.
7. **Payments register** — New columns; Show removed toggle preserved.
8. **Reconciliation Focus** — Unmapped, missing proofs, references to verify, bank mismatch (visual only).
9. **Payment Proof Overview** — Five `ProgressMetric` rows (no uploads).

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | Direction, linked record, status |
| `FocusPanel` | Reconciliation focus widget |
| `ProgressMetric` | Proof checklist overview |
| `LifecyclePipeline` | Stage counts |
| `toneProgressFill` | Compact proof bar in table |

## Form styling changes

- `PaymentPanelCard` replaces `FormSection` for consistent premium cards.
- Select/textarea use `--af-border`, `--af-surface`, focus ring tokens.
- Fields, server actions, Save/soft-delete behavior unchanged.
- Form dropdowns still show real bank/invoice/salary/expense labels when Supabase is connected.

## Privacy / dummy display approach

- **Register columns:** `displayPayerPayeeLabel()` and `displayAccountLabel()` map to dummy clients/vendors/team and generic accounts.
- **References:** Truncated for display; no full bank institution names on list.
- **KPIs / charts:** Derived from current rows (EUR-only for monetary KPIs and distribution).
- **Proof checklist:** Inferred from `reference`, `payer_payee_name`, links, `notes` — presentation only.
- **Footer note** explains list masking vs form data.

## What was intentionally not changed

- Backend, Supabase, CRUD, validation, server actions
- `getPayments`, `getPaymentById`, `getPaymentFormOptions`, fallback behavior
- Expenses, Salaries, Team, Tasks, Reports, Settings, Dashboard, Invoices pages
- No reconciliation automation, uploads, PDF, or new routes

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing warnings on unrelated files) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 7 — Expenses page:** Apply KPI row, premium register, focus panel, and token styling to `/expenses` without changing the data layer.
