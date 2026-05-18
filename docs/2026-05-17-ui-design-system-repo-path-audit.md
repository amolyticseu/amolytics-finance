# UI Design System Repo Path Audit — Amolytics Finance

Date: 2026-05-17  
Status: Planning only

## Objective

Map the Figma Make design system implementation plan (from the Cursor paste / `Pasted text.txt`) to the **actual** repository structure before writing code. The Figma plan assumes paths such as `/src/styles/theme.css` and `/src/app/components/premium/` that **do not exist** in this repo.

## Current Scope

We are only implementing UI/UX for **existing** routes:

| Route | App path |
|-------|----------|
| Dashboard | `/dashboard` |
| Invoices | `/invoices` (+ `/invoices/new`, `/invoices/[id]/edit`) |
| Payments | `/payments` (+ new/edit) |
| Team | `/team` (+ new/edit) |
| Salaries | `/salaries` (+ new/edit) |
| Expenses | `/expenses` (+ new/edit) |
| Tasks | `/tasks` (+ new/edit) |
| Reports | `/reports` |
| Settings | `/settings` (+ `/settings/clients`, `/settings/bank-accounts` and CRUD sub-routes) |

**Do not add** new top-level routes for:

- Subscriptions (future module — see `docs/2026-05-16-subscriptions-module-context-update.md`)
- Documents / proof upload
- Monthly Closing (dedicated page)
- Separate Compliance page
- AI
- CSV Import
- PDF Invoice Generator

Future-ready **widgets** (e.g. subscription burn, proof completion) may appear **inside** existing pages only after explicit scope approval.

Navigation source of truth: `src/lib/navigation.ts` (`appNavItems` — 9 items, Expenses included).

---

## Actual Repo Structure Found

### Stack (from `package.json`)

- **Next.js** 16.2.6 (App Router)
- **React** 19
- **Tailwind CSS** v4 (`@tailwindcss/postcss` — **no** `tailwind.config.js` / `tailwind.config.ts`)
- **shadcn/ui** (`components.json`, style `base-nova`)
- **Recharts** 3.x (already used on Dashboard and Reports)
- **Fonts:** Geist Sans + Geist Mono via `next/font` in `src/app/layout.tsx` (Figma plan references **Inter** and `/src/styles/fonts.css` — **not present**)

### Global CSS / theme

| Figma assumption | Actual |
|------------------|--------|
| `/src/styles/theme.css` | **Does not exist** |
| `/src/styles/fonts.css` | **Does not exist** |
| Theme tokens | `src/app/globals.css` only — imports `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`; defines `:root` / `.dark` CSS variables and `@theme inline` mappings |
| Tailwind config file | **None** — `postcss.config.mjs` only |
| shadcn CSS entry | `components.json` → `"css": "src/app/globals.css"` |

### App layout

| Role | Path |
|------|------|
| Root layout | `src/app/layout.tsx` |
| Authenticated shell | `src/app/(app)/layout.tsx` — `AppSidebar` + `AppHeader` + `<main>` wrapper (`max-w-6xl`, padding) |
| Home redirect | `src/app/page.tsx` |

### Sidebar / header / navigation

| Role | Path |
|------|------|
| Sidebar | `src/components/layout/app-sidebar.tsx` |
| Sidebar links | `src/components/layout/sidebar-nav-link.tsx` |
| Mobile nav (sheet) | `src/components/layout/mobile-nav.tsx` |
| Global header (non-dashboard-specific) | `src/components/layout/app-header.tsx` |
| Monthly Close footer card | `src/components/layout/internal-finance-card.tsx` |
| Nav config | `src/lib/navigation.ts` |

There is **no** `PremiumSidebar.tsx`, `PremiumHeader.tsx`, or `src/app/components/premium/` directory.

### Shared / shell UI (`src/components/shell/`)

| Component | Path |
|-----------|------|
| Page header | `page-header.tsx` |
| Section card | `section-card.tsx` |
| Data table | `data-table.tsx` (+ `dataTableRowClassName`) |
| Status badge | `status-badge.tsx` |
| Data source note | `data-source-note.tsx` |
| Page alert | `page-alert.tsx` |
| Empty table state | `empty-table-state.tsx` |

### Forms (`src/components/forms/`)

| Component | Path |
|-----------|------|
| Form section | `form-section.tsx` |
| Form actions | `form-actions.tsx` |
| Labeled field | `labeled-field.tsx` |
| Field error | `field-error.tsx` |
| Action banner | `action-banner.tsx` |
| Read-only fallback banner | `read-only-fallback-banner.tsx` |
| Back link | `back-link.tsx` |
| Submit button | `submit-button.tsx` |
| Form controls (classes) | `form-controls.ts` |

### shadcn primitives (`src/components/ui/`)

