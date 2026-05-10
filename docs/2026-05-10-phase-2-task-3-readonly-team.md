# Phase 2 Task 3 — Read-only Team + Supabase Fallback

Date: 2026-05-10  
Status: Implemented

## What was implemented

- **`TeamMemberRow` documentation** in `src/lib/supabase/types.ts` — notes that Postgres `numeric` (`base_salary`) may arrive as string or number; the data layer normalizes to `number | null`.
- **Team data layer** — `src/lib/data/team.ts` with `getActiveTeamMembers()`:
  - Returns **`{ rows, source }`** where `source` is **`"database"`** or **`"fallback"`** (wording requested for this task).
  - **Missing env** → fallback list (no `createClient()` call).
  - **Query error** → `console.warn` + fallback.
  - **Success with zero active rows** → `console.warn` + fallback.
  - **Success with rows** → active members only, **`order("name", { ascending: true })`**, normalized `base_salary`.
- **Mock fallback roster** — `mockTeamFallbackMembers` in `src/data/mock/tables.ts` (Ganpat, Kamal, Siddhatta, Vasudev, Vinod — **A–Z by name**, same five names as `supabase/seed.sql`). Legacy **`mockTeam`** kept for other mock pages / history.
- **Team page** — `src/app/(app)/team/page.tsx` is async, **`dynamic = "force-dynamic"`**, shows name, role, base salary (currency-aware formatting), currency, combined bank line, active status; muted note matches Settings wording pattern.

## Files changed / added

| Path | Action |
|------|--------|
| `src/lib/supabase/types.ts` | **Updated** (JSDoc on `TeamMemberRow`) |
| `src/data/mock/tables.ts` | **Updated** (`mockTeamFallbackMembers`) |
| `src/lib/data/team.ts` | **Added** |
| `src/app/(app)/team/page.tsx` | **Updated** |
| `docs/2026-05-10-phase-2-task-3-readonly-team.md` | **Added** |

## Why Team after Settings

- Second lowest-risk read: single table, no joins, same env + fallback pattern as Task 2.
- Validates `team_members` shape and numeric handling before transactional entities (invoices, payments).
- Product clarity: roster is visible to operators early.

## How fallback mode works

Same rules as Settings Task 2 (after zero-row patch):

1. **Missing** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` → fallback rows only.
2. **Supabase error** → `console.warn` + fallback.
3. **Success, zero active rows** → `console.warn` + fallback.
4. **Success with data** → `source: "database"`, normalized rows.

## Supabase table read

- **`team_members`** — `active = true`, ordered by **`name`** ascending.

## Intentionally not implemented

- CRUD for team members, auth, protected routes, middleware.
- Connecting invoices, payments, salaries, expenses, dashboard, or reports to Supabase.
- Removing or rewriting all Phase 1 mock tables globally.

## How to verify locally

**Without `.env.local`**

```bash
npm run dev
```

Open **`/team`** — five fallback names (Ganpat, Kamal, …), `source` shown as fallback; no crashes.

**With Supabase + seed**

1. `.env.local` with URL + anon key.
2. `schema.sql` + `seed.sql` applied.
3. **`/team`** — five rows from DB (or more if added), `source: database` when the query returns rows.

**Build CI (no env)**

```bash
npm run lint
npm run build
```

*(Note: Ensure no other `next build` or dev processes are overlapping when running the build locally. A standalone sequential run verifies perfectly.)*

## Next recommended task

**Phase 2 Task 4:** Read-only list for **`invoices`** or **`expenses`** with the same env + fallback pattern (optional `Database` type extensions), or introduce shared helper for “query or fallback” to reduce duplication.
