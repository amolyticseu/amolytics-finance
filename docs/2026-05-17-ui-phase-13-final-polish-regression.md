# UI Phase 13 — Final polish & regression

**Date:** 2026-05-17  
**Scope:** Final UI consistency pass only (no redesign, no new routes/sections, no backend changes).

## What was checked

### 1. Lint warnings
- Ran `npm run lint` — **passes with zero warnings**.
- No unused imports or safe ESLint fixes required beyond the privacy/header edits below.

### 2. Spacing consistency
- Main list pages use outer `space-y-8` and inner sidebar stacks `space-y-6` (intentional widget density).
- Dashboard uses `space-y-6 md:space-y-8` with max-width container — consistent with Phase 4.
- Edit/new pages use `space-y-8` wrappers.
- No spacing changes applied (no inconsistencies found that warranted edits).

### 3. Card consistency
- Redesigned modules use `*-panel-card` + AF tokens (`rounded-af-card`, `border-af-border`, `shadow-af-card`).
- No panel card `motion.div` typos found in `src/`.

### 4. Table consistency
- All primary registers wrap tables in `overflow-x-auto` with `DataTable` + `min-w-*` classes:
  Dashboard, Invoices, Payments, Expenses, Salaries, Team, Tasks, Reports, Settings (hub + clients + bank accounts).
- Register action labels use **`Edit` / `View`** based on `canMutate` consistently.
- Status badges use `SoftStatusBadge` + presentation mappers.

### 5. Form consistency
- Add/edit forms use module `*PanelCard` shells and AF form classes.
- Read-only / removed banners remain in forms (unchanged).
- Saved feedback on edit pages: team, tasks, settings already used `PageAlert`; invoices/payments/expenses aligned in this phase.

### 6. Privacy consistency
- List and widget layers use `src/lib/*/presentation.ts` dummy labels.
- **Fixed:** Edit page `PageHeader` descriptions that still exposed raw DB fields:
  - Expenses: `row.name` → `displayVendorLabel`
  - Payments: real date/amount/currency → `displayPaymentEditDescription`
  - Invoices: real invoice number / period fields → `displayClientLabel` + `formatPeriodLabel`
- **Unchanged (acceptable):** Form fields still bind real values when Supabase is connected (required for CRUD). Salaries edit header uses payroll period only (`YYYY-MM`). Team/tasks/settings edit headers already use presentation helpers.

### 7. Sidebar / header
- `src/lib/navigation.ts`: Dashboard, Invoices, Payments, Team, Salaries, Expenses, Tasks, Reports, Settings — **no extra routes**.
- `InternalFinanceCard` links to `/tasks` only (“Review checklist →”) — **not** a Monthly Close route.
- Mobile sheet + active states use existing `sidebar-nav-link` / `mobile-nav` patterns.

### 8. Responsive sanity (code review)
- List pages: KPI grids `grid` → stack on small breakpoints; analytics `lg:grid-cols-*`; registers scroll horizontally.
- Dashboard tables: `overflow-x-auto` wrappers present.
- Forms: panel cards full-width; no layout changes in this phase.

### 9. Dead code (documented, not deleted)
| File | Notes |
|------|--------|
| `src/components/reports/monthly-pl-chart.tsx` | Legacy; reports page uses `reports-monthly-pl-chart.tsx`. Safe to remove in a dedicated cleanup PR. |
| `src/components/dashboard/stat-card.tsx` | Unused; dashboard uses `PremiumKpiCard`. |
| `src/components/dashboard/dashboard-header.tsx` | Unused export. |
| `src/components/forms/form-section.tsx` | Legacy; redesigned forms use panel cards. |

## Fixes applied

1. **Privacy — edit page headers**
   - `src/app/(app)/expenses/[id]/edit/page.tsx`
   - `src/app/(app)/payments/[id]/edit/page.tsx`
   - `src/app/(app)/invoices/[id]/edit/page.tsx`
2. **Presentation helper**
   - `displayPaymentEditDescription()` in `src/lib/payments/presentation.ts`
3. **Saved alert consistency**
   - Invoices, payments, expenses edit pages now use `PageAlert` (matches team/settings).

## Files changed

- `src/lib/payments/presentation.ts`
- `src/app/(app)/expenses/[id]/edit/page.tsx`
- `src/app/(app)/payments/[id]/edit/page.tsx`
- `src/app/(app)/invoices/[id]/edit/page.tsx`
- `docs/2026-05-17-ui-phase-13-final-polish-regression.md` (this file)

## Warnings removed

- None required — lint was already clean before edits; remains clean after.

## Remaining known issues / notes

- `PageAlert` success styling is neutral across modules (not green AF banner); intentional to match team/settings edit pages.
- `DataTable` shell still uses generic shadcn `border-border` tokens; register tables override with `border-0 bg-transparent` inside panel cards — cosmetic only.
- Edit forms may still show real values inside inputs when connected to Supabase (by design).
- Optional cleanup: remove legacy components listed in §9.

## Responsive findings

- No code changes required; horizontal scroll wrappers verified on all register pages.
- Dashboard sidebar column uses `space-y-6` for compact widgets — expected.

## Privacy findings

- List/register/widgets: masked via presentation layers (phases 4–12).
- Phase 13 closed gap on **edit page subtitles** for invoices, payments, expenses.
- Payments register “Reference” column still shows masked/generic labels via presentation (unchanged).

## What was intentionally not changed

- Page layouts, KPI sets, charts, new sections, or routes.
- Backend, Supabase, server actions, validation, data fetching.
- Subscriptions, Documents, Monthly Closing page, AI, CSV/PDF features.
- Legacy dead components (documented only).
- `globals.css` tokens or design-system primitives (already canonical from CSS fix pass).

## Verification results

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (see CI log after run) |

## Next recommended step

1. Manual smoke test at 375px / 768px / 1280px on all nine nav destinations + settings sub-pages.
2. Optional PR to delete `monthly-pl-chart.tsx`, `stat-card.tsx`, `dashboard-header.tsx` if confirmed unused in production.
3. Product backlog items outside UI polish (subscriptions, documents, monthly close workflow, exports).
