# Phase 2 Task 13 Clients + Bank Accounts CRUD QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Clients and bank accounts manual CRUD under Settings  
Status: Pending — Supabase CRUD functional QC blocked (env not configured)

## QC status summary

| Layer | Status |
|-------|--------|
| **Static QC** (lint / build / code review) | **Passed** |
| **Fallback functional QC** (browser, no Supabase env) | **Passed** |
| **Supabase CRUD functional QC** (create / edit / deactivate) | **Blocked** — missing Supabase env credentials |

> **Note (2026-05-16):** Static QC and fallback functional QC passed. Antigravity attempted Supabase-mode QC but was **blocked** because `.env.local` does not contain valid non-empty `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Do not** mark Task 13 fully passed until Supabase-mode create/edit/deactivate is tested with credentials configured.

## Supabase CRUD functional QC attempt (2026-05-16)

**Result:** **Blocked** — not executed.

**Reason:** `.env.local` missing or empty Supabase public credentials. Configure env locally (do not commit secrets) and re-run per `docs/2026-05-16-phase-2-supabase-crud-functional-qc-plan.md`.

## Fallback functional QC (2026-05-16)

**Environment:** No Supabase env configured — fallback mode only.

| Route | Result |
|-------|--------|
| `/settings` | Passed |
| `/settings/clients` | Passed |
| `/settings/clients/new` | Passed (read-only fallback) |
| `/settings/clients/[id]/edit` | Passed (read-only fallback) |
| `/settings/bank-accounts` | Passed |
| `/settings/bank-accounts/new` | Passed (read-only fallback) |
| `/settings/bank-accounts/[id]/edit` | Passed (read-only fallback) |

**Checks:**

- CRUD safely disabled without Supabase env
- `local-fallback-*` rows read-only
- Bank account masking / security passed
- No full sensitive account details exposed in UI

## Objective

Confirm clients and bank accounts can be created, edited, and deactivated using the Task 12 foundation, without exposing full sensitive bank data, breaking fallback mode, or introducing other module CRUD.

## Scope

1. **Clients CRUD**
   - List, new, edit routes under `/settings/clients`
   - Zod validation + server actions
   - Deactivate via `active: false`

2. **Bank accounts CRUD**
   - List, new, edit routes under `/settings/bank-accounts`
   - Masked IBAN field only; `mask-account.ts` used on save
   - Deactivate via `active: false` + `deleted_at`
   - No bank provider enums

3. **Settings compatibility**
   - `/settings` still loads FX, clients, banks
   - Manage links to CRUD lists
   - Bank table shows masked ID column

4. **Fallback**
   - `getActiveClients` / `getActiveBankAccounts` behaviour unchanged
   - Writes blocked without Supabase env
   - Fallback ids not mutable

5. **Constraints**
   - No invoice/payment/salary/expense/task CRUD
   - No auth or middleware

6. **Docs**
   - `docs/2026-05-10-phase-2-task-13-clients-bank-accounts-crud.md`
   - This QC doc

7. **Technical**
   - `npm run lint` passes
   - `npm run build` passes

## Antigravity QC instructions

1. Read implementation doc and key files:
   - `src/lib/actions/clients.ts`, `src/lib/actions/bank-accounts.ts`
   - `src/lib/validation/client-schema.ts`, `src/lib/validation/bank-account-schema.ts`
   - `src/lib/bank/mask-account.ts`
   - `src/lib/data/clients.ts`, `src/lib/data/bank-accounts.ts`
   - `src/app/(app)/settings/page.tsx`
   - `src/app/(app)/settings/clients/**`, `src/app/(app)/settings/bank-accounts/**`

2. Run:
   - `npm run lint`
   - `npm run build`
   - Optional: `npm run dev` — `/settings`, create client, create bank account with masked IBAN, deactivate one of each

3. Code review:
   - No full account numbers stored from form
   - `ActionResult` remains JSON-serializable
   - No service-role keys
   - Fallback read paths unchanged for other modules

4. **Output:** Pass / Fail with findings — must include evidence of functional CRUD (not lint/build only).

## Final QC Status

- **Overall:** **Pending**
- **Static QC:** **Passed**
- **Fallback functional QC:** **Passed**
- **Supabase CRUD functional QC:** **Blocked** — missing Supabase env credentials
