# UI/UX polish pass — 2026-05-16

Pre–Supabase CRUD QC polish across Amolytics Finance. Scope: navigation, headers, tables, forms, fallback messaging, finance copy, responsive patterns, and shared shell components. **No schema, seed, or business-logic changes.**

## What was reviewed

- Execution context: `docs/2026-05-10-master-remaining-phases-execution-plan.md`, `docs/2026-05-10-phase-2-task-19-final-regression-qc.md`
- Business copy: `docs/2026-05-16-business-context-update-hsbc-documents-rebillables.md`, `docs/2026-05-16-subscriptions-module-context-update.md`
- App shell: `src/lib/navigation.ts`, `src/components/layout/mobile-nav.tsx`, sidebar/mobile nav
- All main list pages under `src/app/(app)/`: dashboard, invoices, payments, team, salaries, expenses, tasks, reports, settings (+ clients, bank accounts)
- CRUD routes: `*/new`, `*/[id]/edit` for clients, bank accounts, invoices, payments, team, salaries, expenses, tasks
- Shared UI: `PageHeader`, `SectionCard`, `DataTable`, `StatusBadge`, form sections/actions
- Fallback vs database source notes and read-only form behaviour

## UI/UX issues found

| Area | Issue |
|------|--------|
| Navigation | Expenses had been removed from sidebar during an earlier QC edit; needed restore between Salaries and Tasks |
| Source notes | Inconsistent ad-hoc “Supabase env / Source” paragraphs across pages |
| Fallback forms | Per-entity fallback banners with slightly different wording |
| List tables | Missing empty states on several modules; duplicate inline row hover classes instead of shared token |
| Tasks list | No **View** action in fallback mode (actions column hidden when `!canMutate`) |
| Page titles | Several `new` routes still titled “New …” instead of “Add …” |
| Finance copy | Payments/settings could imply Wise as primary; HSBC Malta should lead for client invoice receipts |
| Dashboard / Reports | Custom source paragraphs not aligned with list pages |

## Fixes applied

### Shared components (new)

- `src/components/shell/data-source-note.tsx` — unified database/fallback + CRUD hint
- `src/components/shell/page-alert.tsx` — flash and status banners
- `src/components/shell/empty-table-state.tsx` — empty list messaging
- `src/components/forms/read-only-fallback-banner.tsx` — form-level fallback (Supabase not configured, read-only)
- `src/components/forms/back-link.tsx` — consistent back navigation (available; existing inline links retained where already present)
- `src/components/forms/form-controls.ts` — shared select/textarea classes

### Shared components (updated)

- `src/components/shell/data-table.tsx` — exported `dataTableRowClassName` for consistent row hover

### Navigation

- `src/lib/navigation.ts` — **Expenses** restored with `Receipt` icon; full set: Dashboard, Invoices, Payments, Team, Salaries, Expenses, Tasks, Reports, Settings (no Subscriptions/Documents)
- `src/components/layout/mobile-nav.tsx` — column layout + footer context line

### List pages

- Applied `DataSourceNote`, `PageAlert` (where applicable), `EmptyTableState`, and `dataTableRowClassName` on: invoices, payments, team, salaries, expenses, tasks; dashboard and reports for source notes
- Settings clients/bank accounts: `DataSourceNote`; bank accounts header mentions HSBC primary / Wise not default
- Payments page description: HSBC first for client invoice receipts
- Tasks: always show **Actions** column with **View** in fallback, **Edit** when Supabase CRUD enabled

### CRUD page titles

- All `new` routes: **Add client**, **Add invoice**, **Add payment**, **Add team member**, **Add salary payment**, **Add expense**, **Add task**, **Add bank account**
- Edit routes already use **Edit …** / **View …** when `!canMutate`

### Forms

- All entity forms use `ReadOnlyFallbackBanner` + `PageAlert` for removed/cancelled/deleted states: invoices, payments, expenses, tasks, team, salaries, clients, bank accounts

### Settings / finance copy

- `src/app/(app)/settings/page.tsx` — bank card copy: HSBC Malta preferred for client invoice payments; Wise not primary (unchanged intent, aligned with business doc)
- Bank accounts manage page description aligned with HSBC primary messaging

## Files changed (summary)

**New:** `data-source-note.tsx`, `page-alert.tsx`, `empty-table-state.tsx`, `read-only-fallback-banner.tsx`, `back-link.tsx`, `form-controls.ts`

**App pages:** `dashboard`, `reports`, `invoices`, `payments`, `team`, `salaries`, `expenses`, `tasks`, `settings`, `settings/clients`, `settings/bank-accounts`, and all matching `new` / `edit` routes under those modules

**Components:** `data-table.tsx`, `mobile-nav.tsx`, all `*-form.tsx` under invoices, payments, expenses, tasks, team, salaries, clients, bank-accounts

**Lib:** `navigation.ts`

**Docs:** this file

## Intentionally not changed

- `supabase/schema.sql`, `supabase/seed.sql`
- Server actions, validation schemas, data-layer query logic (except UI-facing labels/copy on pages)
- Fallback data modules under `src/data/mock` and `src/lib/data/*` selection logic
- Subscriptions / Documents modules (not implemented; not added to nav)
- Replacing every inline “← Back to …” link with `BackLink` (component added; migration optional)
- Full `form-controls.ts` adoption across every `<select>` (class export ready for follow-up)
- Supabase functional QC status on Phase 2 task docs

## Remaining UI/UX suggestions (Phase 3)

- Adopt `BackLink` on all new/edit pages for one import path
- Centralise “saved / deactivated / cancelled” flash handling via search params + `PageAlert` on every edit route
- Settings hub: optional top-level `DataSourceNote` when any section is in fallback
- Table column priority pass on wide tables (payments, expenses) for mobile-first column hiding
- Invoice form: default bank account selector hint when HSBC is active in DB
- Subscriptions/Documents when scoped: new nav items + empty states following this pass’s patterns
- Light/dark contrast audit on `PageAlert` and amber warning banners

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0) |
| `npm run build` | **Passed** (exit 0; all CRUD routes listed in build output) |

---

*Polish pass complete. Resume Supabase-mode CRUD QC per `docs/2026-05-16-phase-2-supabase-crud-functional-qc-plan.md` when ready.*
