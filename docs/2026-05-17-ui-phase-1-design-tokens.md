# UI Phase 1 — Design Tokens / Global CSS

Date: 2026-05-17  
Status: Complete (tokens only)

## What was changed

Global design tokens for the Amolytics Finance design system were added to the single source of theme CSS. Existing shadcn/Tailwind variable names (`--background`, `--primary`, `--card`, etc.) now resolve through `--af-*` semantic tokens so current components keep working while later phases can adopt explicit `af` utilities.

Light mode mappings in summary:

- App background → `#F7F8FA`
- Cards/surfaces → `#FFFFFF`
- Primary actions → `#2563EB`
- Borders → `#E2E8F0`
- Muted/secondary text → `#64748B` / `#94A3B8`
- Chart series → blue, teal, amber, green, purple
- Base `--radius` → 12px (buttons/inputs); card/badge/sidebar radii stored as `--af-radius-*`

## File changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Amolytics token block, `@theme inline` extensions, updated `:root` and `.dark` |

No other files were modified.

## Tokens added / updated

### Base (`--af-*`)

- `--af-bg`, `--af-surface`, `--af-text-primary`, `--af-text-secondary`, `--af-text-muted`, `--af-border`

### Accents

- `--af-primary-blue`, `--af-secondary-teal`, `--af-success`, `--af-warning`, `--af-danger`, `--af-info`, `--af-purple`

### Soft backgrounds

- `--af-soft-blue`, `--af-soft-green`, `--af-soft-amber`, `--af-soft-red`, `--af-soft-purple`, `--af-soft-teal`, `--af-soft-gray`

### Layout

- `--af-sidebar-width` (240px), `--af-header-height` (72px)
- Page padding: desktop 32px, tablet 24px, mobile 16px
- `--af-section-gap` (24px), `--af-card-gap` (20px), `--af-card-padding` / `--af-card-padding-sm`

### Radius

- `--af-radius-card` (20px), `--af-radius-button` / `--af-radius-input` (12px), `--af-radius-badge` (999px), `--af-radius-sidebar-active` (14px)

### Shadows

- `--af-shadow-card`, `--af-shadow-card-hover`, `--af-shadow-nav-active`

### Typography (variables only; not applied to elements yet)

- `--af-font-page-title` (1.75rem), `--af-font-page-title-lg` (2rem)
- `--af-font-section-title` (1.125rem), `--af-font-kpi-value` (1.75rem)
- `--af-font-table-header` (0.75rem), `--af-font-table-body` (0.875rem), `--af-font-helper` (0.8125rem)
- Matching line-height tokens `--af-leading-*`

### Tailwind v4 (`@theme inline`)

- `--color-af-*` for palette utilities in later phases
- `--radius-af-card`, `--radius-af-badge`, `--radius-af-sidebar-active`

### shadcn aliases updated (light)

- `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--border`, `--destructive`, `--ring`, `--chart-1`…`5`, `--sidebar-*`, `--radius`

## Intentionally not changed

- All React components and pages
- `src/app/layout.tsx` (Geist unchanged)
- `postcss.config.mjs`, `components.json`
- `src/lib/**`, Supabase, server actions, CRUD, data fetching
- No `src/styles/theme.css` split (single-file approach per audit)
- No new routes or dependencies
- Hardcoded hex on dashboard panels (e.g. `#F7F8FA`) — unchanged; will converge in Phase 4

## Geist vs Inter

The Figma plan references **Inter**. This repo loads **Geist Sans** and **Geist Mono** via `next/font` in `src/app/layout.tsx`. Phase 1 keeps Geist; typography tokens are size/line-height only. Switching to Inter would be a separate decision in `layout.tsx` plus optional `--font-sans` override — not done here.

## Visual impact

Expect a **subtle** shift on pages using semantic tokens (`bg-background`, `bg-card`, `text-muted-foreground`, `bg-primary`): slightly cooler page background and blue primary instead of near-black. Components with hardcoded colors (dashboard cards, some slate classes) look the same until later phases.

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing unused-import warnings, unrelated) |
| `npm run build` | **Passed** (exit 0; all routes compile) |

## Next recommended phase

**Phase 2 — Shared design-system components**

- Extend `src/components/shell/status-badge.tsx`
- Add `focus-panel`, `progress-metric`, `lifecycle-pipeline`, shared `kpi-card` (evolve `dashboard-kpi-card.tsx`)
- Do not update route pages until components are reviewed

See `docs/2026-05-17-ui-design-system-repo-path-audit.md`.