`button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `sheet.tsx`, `separator.tsx`

### Dashboard-specific (`src/components/dashboard/`)

| Component | Path | Notes |
|-----------|------|--------|
| Dashboard page | `src/app/(app)/dashboard/page.tsx` | Server component; calls `getDashboardSummary()` |
| Dashboard header (local) | `dashboard-header.tsx` | Client; search / export / avatar placeholders |
| KPI card (Figma-style) | `dashboard-kpi-card.tsx` | Already implements premium KPI pattern |
| Panel card | `dashboard-panel-card.tsx` | White cards, `#E2E8F0` borders |
| Quick actions | `dashboard-quick-actions.tsx` | |
| Finance snapshot | `finance-snapshot-card.tsx` | |
| Revenue vs expenses chart | `revenue-vs-expenses-chart.tsx` | Recharts area chart |
| Expense breakdown | `expense-breakdown-chart.tsx` | Recharts donut |
| Task priority dot | `task-priority-dot.tsx` | |
| Legacy stat card | `stat-card.tsx` | Still used on **Reports** only |

Presentation-only dummy data (no PII on dashboard tables): `src/lib/dashboard/presentation.ts`

### Reports

| Role | Path |
|------|------|
| Page | `src/app/(app)/reports/page.tsx` |
| Chart | `src/components/reports/monthly-pl-chart.tsx` |

### Entity pages (App Router — server pages, not `components/pages/`)

Each list page is a **single** `page.tsx` under `src/app/(app)/…` using `PageHeader`, `SectionCard`, `DataTable`, `DataSourceNote`, etc. Entity forms live under `src/components/{entity}/`.

| Module | List page | Form component(s) | New / edit pages |
|--------|-----------|-------------------|------------------|
| Invoices | `invoices/page.tsx` | `components/invoices/invoice-form.tsx` | `invoices/new`, `invoices/[id]/edit` |
| Payments | `payments/page.tsx` | `components/payments/payment-form.tsx` | `payments/new`, `payments/[id]/edit` |
| Expenses | `expenses/page.tsx` | `components/expenses/expense-form.tsx` | `expenses/new`, `expenses/[id]/edit` |
| Salaries | `salaries/page.tsx` | `components/salaries/salary-payment-form.tsx` | `salaries/new`, `salaries/[id]/edit` |
| Team | `team/page.tsx` | `components/team/team-member-form.tsx` | `team/new`, `team/[id]/edit` |
| Tasks | `tasks/page.tsx` | `components/tasks/task-form.tsx` | `tasks/new`, `tasks/[id]/edit` |
| Settings | `settings/page.tsx` | — | — |
| Clients | `settings/clients/page.tsx` | `components/clients/client-form.tsx` | `settings/clients/new`, `…/[id]/edit` |
| Bank accounts | `settings/bank-accounts/page.tsx` | `components/bank-accounts/bank-account-form.tsx` | `settings/bank-accounts/new`, `…/[id]/edit` |

### Data / backend (do not change in UI phases)

| Layer | Path |
|-------|------|
| Dashboard summary | `src/lib/data/dashboard.ts` |
| Per-module data | `src/lib/data/{invoices,payments,expenses,salaries,team,tasks,reports,settings,clients,bank-accounts}.ts` |
| Server actions | `src/lib/actions/*.ts` |
| Mock fallback | `src/data/mock/` |
| Supabase | `src/lib/supabase/`, `supabase/schema.sql`, `supabase/seed.sql` |

### Prior UI work (context)

- `docs/2026-05-16-ui-ux-polish-pass.md` — shell consistency, fallback banners, empty states
- `docs/2026-05-16-dashboard-ui-redesign-from-figma.md` — dashboard already partially aligned to Figma (KPI grid, charts, dummy labels)

---

## Figma Plan Path Corrections

