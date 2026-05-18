# UI Phase 2 — Shared Design-System Components

Date: 2026-05-17  
Status: Complete (components only; no page redesign)

## What was changed

Added a new `src/components/design-system/` module with five reusable UI primitives aligned to Phase 1 tokens (`--af-*`, `rounded-af-card`, `bg-af-surface`, `shadow-[var(--af-shadow-card)]`, etc.). Existing `src/components/shell/status-badge.tsx` was **not** modified so all current list/form pages keep working.

## Components created

| Component | File | Purpose |
|-----------|------|---------|
| `PremiumKpiCard` | `premium-kpi-card.tsx` | KPI metric card with icon, label, value, optional helper and badge |
| `FocusPanel` | `focus-panel.tsx` | List of tone-colored focus rows (title, subtitle, value, icon) |
| `ProgressMetric` | `progress-metric.tsx` | Label, % bar, optional completed/total helper text |
| `LifecyclePipeline` | `lifecycle-pipeline.tsx` | Stage counts with connectors (horizontal or vertical) |
| `SoftStatusBadge` | `soft-status-badge.tsx` | Pill badge for extended status/priority/source tokens |
| Shared tones | `tone-styles.ts` | `DesignTone` maps for icons, rows, progress, pipeline |
| Barrel | `index.ts` | Re-exports for `@/components/design-system` |

## Props summary

### `PremiumKpiCard`

- `icon?`, `label`, `value`, `helper?`, `badge?`, `variant?` (`blue` \| `green` \| `amber` \| `red` \| `purple` \| `teal` \| `gray`), `className?`

### `FocusPanel`

- `title?`, `subtitle?`, `items[]` (`title`, `subtitle?`, `value?`, `tone?`, `icon?`), `className?`

### `ProgressMetric`

- `label`, `value` (0–100), `helper?`, `completed?`, `total?`, `tone?`, `className?`
- Auto tone when omitted: ≥80 green, ≥70 blue, ≥40 amber, else red

### `LifecyclePipeline`

- `stages[]` (`label`, `count`, `tone?`), `layout?` (`horizontal` \| `vertical`), `className?`

### `SoftStatusBadge`

- `status` (`SoftStatusToken`), `label?`, `className?`
- Includes invoice/payment/task/priority/source tokens; uses `role="status"` and visible text (not color-only)

## Token usage

Components use Phase 1 utilities and variables:

- Surfaces: `bg-af-surface`, `border-af-border`
- Text: `text-af-text-primary`, `text-af-text-secondary`, `text-af-text-muted`
- Soft tones: `bg-af-soft-*` via `tone-styles.ts`
- Radius: `rounded-af-card`, `rounded-[var(--af-radius-badge)]`
- Shadows: `shadow-[var(--af-shadow-card)]`, hover on KPI card
- Typography: `text-af-helper`, `text-af-section-title`, etc. (canonical theme utilities)

## Files changed

**New:**

- `src/components/design-system/tone-styles.ts`
- `src/components/design-system/premium-kpi-card.tsx`
- `src/components/design-system/focus-panel.tsx`
- `src/components/design-system/progress-metric.tsx`
- `src/components/design-system/lifecycle-pipeline.tsx`
- `src/components/design-system/soft-status-badge.tsx`
- `src/components/design-system/index.ts`
- `docs/2026-05-17-ui-phase-2-shared-design-components.md`

**Not changed:**

- `src/app/**` pages
- `src/components/shell/status-badge.tsx`
- `src/lib/**`, Supabase, actions, validation
- `src/app/globals.css` (Phase 1 tokens only)

## Intentionally not changed

- No page or layout redesign (Dashboard still uses `dashboard-kpi-card.tsx` until Phase 4)
- No demo/storybook route
- No real client/team/bank data in components
- `StatusBadge` left in place for backward compatibility

## How later phases should use these

```tsx
import {
  PremiumKpiCard,
  FocusPanel,
  ProgressMetric,
  LifecyclePipeline,
  SoftStatusBadge,
} from "@/components/design-system"
```

- **Phase 3 (sidebar/header):** optional `SoftStatusBadge` for source chips; layout tokens `--af-sidebar-width`, `--af-header-height`
- **Phase 4 (dashboard):** replace or wrap `DashboardKpiCard` with `PremiumKpiCard`; add `FocusPanel` / `ProgressMetric` for monthly-close widgets
- **Phases 5–12 (modules):** KPI row + focus panels + pipelines per Figma; keep `StatusBadge` on tables until migrated row-by-row to `SoftStatusBadge`

Migrate gradually: import design-system components in one section per page, run lint/build, browser-check, then continue.

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 2 pre-existing unused-import warnings) |
| `npm run build` | **Passed** (exit 0; all routes compile) |

## Next recommended phase

**Phase 3 — Sidebar and header** (`app-sidebar.tsx`, `app-header.tsx`, `mobile-nav.tsx`) using `--af-*` tokens and nav active shadow `--af-shadow-nav-active`.
