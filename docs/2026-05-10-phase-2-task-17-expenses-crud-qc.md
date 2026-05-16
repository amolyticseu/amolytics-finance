# Phase 2 Task 17 Expenses CRUD QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Expenses manual CRUD  
Status: Static checks passed — functional CRUD QC pending

## QC status summary

| Layer | Status |
|-------|--------|
| **Static QC** (lint / build / code review) | **Passed** |
| **Fallback Functional QC** (browser mode without Supabase) | **Passed** |
| **Full Functional CRUD QC** (browser + Supabase) | **Pending** |

> **Note (2026-05-17):** Antigravity verified `npm run lint`, `npm run build`, and fallback browser functional testing. Full browser/Supabase CRUD functional testing remains **Pending**. Do **not** treat Task 17 as fully passed until full Supabase functional QC is completed.

## Objective

Confirm expense create, edit, and cancel (soft-delete) work with Zod + server actions, preserve fallback reads, and do not break salaries, payments, invoices, or dashboard summaries.

## Scope

1. **Expenses** — create, edit, cancel; all listed fields; recurring/rebillable as selects
2. **List** — Add expense, Show removed, edit/view links
3. **Fallback** — mock data without env; `local-fallback-exp-*` read-only
4. **Constraints** — No CSV import; no recurring automation; other modules unchanged
5. **Docs** + **lint/build**

## Antigravity QC instructions

1. Read `docs/2026-05-10-phase-2-task-17-expenses-crud.md` and files under `src/lib/actions/expenses.ts`, `src/components/expenses/`, `src/app/(app)/expenses/`, `src/lib/data/expenses.ts`, `src/lib/validation/expense-schema.ts`.

2. Run `npm run lint` and `npm run build`.

3. Optional: create expense, edit status/amount, cancel, toggle **Show removed**; verify fallback rows are read-only.

4. Spot-check `/payments`, `/salaries`, `/invoices`, `/dashboard` still load with expected data.

5. **Output:** Pass / Fail with findings — must include evidence of functional CRUD (not lint/build only).

## Final QC Status

- **Overall:** **Pending** (full Supabase CRUD QC required)
- **Static QC:** **Passed**
- **Fallback Functional QC:** **Passed**
- **Full Functional CRUD QC:** **Pending**