| Figma plan path | Actual repo path | Action |
|-----------------|------------------|--------|
| `/src/styles/theme.css` | **Missing** — tokens in `src/app/globals.css` | **Phase 1:** extend `globals.css` (`:root`, `@theme inline`). Optionally add `src/styles/theme.css` later **only if** imported from `globals.css` (not required). |
| `/src/styles/fonts.css` | **Missing** — fonts in `src/app/layout.tsx` (`Geist`, `Geist_Mono`) | Decide: keep Geist **or** switch to Inter in `layout.tsx` + document in Phase 1. Do not reference non-existent `fonts.css`. |
| `tailwind.config.*` | `postcss.config.mjs` only | Map design tokens via CSS variables in `globals.css`; use `@theme inline` for Tailwind v4. |
| `/src/app/components/shared/PremiumKPICard.tsx` | `src/components/dashboard/dashboard-kpi-card.tsx` | **Evolve or alias** in `src/components/shell/` or `src/components/design-system/` — do not create under `src/app/components/`. |
| `/src/app/components/shared/StatusBadge.tsx` | `src/components/shell/status-badge.tsx` | **Extend** existing component (Phase 2). |
| `/src/app/components/shared/FocusPanel.tsx` | **Does not exist** | **Create** e.g. `src/components/shell/focus-panel.tsx` or `src/components/design-system/focus-panel.tsx`. |
| `/src/app/components/shared/ProgressMetric.tsx` | **Does not exist** | **Create** alongside shell/design-system folder. |
| `/src/app/components/shared/LifecyclePipeline.tsx` | **Does not exist** | **Create** alongside shell/design-system folder. |
| `/src/app/components/premium/PremiumSidebar.tsx` | `src/components/layout/app-sidebar.tsx` | **Update** existing sidebar (Phase 3). |
| `/src/app/components/premium/PremiumHeader.tsx` | `src/components/layout/app-header.tsx` + `src/components/dashboard/dashboard-header.tsx` | Global header vs dashboard-local header — clarify per page in Phase 3/4. |
| `/src/app/components/premium/PremiumDashboard.tsx` | `src/app/(app)/dashboard/page.tsx` + `src/components/dashboard/*` | **Refine** existing implementation (Phase 4), not a new premium file. |
| `/src/app/components/premium/PremiumInvoices.tsx` | `src/app/(app)/invoices/page.tsx` | **Update** page + shell usage (Phase 5). |
| `/src/app/components/premium/PremiumPayments.tsx` | `src/app/(app)/payments/page.tsx` | Phase 6. |
| `/src/app/components/premium/PremiumExpenses.tsx` | `src/app/(app)/expenses/page.tsx` | Phase 7. |
| `/src/app/components/premium/PremiumSalaries.tsx` | `src/app/(app)/salaries/page.tsx` | Phase 8. |
| `/src/app/components/premium/PremiumTeam.tsx` | `src/app/(app)/team/page.tsx` | Phase 9. |
| `/src/app/components/pages/Tasks.tsx` | `src/app/(app)/tasks/page.tsx` | Phase 10 — App Router, not `components/pages/`. |
| `/src/app/components/pages/Reports.tsx` | `src/app/(app)/reports/page.tsx` | Phase 11. |
| `/src/app/components/pages/Settings.tsx` | `src/app/(app)/settings/page.tsx` (+ clients/bank sub-routes) | Phase 12. |
| `components.json` aliases | `@/components` → `src/components` | All new UI must use `@/components/...` imports. |

**Recommended shared component location (repo convention):**

- Prefer `src/components/shell/` for cross-page primitives (tables, badges, KPI shells).
- Or introduce `src/components/design-system/` for Figma-named primitives if we want a clear boundary from entity forms.
- **Do not** use `src/app/components/` — not part of this project’s layout.

---

## Recommended Implementation Phases

Phases follow the Figma paste order, corrected to repo paths. **One phase per PR/review cycle.**

### Phase 1: Design tokens / global CSS only

- **Update:** `src/app/globals.css` (`:root`, `.dark`, `@theme inline`) with Figma colors, radii, shadows, spacing CSS variables.
- **Optional:** add `src/styles/theme.css` and `@import` it from `globals.css` for readability (only if team wants split files).
- **Consider:** Inter vs Geist in `src/app/layout.tsx` (product decision).
- **Do not touch:** any `src/components/**` or `src/app/(app)/**/page.tsx`.

### Phase 2: Shared UI components only

- **Create (suggested paths):**
  - `src/components/shell/kpi-card.tsx` (or generalize `dashboard-kpi-card.tsx` → shared `KpiCard`)
  - `src/components/shell/focus-panel.tsx`
  - `src/components/shell/progress-metric.tsx`
  - `src/components/shell/lifecycle-pipeline.tsx`
- **Update:** `src/components/shell/status-badge.tsx` (extended status/priority variants per design system).
- **Do not touch:** route pages yet. Add a temporary Storybook-style dev page **only if** explicitly approved (otherwise verify via minimal test harness or Phase 4).

### Phase 3: Sidebar / header only

- **Update:** `app-sidebar.tsx`, `sidebar-nav-link.tsx`, `mobile-nav.tsx`, `internal-finance-card.tsx`, `app-header.tsx`.
- **Align:** width 240px (`w-60` today), active blue gradient, Founder OS label (partially done).
- **Do not change:** `src/lib/navigation.ts` item list (9 routes only).

### Phase 4: Dashboard only (proof of concept)

- **Update:** `src/app/(app)/dashboard/page.tsx`, `src/components/dashboard/*`, `src/lib/dashboard/presentation.ts` (presentation labels only).
- **Resolve:** `(app)/layout.tsx` `max-w-6xl` vs dashboard full-bleed `#F7F8FA` — may need route-specific layout or wrapper class in Phase 4 doc.
- **Keep:** `getDashboardSummary()` unchanged; KPI values from summary; tables/tasks use dummy labels per privacy rule.

