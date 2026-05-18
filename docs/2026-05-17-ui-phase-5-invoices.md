# UI Phase 5 — Invoices

Date: 2026-05-17  
Status: Complete (invoices module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/invoices/page.tsx` | Full list-page redesign |
| `src/app/(app)/invoices/new/page.tsx` | Token-styled alert banner |
| `src/app/(app)/invoices/[id]/edit/page.tsx` | Token-styled saved banner |
| `src/lib/invoices/presentation.ts` | **New** — KPIs, dummy clients, proof/lifecycle/focus helpers |
| `src/components/invoices/invoice-panel-card.tsx` | **New** — premium section shell |
| `src/components/invoices/invoice-proof-compact.tsx` | **New** — table proof progress bar |
| `src/components/invoices/invoices-collection-focus.tsx` | **New** — `FocusPanel` wrapper |
| `src/components/invoices/invoices-proof-checklist.tsx` | **New** — `ProgressMetric` checklist widget |
| `src/components/invoices/invoices-lifecycle.tsx` | **New** — `LifecyclePipeline` section |
| `src/components/invoices/invoice-form.tsx` | Visual tokens + `InvoicePanelCard` sections |

**Not changed:** `src/lib/data/invoices.ts`, server actions, validation schemas, Supabase, other app routes.

## Invoices sections updated

1. **Page header** — Title, subtitle, Add invoice action (unchanged behavior).
2. **Data source** — `DataSourceNote` in bordered card; database/fallback + `canMutate` unchanged.
3. **KPI row (5)** — Total Invoiced, Paid Invoices, Pending Collection, Overdue Amount, Proof Completion (derived from current list).
4. **Invoice lifecycle** — Draft → Sent → Paid → Proof Complete → Closed (`LifecyclePipeline`).
5. **Invoices register** — Premium panel, Show cancelled toggle, redesigned table columns.
6. **Collection Focus** — Overdue, awaiting payment, missing proof, ready for monthly close.
7. **Proof Checklist Overview** — Invoice PDF, Work Report, Email Proof, Payment Proof (`ProgressMetric`, visual only).

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | Invoice status + payment column |
| `FocusPanel` | Collection focus widget |
| `ProgressMetric` | Proof checklist overview |
| `LifecyclePipeline` | Stage counts |
| `toneProgressFill` | Compact proof bar in table |

## Form styling changes

- `InvoicePanelCard` replaces `FormSection` for consistent premium cards.
- Select/textarea use `--af-border`, `--af-surface`, focus ring tokens.
- All fields, server actions, Save/Cancel/Cancel invoice behavior unchanged.
- Form client/bank dropdowns still show real labels from Supabase when connected (edit/create only; not the list register).

## Privacy / dummy display approach

- **List register client column:** `displayClientLabel()` maps `client_id` → Client Alpha–Delta (presentation only).
- **KPIs, lifecycle, focus, proof:** Computed from list rows without changing stored data.
- **Proof readiness:** Inferred from `invoice_number`, `hours`, `sent_date`, `paid_date` / `payment_reference` — no uploads or schema.
- **Footer note** on list page explains presentation vs form data.

## What was intentionally not changed

- `getInvoices`, `getInvoiceById`, `getInvoiceFormOptions`, mutations
- Table column data values (amounts, dates, IDs) — only client display masked on list
- No PDF, document upload, CSV, or new routes
- Payments, Expenses, Salaries, Team, Tasks, Reports, Settings, Dashboard

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing warnings on unrelated files) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 6 — Payments page:** Apply the same pattern (KPI row, premium register, focus panel, tokens) to `/payments` without changing the data layer.
