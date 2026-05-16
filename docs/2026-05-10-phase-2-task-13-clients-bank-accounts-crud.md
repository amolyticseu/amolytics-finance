# Phase 2 — Task 13: Clients + Bank Accounts CRUD

Date: 2026-05-10  
Status: Implemented

## What was implemented

Manual **create / edit / deactivate** flows for **clients** and **bank_accounts**, built on the Task 12 CRUD foundation (Zod, server actions, `ActionResult`, form components, `revalidateFinancePaths`).

### Clients

| Area | Path |
|------|------|
| List (active + optional inactive) | `src/app/(app)/settings/clients/page.tsx` |
| Create | `src/app/(app)/settings/clients/new/page.tsx` |
| Edit / view | `src/app/(app)/settings/clients/[id]/edit/page.tsx` |
| Form (client) | `src/components/clients/client-form.tsx` |
| Server actions | `src/lib/actions/clients.ts` |
| Zod schema | `src/lib/validation/client-schema.ts` |
| Data reads (manage) | `getClientsForManage`, `getClientById` in `src/lib/data/clients.ts` |

- Deactivate sets **`active: false`** (no hard delete).
- **`getActiveClients()`** unchanged for invoices/settings read-only consumers; still uses fallback when env missing or empty DB.

### Bank accounts

| Area | Path |
|------|------|
| List | `src/app/(app)/settings/bank-accounts/page.tsx` |
| Create | `src/app/(app)/settings/bank-accounts/new/page.tsx` |
| Edit / view | `src/app/(app)/settings/bank-accounts/[id]/edit/page.tsx` |
| Form (client) | `src/components/bank-accounts/bank-account-form.tsx` |
| Server actions | `src/lib/actions/bank-accounts.ts` |
| Zod schema | `src/lib/validation/bank-account-schema.ts` |
| Masking helper | `src/lib/bank/mask-account.ts` |
| Data reads (manage) | `getBankAccountsForManage`, `getBankAccountById` in `src/lib/data/bank-accounts.ts` |

- Deactivate sets **`active: false`** and **`deleted_at`** (soft delete per schema).
- Accounts remain **flexible table rows** (no provider enums).
- **`iban_masked`** only in UI; pasted full numbers are **auto-masked** on save via `maskSensitiveAccountIdentifier`.

### Shared

| Module | Role |
|--------|------|
| `src/lib/server/require-supabase-mutation.ts` | Blocks writes without Supabase env; detects `local-fallback-*` ids |
| `src/components/forms/action-banner.tsx` | Server action error banner |
| `src/components/forms/labeled-field.tsx` | Label + control + `FieldError` |
| Settings hub | `src/app/(app)/settings/page.tsx` — **Manage clients / Manage accounts** links, masked ID column on bank table |

### Revalidation

After mutations, paths include `/settings`, `/settings/clients`, `/settings/bank-accounts` (see `DEFAULT_FINANCE_REVALIDATE_PATHS`).

## Fallback behaviour (preserved)

| Scenario | Read (`getActive*`) | CRUD |
|----------|---------------------|------|
| No Supabase env | Fallback rows | Disabled; banner explains |
| DB error / empty (active reads) | Fallback for `getActive*` | Manage list uses DB when env present |
| `local-fallback-*` ids | Shown in lists when in fallback mode | Cannot save or deactivate |

Read-only pages (`/invoices`, `/team`, etc.) are **unchanged**.

## Validation

- **Clients:** name, code, currency required; optional email, hourly rate, billing notes.
- **Bank accounts:** account name, institution, currency; optional masked IBAN, SWIFT, address; business flag as `true`/`false` select.

## Intentionally not implemented

- CRUD for invoices, payments, salaries, expenses, tasks.
- Auth, middleware, protected routes.
- Full IBAN/account number storage.

## How to verify

1. **No `.env.local`:** `/settings` and manage pages show fallback; forms are read-only.
2. **With Supabase + seed:** create/edit/deactivate clients and bank accounts; settings tables refresh.
3. **CI:**

```bash
npm run lint
npm run build
```

## Next recommended task

**Phase 2 Task 14 — Invoices CRUD**