### Phase 5: Invoices

- **Update:** `invoices/page.tsx`, `invoices/new`, `invoices/[id]/edit`, `invoice-form.tsx`.
- Reuse Phase 2 shell components where applicable.

### Phase 6: Payments

- `payments/page.tsx`, `payment-form.tsx`, new/edit routes.

### Phase 7: Expenses

- `expenses/page.tsx`, `expense-form.tsx`, new/edit routes.

### Phase 8: Salaries

- `salaries/page.tsx`, `salary-payment-form.tsx`, new/edit routes.

### Phase 9: Team

- `team/page.tsx`, `team-member-form.tsx`, new/edit routes.

### Phase 10: Tasks

- `tasks/page.tsx`, `task-form.tsx`, new/edit routes.

### Phase 11: Reports

- `reports/page.tsx`, `monthly-pl-chart.tsx`, migrate `stat-card.tsx` to shared KPI card if unified in Phase 2.

### Phase 12: Settings

- `settings/page.tsx`, `settings/clients/*`, `settings/bank-accounts/*`, client/bank forms.

### Phase 13: Final polish and responsive / accessibility check

- Cross-page spacing (24px section / 20px card gap), radii, badge pills, table row height, chart colors, mobile scroll, contrast/focus rings.
- Update `docs/2026-05-16-ui-ux-polish-pass.md` or add `docs/2026-05-XX-design-system-rollout-qc.md`.

---

## Guardrails

- **Do not** implement all pages at once.
- **Do not** change `src/lib/data/*`, `src/lib/actions/*`, validation schemas, or Supabase client usage unless a change is purely presentational and approved.
- **Do not** modify `supabase/schema.sql` or `supabase/seed.sql` in UI phases.
- **Do not** remove fallback mode (`hasSupabaseEnv`, `DataSourceNote`, `ReadOnlyFallbackBanner`, View vs Edit).
- **Do not** expose real client names, team names, full bank details, or secrets on dashboard/marketing-style widgets — use `presentation.ts` patterns and generic labels (Client Alpha, Main Account, etc.).
- **Do not** add sidebar routes (Subscriptions, Documents, Monthly Close page, AI, Import, PDF).
- **Do not** add uploads, AI, PDF generation, CSV import, reminders, or automation in UI phases.
- **Do not** create `src/app/components/premium/` or duplicate parallel page components — update App Router pages in place.
- Preserve CRUD routes and server actions; styling-only diffs preferred.

---

## First Implementation Recommendation

**Start with Phase 1 only: Design tokens / global CSS.**

### File to update

- **Primary:** `src/app/globals.css`
  - Add semantic tokens: `--af-bg`, `--af-surface`, `--af-text-primary`, `--af-primary-blue`, soft backgrounds, card shadow variables, layout constants (sidebar 240px, header 72px) as CSS custom properties.
  - Map into `@theme inline` so Tailwind utilities (`bg-background`, `text-muted-foreground`, etc.) pick up Figma values without breaking shadcn variable names where possible (prefer extending, not renaming `--primary` blindly without a migration checklist).

### Files to optionally touch (Phase 1 only if typography decision made)

- `src/app/layout.tsx` — only if switching Geist → Inter.

### Do not touch in Phase 1

- Any file under `src/app/(app)/` except **none** (layout stays until Phase 3).
- `src/components/**`
- `src/lib/**`
- `supabase/**`
- `src/lib/navigation.ts`
- `package.json` (unless adding Inter font package — defer unless required)

### After Phase 1

- Run verification (below).
- Visual check: any existing page should still render; tokens may shift colors globally — expected.
- Stop for review before Phase 2.

---

## Verification Plan

For **every** phase:

| Step | Command / action |
|------|------------------|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Browser | Open affected route(s); desktop + narrow viewport for tables/sidebar sheet |
| Docs | Add or update phase doc + QC note |
| Gate | **Stop for review** before next phase |

### Baseline verification (audit step — no code changes)

This audit was written with no application code changes. Baseline:

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing warnings: unused `PageAlert` in `salaries/page.tsx`, `bank-account-form.tsx`) |
| `npm run build` | **Passed** (exit 0; all 28 app routes compile) |

---

## Related documentation

- `docs/2026-05-16-ui-ux-polish-pass.md` — existing shell components and polish scope
- `docs/2026-05-16-dashboard-ui-redesign-from-figma.md` — dashboard already built; Phase 4 is **alignment** to design system tokens/components, not greenfield
- `docs/2026-05-16-subscriptions-module-context-update.md` — out of scope for nav/routes
- `docs/2026-05-10-master-remaining-phases-execution-plan.md` — Phase 2 QC gate; UI design system is parallel to Supabase CRUD QC, not a substitute

---

*Planning document only. No components or routes were created or modified for this audit.*
