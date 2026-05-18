# UI Phase 3 — Sidebar and Header

Date: 2026-05-17  
Status: Complete (shell navigation only)

## Files changed

| File | Change |
|------|--------|
| `src/components/layout/app-sidebar.tsx` | 240px surface sidebar, brand block, token borders |
| `src/components/layout/sidebar-nav-link.tsx` | Active/hover styles via shared helper |
| `src/components/layout/sidebar-brand.tsx` | **New** — logo “A”, title, Founder OS |
| `src/components/layout/shell-nav-styles.ts` | **New** — shared nav link classes |
| `src/components/layout/app-header.tsx` | 72px bar, search, preview actions, avatar |
| `src/components/layout/mobile-nav.tsx` | Sheet aligned with desktop nav + brand |
| `src/components/layout/internal-finance-card.tsx` | Monthly Close card copy + af tokens |
| `src/components/shell/page-header.tsx` | Typography tokens only (actions slot unchanged) |

**Not changed:** `src/app/(app)/layout.tsx`, `src/lib/navigation.ts`, module pages, dashboard content, backend.

## What was updated

### Sidebar (desktop, `lg+`)

- Width: `var(--af-sidebar-width)` (240px)
- Background: `bg-af-surface`, border `border-af-border`
- Brand: blue circle “A”, **Amolytics Finance**, **Founder OS**
- Nav: existing 9 routes from `appNavItems`
- **Active:** `bg-af-primary-blue`, white text, `rounded-[var(--af-radius-sidebar-active)]`, `shadow-[var(--af-shadow-nav-active)]`
- **Hover:** `bg-af-soft-blue`, primary text
- Footer: **Monthly Close** card (6/9 checks done, Review missing proofs) → link to `/tasks` only (not a new route)

### Header (global shell)

- Height: `var(--af-header-height)` (72px)
- Surface + bottom border
- Search field (placeholder only; no filter logic)
- **Last 30 days** and **Export**: `type="button"` preview controls with `title` tooltips (no backend)
- Date on large screens; dummy **AF** avatar
- Mobile: hamburger + search + avatar; actions hidden below `sm`

### Mobile sheet

- Left sheet with same brand, nav styles, and Monthly Close card
- Closes on navigation; width tied to sidebar token
- Hamburger trigger unchanged (Sheet + Button)

### PageHeader

- Title/description use Amolytics font CSS variables via `text-af-page-title`, `text-af-table-body`, and `text-af-text-*` utilities
- `actions` slot and layout unchanged for existing pages

## Navigation scope

Unchanged routes (from `src/lib/navigation.ts`):

Dashboard, Invoices, Payments, Team, Salaries, Expenses, Tasks, Reports, Settings.

No Subscriptions, Documents, Monthly Closing page, AI, CSV, or PDF routes added.

## Mobile behavior notes

- `AppSidebar` hidden below `lg`; `MobileNav` visible in header
- Sheet uses `shellNavLinkClass` for parity with desktop active/hover
- `SidebarBrand` `onNavigate` closes sheet after link click
- Search remains in header on mobile (compact); preview buttons from `sm` up

## Intentionally not changed

- Dashboard page layout and `DashboardHeader` (Phase 4)
- All module list/CRUD pages
- `StatusBadge`, design-system KPI/charts (unused in shell)
- Supabase, server actions, validation, data layer
- `(app)/layout.tsx` main padding / `max-w-6xl` wrapper

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing warnings) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 4 — Dashboard page** — adopt `PremiumKpiCard`, align panels with design system; resolve full-bleed dashboard vs shell `max-w-6xl` if needed.
