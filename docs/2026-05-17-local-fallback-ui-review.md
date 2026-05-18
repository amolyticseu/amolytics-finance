# Local fallback UI review — Amolytics Finance

**Date:** 2026-05-17  
**Scope:** Frontend UI/UX only — no Supabase/backend changes.  
**Assignee for backend/Supabase:** Vasudev (deferred).

---

## How local fallback mode was run

### `.env.local` status

- **File exists:** yes (keys only verified: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Not modified, renamed, or committed** during this review.
- **No secret values** were printed or logged.

### Running without Supabase (recommended for manual review)

Choose one approach before `npm run dev`:

**Option A — rename (safest)**

```powershell
Rename-Item .env.local .env.local.backup
npm run dev
```

Restore when Vasudev resumes backend work:

```powershell
Rename-Item .env.local.backup .env.local
```

**Option B — comment out keys in `.env.local`**

```env
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Save, then `npm run dev`.

**Option C — one-off shell override (agent session only)**

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL=''
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=''
npm run dev
```

> **Note:** If `.env.local` still contains values, Next.js may load them and `hasSupabaseEnv()` stays true. For a **pure** fallback review (read-only banners, “Supabase: not configured”, built-in roster rows), use **Option A or B**.

### Agent verification session

- `npm run lint` — **passed**
- `npm run build` — **passed**
- `npm run dev` — started on **http://localhost:3000** with shell env vars cleared (Option C). Because `.env.local` was still present, the UI reported **“Supabase: connected”** while many modules served **built-in fallback data** (empty remote DB). This is a valid UI review state but not identical to Option A/B.

---

## Whether Supabase was disconnected or bypassed

| Item | Status |
|------|--------|
| Schema / seed files modified | **No** |
| Backend / server actions / data layer modified | **No** |
| Supabase project changed | **No** |
| UI reviewed with fallback **data** | **Yes** |
| Credentials removed from disk | **No** (by design) |

---

## Routes checked

All routes returned **HTTP 200** (dashboard first request timed out on cold start; retry succeeded).

### Main pages

| Route | Result |
|-------|--------|
| `/dashboard` | OK — KPIs, charts, panels, quick actions |
| `/invoices` | OK — register, lifecycle, focus panel |
| `/payments` | OK |
| `/expenses` | OK |
| `/salaries` | OK |
| `/team` | OK — empty roster when DB connected but empty |
| `/tasks` | OK |
| `/reports` | OK |
| `/settings` | OK — **Local Preview** KPI, fallback source note |

### Create / settings sub-routes

| Route | Result |
|-------|--------|
| `/invoices/new` | OK |
| `/payments/new` | OK |
| `/expenses/new` | OK |
| `/salaries/new` | OK |
| `/team/new` | OK |
| `/tasks/new` | OK |
| `/settings/clients` | OK |
| `/settings/clients/new` | OK — form renders |
| `/settings/bank-accounts` | OK |
| `/settings/bank-accounts/new` | OK |

---

## UI/UX findings

### Navigation & shell

- Sidebar / mobile sheet lists **exactly 9 routes**: Dashboard, Invoices, Payments, Team, Salaries, Expenses, Tasks, Reports, Settings.
- **No** Subscriptions, Documents, Monthly Closing page, AI, CSV export, or PDF routes.
- **Monthly Close** appears only as a **footer widget** (links to `/tasks`) — not a nav route.
- Mobile **hamburger** opens sheet with full nav + Monthly Close widget (verified at 390×844).
- Global header: search, preview date/export buttons, AF avatar — consistent AF tokens.

### Design system consistency (Phases 1–13)

- List pages use `space-y-8`, `PremiumKpiCard`, `*-panel-card`, `DataSourceNote`, AF typography/shadows.
- Dashboard matches redesigned layout (KPI row, revenue vs expenses chart, quick actions, snapshot, tables, expense breakdown).
- Registers use `overflow-x-auto` wrappers for horizontal scroll on narrow viewports.
- Status badges, focus panels, lifecycle pipelines, and progress-style widgets appear consistent across modules.
- Privacy footers on list pages (e.g. invoices, team) state presentation-only labels.

### Fallback / read-only behavior

- With **fallback data**, list pages show built-in sample rows and `DataSourceNote` → **“built-in fallback data”**.
- Settings hub KPI shows **“Local Preview”** when any section falls back.
- **Pure fallback (Option A/B):** forms should show `ReadOnlyFallbackBanner` and disabled create/save; create routes remain viewable.
- **This session:** env still “connected” so `/settings/clients/new` showed an enabled **Create client** button without the read-only banner — expected until credentials are removed from `.env.local`.

### Issues found (UI-only)

1. **React hydration warning** — `AppHeader` renders `format(new Date(), …)` on the client (`src/components/layout/app-header.tsx`), causing a dev overlay mismatch vs server HTML. Pages still render; does not block review. **Recommended fix (UI-only, safe):** use `suppressHydrationWarning` on the `<time>` element or render a static date from the server layout. Deferred unless requested.
2. **Data source messaging** — When `.env.local` is set but the database is empty, some pages show **“Supabase: connected”** with **fallback or empty** data (e.g. team roster 0 rows). Not a crash; clarify for Vasudev when wiring seed/RLS.

---

## Mobile / responsive findings

- Tested at **390×844**: header collapses to hamburger; desktop sidebar hidden; sheet navigation works.
- Tables rely on horizontal scroll containers on list pages (code review + layout confirmed).
- KPI grids and two-column analytics blocks stack on small breakpoints (existing Tailwind grids).

---

## Privacy findings

### List / overview pages (reviewed)

- **Client names:** presentation labels (e.g. Client Alpha–Delta) on invoices/settings; not raw DB names on registers.
- **Team names:** footer copy references presentation-only **Team Member 01–05**; empty DB showed no member rows in this session.
- **Bank details:** settings uses masked/generic account labels (Collection Account, etc.); no full IBAN/account numbers on overview tables.
- **Secrets / API keys / project URLs:** not shown in UI.
- **References:** payment/invoice registers use generic/mock references via presentation layers.

### Still acceptable in fallback chrome

- Sidebar footer **“BMF · €15/hr · T01–T03”** — planning context label, not a live DB field.
- **Edit forms** may show stored field values when Supabase is connected (documented in settings safety copy); use Option A/B to review read-only form UX only.

### Not in scope for this pass

- Raw values inside `src/lib/data/*` fallback builders (not rendered on list UIs when presentation helpers are used).

---

## Recommended fixes (optional, UI-only)

| Priority | Item | Owner |
|----------|------|--------|
| Low | Fix header date hydration warning | UI polish |
| Info | Use Option A/B for true “not configured” copy and read-only forms | Reviewer |
| — | Seed, RLS, CRUD, Supabase QC | **Vasudev** |

**No code changes were made** during this review per scope.

---

## Verification commands

```text
npm run lint   → pass
npm run build  → pass
npm run dev    → http://localhost:3000 (fallback data review)
```

---

## Backend / Supabase work deferred

The following remain **out of scope** until Vasudev:

- `.env.local` production/staging credentials and Supabase project setup
- Applying `supabase/schema.sql` and `supabase/seed.sql` in the hosted project
- RLS policies and write access for CRUD
- Phase 2 Task 13 Supabase CRUD functional QC (`docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud-qc.md`)
- Tasks 14–18 Supabase QC and Task 19 regression

---

## Sign-off

The app **runs locally** and the **completed UI design system (Phases 1–13)** can be reviewed safely using **built-in fallback data** after temporarily disabling Supabase env vars (Option A or B). No backend or schema changes were made in this pass.
