# Phase 2 Task 2 — Read-only Settings + Supabase Fallback

Date: 2026-05-10  
Status: Implemented

## What was implemented

- **Safe env handling** (`src/lib/supabase/env.ts`): `hasSupabaseEnv()` (no throw) and `getSupabaseEnv()` (throws only when creating a client).
- **Supabase clients** updated to use `getSupabaseEnv()` and the `Database` generic — no work at import time beyond loading modules.
- **Partial `Database` types** in `src/lib/supabase/types.ts` for `clients`, `bank_accounts`, `exchange_rates`, and `team_members` (team ready for later tasks).
- **Read-only data layer** (`src/lib/data/settings.ts`):
  - `getLatestExchangeRate()` — latest EUR→INR from `exchange_rates` when a row exists; else mock `INR_PER_EUR` (including **zero rows** after a successful query).
  - `getActiveBankAccounts()` — active, non-deleted `bank_accounts` when rows exist; else the same fixed fallback list aligned with seed intent (including **zero rows**).
  - `getActiveClientDefaults()` — active `clients` ordered by `code` when rows exist; otherwise the same single fallback row (8BMF8 / BMF, Mariusz, €15/hr), including when the query returns **zero rows**.
  - On missing env, **successful queries that return zero rows**, empty FX row, or query errors: **console.warn** (where applicable) + fallback data; **no user-facing throws**.
- **Settings page only** (`src/app/(app)/settings/page.tsx`): shows FX, clients table, bank table, keeps mock “planning references” (Malta / EMI totals) for pages not wired yet; `dynamic = "force-dynamic"` so reads stay request-time oriented; muted copy explains DB vs mock mode.

## Files changed / added

| Path | Action |
|------|--------|
| `src/lib/supabase/env.ts` | **Added** |
| `src/lib/supabase/types.ts` | **Updated** (real table shapes) |
| `src/lib/supabase/client.ts` | **Updated** |
| `src/lib/supabase/server.ts` | **Updated** |
| `src/lib/data/settings.ts` | **Added** |
| `src/app/(app)/settings/page.tsx` | **Updated** |
| `docs/2026-05-10-phase-2-task-2-readonly-settings.md` | **Added** |

## Why Settings first

- Low risk: one surface, read-only, easy to verify with and without `.env.local`.
- Surfaces the three foundational entities (FX, client defaults, bank rails) before invoices/payments.
- Matches “manual entry first”: operators can confirm DB/seed alignment in one place.

## How fallback mode works

Fallback defaults are used whenever Settings would otherwise show an empty or unusable result — including a **new Supabase project with schema applied but `seed.sql` not run yet**.

1. **Missing env vars** — If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing/blank → **never** calls `createClient()`; all three functions return **fallback** rows from mock constants / inline lists.
2. **Supabase query errors** — If env is set but a query fails (network, RLS, typo, etc.) → `console.warn` + fallback rows.
3. **Successful query, zero rows** — If the query succeeds but returns no rows (no EUR/INR rate, no active banks, no active clients) → `console.warn` + fallback rows. The UI `source` is **`fallback`** so the Settings banner reflects mock-mode data for that section.
4. **Successful query with data** — Normalized rows from Postgres (`numeric` coerced where needed), `source` is **`supabase`**.

Other pages still use mock data only; they do not import this data layer.

## Supabase tables read

- `exchange_rates` (filter `base_currency = EUR`, `target_currency = INR`, latest `rate_date`)
- `bank_accounts` ( `active = true`, `deleted_at IS NULL`, ordered by institution)
- `clients` (`active = true`, ordered by `code`)

## Intentionally not implemented

- CRUD forms, mutations, login, middleware, protected routes.
- Wiring dashboard, invoices, payments, salaries, expenses, reports, team page to Supabase.
- Full generated types for all tables.
- RLS policies (still future work per foundation doc).

## How to verify locally

**Without Supabase (no `.env.local`):**

```bash
npm run dev
```

Open `/settings` — should show fallback FX, one client, five banks; banner indicates env not set; no runtime errors.

**With Supabase:**

1. Copy `.env.example` → `.env.local` and set URL + anon key.
2. Apply `supabase/schema.sql` in the SQL editor. If **`seed.sql` is not applied**, `/settings` should still show **fallback** FX, client, and banks (with `console.warn` on zero-row reads).
3. After applying `supabase/seed.sql`, `npm run dev` → `/settings` should show **live** rows when queries return data (`source: supabase` in the data layer).

**CI / build without env:**

```bash
npm run lint
npm run build
```

Both should pass; no page calls `createClient()` unless env is complete (Settings only calls it inside `hasSupabaseEnv()` guard).

## Next recommended task

**Phase 2 Task 3:** Read-only list for one transactional entity (e.g. `invoices` or `expenses`) with the same env + fallback pattern, or start generated types + tighten `Database` to match `schema.sql` fully.
