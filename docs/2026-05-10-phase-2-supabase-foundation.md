# Phase 2 Supabase Foundation — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Supabase packages, env template, client utilities, SQL schema + seed  
Status: Implemented (Task 1)

## What was implemented

- **npm packages:** `@supabase/supabase-js`, `@supabase/ssr` for App Router browser + server clients.
- **Environment template:** `.env.example` with public Supabase URL and anon key placeholders (no secrets).
- **Supabase utilities:**
  - `src/lib/supabase/client.ts` — `createBrowserClient` for Client Components.
  - `src/lib/supabase/server.ts` — `createServerClient` with Next.js `cookies()` for Server Components / Route Handlers / Server Actions.
  - `src/lib/supabase/types.ts` — placeholder `Database` / `Json` types; intended to be replaced by `supabase gen types` after the schema is applied.
- **Database DDL:** `supabase/schema.sql` — all tables from the Phase 2 plan with UUID PKs, `created_at` / `updated_at`, check constraints on statuses/categories, foreign keys, soft-delete columns (`deleted_at`) on financial tables where appropriate, indexes, and a commented **RLS** section (policies not enabled yet).
- **Seed data:** `supabase/seed.sql` — BMF client (Mariusz, €15/hr), five bank account rows (Wise, Revolut, HSBC Malta, ICICI, OPC placeholder), five India team members, EUR→INR rate 90, EMI expense lines (Kotak / IDFC / Axis ×2), Malta rent + utilities, workspace recovery €163.08, one task, one illustrative `monthly_snapshots` row.

**Auth:** No login UI, no protected routes, no middleware, no roles — utilities only.

**App UI:** Unchanged. No page imports Supabase yet; mock data remains.

## Files created or changed

| Path | Action |
|------|--------|
| `package.json` / `package-lock.json` | Added Supabase dependencies |
| `.env.example` | Created |
| `src/lib/supabase/client.ts` | Created |
| `src/lib/supabase/server.ts` | Created |
| `src/lib/supabase/types.ts` | Created |
| `supabase/schema.sql` | Created |
| `supabase/seed.sql` | Created |
| `docs/2026-05-10-phase-2-supabase-foundation.md` | Created |

## Environment variables

Copy `.env.example` to `.env.local` (or set in your host) and fill from the Supabase project **Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` — project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon (public) key  

`createClient()` throws a clear error if these are missing when the function is **called** (e.g. after CRUD wiring). The current UI does not call it, so `npm run build` succeeds without a local `.env`.

## Apply `schema.sql` in Supabase

1. Open the [Supabase dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.  
2. Paste the full contents of `supabase/schema.sql`.  
3. Run the script.  
4. Confirm tables appear under **Table Editor** (`clients`, `bank_accounts`, `invoices`, etc.).

If anything fails (e.g. extension or trigger syntax), note the Postgres version in the project; triggers use `EXECUTE PROCEDURE public.set_updated_at()` compatible with Supabase’s default Postgres.

## Apply `seed.sql`

1. In the same **SQL Editor**, paste `supabase/seed.sql`.  
2. Run once on an empty database **after** `schema.sql`.  
3. Re-running without clearing data will **duplicate** rows (no idempotent upserts in this seed).

To reset: drop tables or use a fresh project / branch before re-seeding.

## Intentionally not implemented yet

- Login, session UI, middleware, RLS policies  
- CRUD forms or API routes  
- Replacing mock reads on dashboard / invoices / etc.  
- Generated `Database` types from Supabase CLI  
- PDF, CSV import, automation, multi-tenant  

## Decisions reflected in SQL

- **Soft delete:** `deleted_at` on `bank_accounts`, `invoices`, `payments`, `salary_payments`, `expenses`; `clients` / `team_members` use `active` flags per plan.  
- **Money:** `numeric` columns (no integer minor units yet).  
- **Month/year:** `month` + `year` on `invoices`, `salary_payments`, `monthly_snapshots`; dates where timing matters.  
- **Payments:** Optional `invoice_id`, `salary_payment_id`, `expense_id` for manual linking.  
- **Tasks:** `related_entity_type` + `related_entity_id` without polymorphic FK.

## Next recommended task

**Phase 2 — Task 2:** Generate or hand-write accurate `Database` types, add a read-only query on one page (e.g. list clients from Supabase), then iterate with simple full-page create/edit forms.

## Verification (local)

From the repo root:

```bash
npm run lint
npm run build
```

Both should pass with the current codebase (Supabase clients are not imported from app routes yet).
