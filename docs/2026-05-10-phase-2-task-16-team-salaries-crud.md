# Phase 2 — Task 16: Team + Salaries CRUD

Date: 2026-05-10  
Status: Implemented

## What was implemented

Manual **create / edit / deactivate** for **team_members** and **create / edit / soft-delete** for **salary_payments**. No payroll automation and no expense CRUD.

### Team routes

| Route | Purpose |
|-------|---------|
| `/team` | Roster with **Add member**, edit/view, **Show inactive** |
| `/team/new` | Create |
| `/team/[id]/edit` | Edit / view + deactivate |

**Team fields:** name, role, base_salary, currency, bank_name, bank_account_masked (masked on save), notes. **Active** is set true on save; **deactivate** sets `active: false`.

### Salary routes

| Route | Purpose |
|-------|---------|
| `/salaries` | Payroll list with **Add salary payment**, edit/view, **Show removed** |
| `/salaries/new` | Create |
| `/salaries/[id]/edit` | Edit / view + soft-delete |

**Salary fields:** team_member_id, month, year, base_amount, reimbursement, deduction, total_amount (manual — not auto-calculated), currency, status (`pending` | `partial` | `paid`), payment_date, bank_account_id (optional), transaction_reference, notes.

### Server actions

| Module | Actions |
|--------|---------|
| `src/lib/actions/team-members.ts` | `saveTeamMemberAction`, `deactivateTeamMemberAction` |
| `src/lib/actions/salary-payments.ts` | `saveSalaryPaymentAction`, `softDeleteSalaryPaymentAction` |

### Data layer

| Module | New helpers |
|--------|-------------|
| `src/lib/data/team.ts` | `getTeamMembersForManage`, `getTeamMemberById`; **`getActiveTeamMembers` unchanged** |
| `src/lib/data/salaries.ts` | `getSalaryFormOptions`, `getSalaryPaymentById`, extended `getSalaryPayments` with `canMutate` |

### Components

- `src/components/team/team-member-form.tsx`
- `src/components/salaries/salary-payment-form.tsx`
- `src/lib/validation/team-member-schema.ts`
- `src/lib/validation/salary-payment-schema.ts`
- Form defaults under `src/lib/forms/`

### Revalidation

Team saves: `/team`, `/salaries`, `/payments`.  
Salary saves: `/salaries`, `/payments`, `/dashboard`.

## Fallback behaviour (preserved)

| Scenario | Reads | CRUD |
|----------|-------|------|
| No Supabase env | Fallback roster / payroll lines | Disabled |
| `local-fallback-team-*`, `local-fallback-sal-*` | Shown in lists | Read-only |

Invoice and payment CRUD are **unchanged**.

## Intentionally not implemented

- Expense CRUD
- Payroll automation or auto total from base/reimbursement/deduction
- Bulk import or scheduled runs

## How to verify

1. Without env: `/team` and `/salaries` show mock data; forms read-only.
2. With env: add member, add salary line with pending/partial/paid, soft-delete salary, deactivate member.
3. **CI:**

```bash
npm run lint
npm run build
```

## Next recommended task

**Phase 2 Task 17 — Expenses CRUD**
