# UI Phase 9 — Team

Date: 2026-05-17  
Status: Complete (team module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/team/page.tsx` | Full list-page redesign |
| `src/app/(app)/team/new/page.tsx` | Unchanged routing; inherits form styling |
| `src/app/(app)/team/[id]/edit/page.tsx` | `PageAlert`; dummy-safe header description |
| `src/lib/team/presentation.ts` | **New** — KPIs, charts, readiness, lifecycle, masking helpers |
| `src/components/team/team-panel-card.tsx` | **New** — premium section shell |
| `src/components/team/team-profile-compact.tsx` | **New** — register profile progress bar |
| `src/components/team/team-composition-chart.tsx` | **New** — role distribution donut |
| `src/components/team/profile-health-chart.tsx` | **New** — profile health donut |
| `src/components/team/team-readiness-focus.tsx` | **New** — `FocusPanel` wrapper |
| `src/components/team/team-profile-checklist.tsx` | **New** — `ProgressMetric` checklist widget |
| `src/components/team/team-payroll-readiness.tsx` | **New** — payroll readiness list widget |
| `src/components/team/team-lifecycle.tsx` | **New** — `LifecyclePipeline` section |
| `src/components/team/team-member-avatar.tsx` | **New** — initials avatar (T1–T9) |
| `src/components/team/team-member-form.tsx` | `TeamPanelCard` + AF token textarea styling |

**Not changed:** `src/lib/data/team.ts`, server actions, validation schemas, Supabase, other app routes.

## Team sections updated

1. **Page header** — Title Team; subtitle on roles, payout readiness, profile; Add team member action preserved.
2. **Data source** — `DataSourceNote` in bordered card; database/fallback + `canMutate` unchanged.
3. **KPI row (5)** — Active Members, Inactive Members, Monthly Payroll, Missing Details, Profile Completion.
4. **Team Composition** — Developers, Design, QA, Operations, Support (active roster).
5. **Profile Health** — Complete, Missing Bank Info, Missing Role, Inactive Review.
6. **Team lifecycle** — Added → Profile Complete → Payroll Ready → Active → Inactive.
7. **Team Members register** — Expanded columns; Show inactive toggle preserved; horizontal scroll on mobile.
8. **Team Readiness** — Missing bank, inactive review, pending role, salary review (visual only).
9. **Profile Completeness Overview** — Five `ProgressMetric` rows (no uploads).
10. **Payroll Readiness** — Ready, needs review, missing bank, inactive counts (widget only).

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | Status, role chips, bank info labels |
| `FocusPanel` | Team readiness widget |
| `ProgressMetric` | Profile completeness overview |
| `LifecyclePipeline` | Stage counts |
| `toneProgressFill` | Compact profile bar in table |

## Form styling changes

- `TeamPanelCard` replaces `FormSection` for member details and deactivate blocks.
- Textarea uses `--af-border`, `--af-surface`, focus ring tokens.
- Fields, server actions, Save/Deactivate behavior unchanged.
- Form inputs still bind to stored values when Supabase is connected (name, role, bank, etc.).

## Privacy / dummy display approach

- **Register member column:** `displayMemberLabel()` → Team Member 01–05; initials T1–T9.
- **Role column:** `displayRoleLabel()` → bucket + “Staff” (no raw role strings in chips).
- **Bank column:** Masked / Payroll Account / Missing — no institution or account numbers.
- **Last payout:** Presentation-only dates from `displayLastPayout()` — not payroll automation.
- **KPIs / charts:** Derived from current list counts; monthly payroll uses EUR equivalent via `salaryToEur()`.

## What was intentionally not changed

- Backend, Supabase, CRUD, validation, server actions
- `getTeamMembersForManage`, `getTeamMemberById`, fallback roster
- Tasks, Reports, Settings, Dashboard, Invoices, Payments, Expenses, Salaries pages
- No payroll automation, document uploads, new routes, or schema changes

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0; 1 pre-existing warning on unrelated `bank-account-form.tsx`) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Phase 10 — Tasks page:** Apply KPI row, premium register, focus panel, and token styling to `/tasks` without changing the data layer.
