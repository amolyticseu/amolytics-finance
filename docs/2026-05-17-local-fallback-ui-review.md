# Local fallback UI review — Amolytics Finance

**Date:** 2026-05-20 (verification run)  
**Scope:** Frontend UI/UX and design system only — no Supabase/backend/schema/seed/CRUD/data-layer changes.  
**Backend / Supabase owner:** **Vasudev** (deferred).

---

## How local fallback mode was run

### `.env.local` status

| Check | Result |
|-------|--------|
| File exists | **Yes** |
| `NEXT_PUBLIC_SUPABASE_URL` | **Set** (value not logged) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Set** (value not logged) |
| File modified during review | **No** |

### Temporarily disable Supabase (safe — no secrets printed)

Choose **one** before `npm run dev` when you want **pure** fallback (`hasSupabaseEnv()` → false, “Supabase: not configured”, `ReadOnlyFallbackBanner` on create forms):

**Option A — rename (safest)**

```powershell
Rename-Item .env.local .env.local.backup
npm run dev
```

Restore for Vasudev:

```powershell
Rename-Item .env.local.backup .env.local
```

**Option B — comment out keys in `.env.local`**

```env
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Save, restart dev.

**Option C — shell override (session only)**

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL=''
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=''
npm run dev
```

> **Important:** Next.js still loads `.env.local` when the file exists (`Environments: .env.local` in build/dev output). Empty shell vars **do not** override non-empty `.env.local` values. For a true disconnected review, use **Option A or B**.

### Verification commands (this session)

| Command | Result |
|---------|--------|
| `npm run lint` | **Pass** (exit 0) |
| `npm run build` | **Pass** (exit 0; Turbopack; all app routes compiled) |
| `npm run dev` | **http://localhost:3000** (existing dev instance; route HTTP checks below) |

No schema, seed, server actions, or `src/lib/data/*` files were changed.

---

## Whether Supabase was disconnected

| Item | Status |
|------|--------|
| Supabase project / credentials used intentionally | **No** (review used built-in fallback **data** on list pages) |
| `.env.local` removed or edited | **No** |
| Backend / CRUD / data fetching code changed | **No** |
| Real production data shown | **No** — presentation labels and mock/fallback builders only |

**Session data mode:** With credentials still on disk, list pages served **built-in fallback rows** while `DataSourceNote` reported **“Supabase: connected”** and Settings showed **“Local Preview”** for mixed fallback sections. This is expected when env is set but the remote DB is empty or unreachable; use Option A/B to review “not configured” copy and read-only create forms.

---

## Routes checked

All routes below returned **HTTP 200** and non-trivial HTML (no blank/error shell).

### Main pages

| Route | Status | Notes |
|-------|--------|--------|
| `/dashboard` | OK | KPI row, charts, tables, quick actions, `DataSourceNote` |
| `/invoices` | OK | Register, lifecycle, focus panel; **Client Alpha** fallback labels |
| `/payments` | OK | Register + KPIs |
| `/expenses` | OK | Register + KPIs |
| `/salaries` | OK | Payroll register |
| `/team` | OK | Team roster (fallback or empty DB) |
| `/tasks` | OK | Compliance-oriented register |
| `/reports` | OK | Monthly P&L chart + breakdown |
| `/settings` | OK | Hub KPIs; **Local Preview** when sections fall back |

### Create / settings sub-routes

| Route | Status | Notes |
|-------|--------|--------|
| `/invoices/new` | OK | Create invoice form renders |
| `/payments/new` | OK | Create payment form |
| `/expenses/new` | OK | Create expense form |
| `/salaries/new` | OK | Salary payment form |
| `/team/new` | OK | Team member form |
| `/tasks/new` | OK | Task form |
| `/settings/clients` | OK | Clients list |
| `/settings/bank-accounts` | OK | Bank accounts list |

---

## UI/UX findings

### Navigation & shell

- Sidebar and mobile sheet expose **9 routes** only: Dashboard, Invoices, Payments, Team, Salaries, Expenses, Tasks, Reports, Settings (`src/lib/navigation.ts`).
- **No** Subscriptions, Documents, Monthly Closing, AI, CSV export, or PDF routes in nav.
- **Monthly Close** appears as dashboard/footer widget content (links toward tasks), not a top-level nav item.
- Global header: search (preview), date, Last 30 days / Export (preview), AF avatar — AF tokens consistent.
- Mobile: hamburger → left sheet with full nav + `InternalFinanceCard` + BMF footer label.

