# Phase 2 — Task 17: Expenses CRUD

Date: 2026-05-10  
Status: Implemented

## What was implemented

Manual **create / edit / cancel (soft-delete)** for **expenses**, using the Task 12–16 CRUD foundation. No CSV import and no recurring automation.

### Routes

| Route | Purpose |
|-------|---------|
| `/expenses` | List with **Add expense**, edit/view links, optional **Show removed** |
| `/expenses/new` | Create |
| `/expenses/[id]/edit` | Edit / view + cancel |

### Fields

| Field | Notes |
|-------|--------|
| `category` | `emi`, `rent`, `utilities`, `subscription`, `workspace`, `tax`, `compliance`, `other` |
| `name` | Required text |
| `amount`, `currency`, `expense_date` | Required |
| `due_date` | Optional |
| `status` | `pending`, `paid`, `overdue`, `cancelled` |
| `recurring`, `rebillable` | Form selects (`true` / `false`); stored as booleans |
| `linked_client_id` | Optional |
| `bank_account_id` | Optional |
| `payment_reference`, `notes` | Optional text |

### Server actions

| Action | Path |
|--------|------|
| `saveExpenseAction` | `src/lib/actions/expenses.ts` |
| `cancelExpenseAction` | Sets `status: cancelled` and `deleted_at` |

### Data layer (`src/lib/data/expenses.ts`)

| Function | Role |
|----------|------|
| `getExpenses({ includeRemoved? })` | List + `canMutate`; **fallback unchanged** when env missing or empty/error |
| `getExpenseById(id)` | Single row with joins |
| `getExpenseFormOptions()` | Active clients and bank accounts for selects (DB only) |

### Components

- `src/components/expenses/expense-form.tsx`
- `src/lib/validation/expense-schema.ts`
- `src/lib/forms/expense-form-defaults.ts`

### Revalidation

After mutations: `/expenses`, `/payments`, `/dashboard`.

## Fallback behaviour (preserved)

| Scenario | List | CRUD |
|----------|------|------|
| No Supabase env | Mock expense lines | Disabled |
| Env + empty/error | Mock list (existing) | Enabled when env present |
| `local-fallback-exp-*` ids | Shown in mock list | Read-only view |

Salaries, payments, invoices, and dashboard summary logic are **unchanged** (only path revalidation on expense writes).

## Intentionally not implemented

- CSV import
- Recurring expense automation or scheduled generation
- Bulk operations

## How to verify

1. Without env: `/expenses` mock rows; **Add expense** hidden; edit is read-only.
2. With env: create expense with optional client/bank links; edit; cancel; **Show removed** toggle.
3. Confirm `local-fallback-exp-*` rows cannot be saved or cancelled.
4. **CI:**

```bash
npm run lint
npm run build
```

## Next recommended task

Follow Phase 2 backlog after expenses (e.g. reports enhancements or import flows when scoped).
