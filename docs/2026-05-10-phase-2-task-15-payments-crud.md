# Phase 2 — Task 15: Payments CRUD

Date: 2026-05-10  
Status: Implemented

## What was implemented

Manual **create / edit / soft-delete** for **payments**, using the Task 12–14 CRUD foundation. No payment PDF, no salary CRUD, no expense CRUD.

### Routes

| Route | Purpose |
|-------|---------|
| `/payments` | Register with **Add payment**, edit/view links, optional **Show removed** |
| `/payments/new` | Create |
| `/payments/[id]/edit` | Edit / view |

### Fields

| Field | Notes |
|-------|--------|
| `payment_type` | `client_receipt`, `salary`, `expense`, `transfer`, `other` |
| `direction` | `in` / `out` |
| `amount`, `currency`, `payment_date` | Required |
| `bank_account_id` | Required select (active accounts) |
| `invoice_id` | Optional |
| `salary_payment_id` | Optional |
| `expense_id` | Optional |
| `reference`, `payer_payee_name`, `notes` | Optional text |

Invoice, salary, and expense links are **never required** — including for `client_receipt` type.

### Server actions

| Action | Path |
|--------|------|
| `savePaymentAction` | `src/lib/actions/payments.ts` |
| `softDeletePaymentAction` | Sets `deleted_at` only |

### Data layer (`src/lib/data/payments.ts`)

| Function | Role |
|----------|------|
| `getPayments({ includeDeleted? })` | List + `canMutate`; **fallback unchanged** when env missing or empty/error |
| `getPaymentById(id)` | Single row with joins |
| `getPaymentFormOptions()` | Bank accounts, invoices, salary payments, expenses for selects (DB only) |

### Components

- `src/components/payments/payment-form.tsx`
- `src/lib/validation/payment-schema.ts`
- `src/lib/forms/payment-form-defaults.ts`

### Revalidation

After mutations: `/payments` only (dashboard/report logic unchanged).

## Fallback behaviour (preserved)

| Scenario | List | CRUD |
|----------|------|------|
| No Supabase env | Mock register | Disabled |
| Env + empty/error | Mock register (existing) | Enabled when env present |
| `local-fallback-*` ids | Shown in mock list | Read-only view |

Invoice CRUD and `getInvoices()` fallback behaviour are **unchanged**.

## Intentionally not implemented

- PDF generation
- Salary or expense module CRUD
- Auto-creating payment rows from invoice save
- Dashboard/report calculation changes

## How to verify

1. Without env: `/payments` mock rows; **Add payment** hidden; edit is read-only.
2. With env: create payment without invoice link; optionally link invoice/salary/expense; soft-delete; **Show removed** toggle.
3. **CI:**

```bash
npm run lint
npm run build
```

## Next recommended task

**Phase 2 Task 16 — Team + Salaries CRUD**
