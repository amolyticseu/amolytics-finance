# Phase 2 — Task 14: Invoices CRUD

Date: 2026-05-10  
Status: Implemented

## What was implemented

Manual **create / edit / cancel (soft-delete)** for **invoices**, using the Task 12–13 CRUD foundation. No PDF generation and no payment row creation.

### Routes

| Route | Purpose |
|-------|---------|
| `/invoices` | Register with **Add invoice**, edit/view links, optional **Show cancelled** |
| `/invoices/new` | Create flow |
| `/invoices/[id]/edit` | Edit / view flow |

### Fields (form + validation)

- **client_id** — select from active `clients` (DB only when mutating)
- **invoice_number** — optional text
- **period_code** — `T01` | `T02` | `T03`
- **month** / **year**
- **hours**, **hourly_rate**, **amount**, **currency**
- **status** — `draft` | `sent` | `paid` | `overdue` | `cancelled`
- **sent_date**, **due_date**, **paid_date** — optional ISO dates
- **bank_account_id** — optional select from active `bank_accounts`
- **payment_reference**
- **workspace_recovery_amount**
- **notes**

### Server actions

| Module | Path |
|--------|------|
| Save (insert/update) | `saveInvoiceAction` in `src/lib/actions/invoices.ts` |
| Cancel | `cancelInvoiceAction` — `status: cancelled` + `deleted_at` |

### Data layer

| Function | Role |
|----------|------|
| `getInvoices({ includeCancelled? })` | List; returns `canMutate`; **unchanged fallback** when env missing or empty/error |
| `getInvoiceById(id)` | Single row + join labels for edit |
| `getInvoiceFormOptions()` | Active clients + bank accounts for selects (DB only) |

### Components & validation

- `src/components/invoices/invoice-form.tsx`
- `src/lib/validation/invoice-schema.ts`
- `src/lib/forms/invoice-form-defaults.ts`

### Revalidation

After mutations: `/invoices`, `/dashboard` (no new dashboard logic; cache refresh only).

## Fallback behaviour (preserved)

| Scenario | List (`getInvoices`) | CRUD |
|----------|----------------------|------|
| No Supabase env | Mock register | Disabled |
| Env + empty/error | Mock register (existing) | Enabled when env present |
| `local-fallback-*` ids | Shown in mock list | Read-only view |

`getInvoiceFormOptions()` returns empty selects when env is missing.

## Intentionally not implemented

- PDF generation
- Payment CRUD or auto-payment rows
- Changes to dashboard/report calculation logic (only path revalidation)
- CRUD for other modules

## How to verify

1. Without env: `/invoices` shows mock rows; **Add invoice** hidden; edit opens read-only form.
2. With env + clients seeded: create invoice, edit, cancel; cancelled hidden unless **Show cancelled**.
3. **CI:**

```bash
npm run lint
npm run build
```

## Next recommended task

**Phase 2 Task 15 — Payments CRUD**