### Design system (Phases 1–13)

- List/overview pages: `space-y-8`, `PremiumKpiCard`, module `*-panel-card`, `DataSourceNote`, AF typography/shadows/borders.
- Dashboard: soft-gray canvas, KPI grid (`sm:grid-cols-2` / `2xl:grid-cols-3`), revenue vs expenses chart, quick actions, snapshot, tables, expense breakdown.
- Registers: `overflow-x-auto` wrappers for horizontal scroll on narrow viewports.
- Status badges, focus panels, lifecycle pipelines, and progress widgets are consistent across modules.
- Settings hub uses presentation tables for clients/bank accounts with masked/generic labels.

### Fallback / read-only UX

- List pages with fallback data show `DataSourceNote` → **“built-in fallback data”** and privacy footers (presentation-only client/team/bank copy).
- **Pure fallback (Option A/B):** create/edit routes should show `ReadOnlyFallbackBanner` and disabled save/create.
- **This session (env still set):** create routes rendered **enabled** primary actions (e.g. “Create client”, “Create invoice”) without the read-only banner — expected until env is disabled.

---

## Mobile / responsive findings

(Code review + layout patterns; manual viewport pass recommended with Option A/B.)

| Area | Finding |
|------|---------|
| Sidebar | Hidden below `lg`; `MobileNav` sheet at smaller breakpoints |
| Header | Search full-width; date/export hidden on smaller breakpoints (`hidden lg:inline`, etc.) |
| KPI grids | `sm:grid-cols-2`, `2xl:grid-cols-3` on dashboard and list pages |
| Tables | `overflow-x-auto` on register tables — horizontal scroll instead of crushing columns |
| Settings / forms | Standard single-column form stacks; no layout break observed in HTTP render |

---

## Privacy findings

| Area | Finding |
|------|---------|
| Client names on registers | Presentation labels only (**Client Alpha–Delta**), not raw DB names |
| Team names | **Team Member 01–05** in copy; register uses presentation layer |
| Bank details | Generic/masked labels (e.g. Collection Account); no full IBAN on overview tables |
| Secrets / API keys / project URL | **Not** shown in UI |
| Payment / invoice references | Generic/mock via presentation helpers |
| Sidebar footer | **“BMF · €15/hr · T01–T03”** — planning context, not live DB |
| Edit forms | May show stored field values when Supabase is connected; use Option A/B to review read-only form chrome only |

List-page footers explicitly state presentation-only labels on invoices, payments, expenses, salaries, team, tasks, reports, dashboard, and settings.

---

## Issues found

| # | Severity | Issue | Status |
|---|----------|--------|--------|
| 1 | Low | **Header date hydration** — `AppHeader` used `toISOString()` on `<time dateTime>`, causing server/client mismatch in dev | **Fixed** (UI-only): `dateTime={format(today, "yyyy-MM-dd")}` in `app-header.tsx` (and matching change in `dashboard-header.tsx`) |
| 2 | Info | **Mixed messaging** when `.env.local` is set but DB empty: “Supabase: connected” + “built-in fallback data” / **Local Preview** | Expected; use Option A/B for reviewer clarity |
| 3 | Info | **Create forms enabled** while env credentials present | Expected until Option A/B; Vasudev validates real CRUD |
| 4 | — | Seed, RLS, live CRUD, Supabase QC | **Deferred to Vasudev** |

No other blocking UI defects found in this pass. No backend or data-layer fixes applied.

---

## Backend / Supabase work deferred (Vasudev)

- Configure and validate `.env.local` against the hosted Supabase project
- Apply `supabase/schema.sql` and `supabase/seed.sql`
- RLS and mutation policies for CRUD
- Phase 2 Task 13+ Supabase functional QC (clients, bank accounts, invoices, payments, team, salaries, expenses, tasks)
- Task 19 final regression with live data

---

## Sign-off

The app **builds and runs locally** for UI/UX review of the **completed design system** using **built-in fallback data** on list and dashboard pages. Temporarily disable Supabase env vars with **Option A or B** for the strictest fallback and read-only form review. **No backend, schema, seed, or data-fetching changes** were made in this pass.
