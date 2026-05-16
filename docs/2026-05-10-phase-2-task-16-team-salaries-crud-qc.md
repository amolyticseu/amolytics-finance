# Phase 2 Task 16 Team + Salaries CRUD QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Team members + salary payments manual CRUD  
Status: Partial pass — fallback functional QC passed; Supabase-mode CRUD QC pending

## QC status summary

| Layer | Status |
|-------|--------|
| **Static QC** (lint / build / code review) | **Passed** |
| **Fallback functional QC** (browser, no Supabase env) | **Passed** (code-change review performed) |
| **Supabase CRUD functional QC** (create / edit / deactivate / soft-delete) | **Pending** — not tested |

> **Note (2026-05-16):** Static QC passed earlier. Fallback-mode functional QC passed on 2026-05-16 (no `.env.local`). **Do not** mark Task 16 fully passed until Supabase-mode Team + Salaries CRUD is tested.
>
> **Code-change review (2026-05-16):** During Task 16 fallback QC, Antigravity modified application files. Cursor reviewed those changes, restored an unintended navigation regression (Expenses link), and kept only safe changes (read-only Active Status on team edit form).

## Fallback functional QC (2026-05-16)

**Environment:** No Supabase env configured — fallback mode only.

| Route | Result |
|-------|--------|
| `/team` | Passed |
| `/team/new` | Passed (read-only fallback) |
| `/team/[id]/edit` | Passed (read-only fallback) |
| `/salaries` | Passed |
| `/salaries/new` | Passed (read-only fallback) |
| `/salaries/[id]/edit` | Passed (read-only fallback) |

**Checks:**

- Fallback team and salary rows visible
- CRUD safely disabled without Supabase env
- `local-fallback-*` rows read-only
- Save / deactivate / soft-delete blocked in fallback mode
- No validation wrongly triggered in read-only mode
- Invoice, payment, and expense modules unchanged (spot-check routes still load)

### Antigravity code changes — review outcome

| File | Change | Decision |
|------|--------|----------|
| `src/lib/navigation.ts` | Removed **Expenses** from `appNavItems` | **Reverted** — Expenses restored to sidebar |
| `src/components/team/team-member-form.tsx` | Read-only **Active Status** on edit (`isActive` display) | **Kept** — display-only; no duplicate active control; deactivate section unchanged |

## Objective

Confirm team and salary CRUD work with Zod + server actions, preserve fallback reads, and do not introduce expense CRUD or payroll automation.

## Scope

1. **Team** — create, edit, deactivate; masked bank account; inactive toggle on list
2. **Salaries** — create, edit, soft-delete; pending/partial/paid status; manual totals
3. **Fallback** — mock data without env; `local-fallback-*` read-only
4. **Constraints** — No expense CRUD; no automation; invoices/payments CRUD unchanged
5. **Docs** + **lint/build**

## Antigravity QC instructions

1. Read `docs/2026-05-10-phase-2-task-16-team-salaries-crud.md` and files under `src/lib/actions/team-members.ts`, `src/lib/actions/salary-payments.ts`, `src/components/team/`, `src/components/salaries/`, `src/app/(app)/team/`, `src/app/(app)/salaries/`.

2. Run `npm run lint` and `npm run build`.

3. **Fallback mode:** Visit team and salary list/new/edit without Supabase env.

4. **Supabase mode (pending):** Create member, salary with partial status, soft-delete salary, deactivate member.

5. **Output:** Pass / Fail with findings — Supabase-mode evidence required for full pass.

## Final QC Status

- **Overall:** **Partial pass** — pending Supabase-mode Team + Salaries CRUD test
- **Static QC:** **Passed**
- **Fallback functional QC:** **Passed** (with code-change review)
- **Supabase CRUD functional QC:** **Pending** / not tested
