# Phase 2 Task 4 — Shared read-only Clients & Bank Accounts

Date: 2026-05-10  
Status: Implemented

## What was implemented

- **`src/lib/data/clients.ts`** — `getActiveClients()`:
  - Active clients only, **`order("name", { ascending: true })`**.
  - **`source`:** `"database"` | `"fallback"`.
  - Fallback: **8BMF8 / BMF**, Mariusz, **€15/hr**, EUR (same intent as seed).
  - Missing env, errors, or **zero rows** → fallback + `console.warn` where appropriate.

- **`src/lib/data/bank-accounts.ts`** — `getActiveBankAccounts()`:
  - `active = true`, `deleted_at IS NULL`, sort **`institution_name`**, then **`account_name`**.
  - **`source`:** `"database"` | `"fallback"`.
  - Fallback list: Wise EUR personal, Revolut, HSBC Malta, ICICI India, Amolytics OPC placeholder (masked-only fields in schema; no full secrets in code).
  - Same fallback rules as clients.

- **`src/lib/data/settings.ts`** — **refactor:** only **`getLatestExchangeRate()`** remains. Clients and banks are **not** implemented here anymore.

- **`ExchangeRateDataSource`** — FX success now reports **`"database"`** (replacing `"supabase"`) so Settings copy matches clients / banks / team.

- **`src/lib/supabase/types.ts`** — JSDoc on **`ClientRow`**, **`BankAccountRow`**, **`ExchangeRateRow`** for `numeric` handling and display-safety.

- **`src/app/(app)/settings/page.tsx`** — Imports **`getActiveClients`** and **`getActiveBankAccounts`** from the new modules; **`getLatestExchangeRate`** from `settings.ts`. UI unchanged aside from **`database`** vs **`fallback`** labels.

- **No new routes or sidebar items.**

## Files changed / added

| Path | Action |
|------|--------|
| `src/lib/data/clients.ts` | **Added** |
| `src/lib/data/bank-accounts.ts` | **Added** |
| `src/lib/data/settings.ts` | **Slimmed** (FX only) |
| `src/lib/supabase/types.ts` | **Updated** (JSDoc) |
| `src/app/(app)/settings/page.tsx` | **Updated** (imports + labels) |
| `docs/2026-05-10-phase-2-task-4-clients-bank-accounts-readonly.md` | **Added** |

## Why extract Clients and Bank Accounts before invoices / payments

- **Reference data** is shared across many flows; central modules avoid duplicating fallback logic in Settings.
- **Lower risk** than transactional tables: no joins, no invoice state.
- Prepares **CRUD** later: one import path per entity.

## How fallback mode works

Aligned with Tasks 2–3:

1. Missing public Supabase env → fallback, no `createClient()`.
2. Query error → `console.warn` + fallback.
3. Success, **zero rows** → `console.warn` + fallback.
4. Success with data → normalized rows, **`source: "database"`**.

## Supabase tables read (via data layer)

| Module | Table |
|--------|--------|
| `clients.ts` | `clients` |
| `bank-accounts.ts` | `bank_accounts` |
| `settings.ts` | `exchange_rates` |
| `team.ts` (unchanged) | `team_members` |

## Intentionally not implemented

- CRUD, auth, middleware, extra routes.
- Invoices, payments, salaries, expenses, dashboard, reports → Supabase.

## How to verify locally

1. **No `.env.local`:** `npm run dev` → `/settings` and `/team` show fallbacks; no crashes.
2. **With env + seed:** live rows where tables are populated; labels show **database** when all sections succeed.
3. **Schema only (no seed):** fallbacks for empty `clients` / `bank_accounts` / FX as in Task 2.

**CI:**

```bash
npm run lint
npm run build
```

(Run sequentially; avoid overlapping `next build` processes.)

## Next recommended task

**Phase 2 Task 5:** Read-only **`invoices`** or **`expenses`** list using the same pattern, or add **`supabase gen types`** and widen `Database` to match `schema.sql`.
