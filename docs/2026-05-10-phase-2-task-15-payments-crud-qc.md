# Phase 2 Task 15 Payments CRUD QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Manual payment create / edit / soft-delete  
Status: Partial pass — fallback functional QC passed; Supabase-mode CRUD QC pending

## QC status summary

| Layer | Status |
|-------|--------|
| **Static QC** (lint / build / code review) | **Passed** |
| **Fallback functional QC** (browser, no Supabase env) | **Passed** |
| **Supabase CRUD functional QC** (create / edit / soft-delete) | **Pending** — not tested |

> **Note (2026-05-16):** Static QC passed earlier. Fallback-mode functional QC passed on 2026-05-16 (no `.env.local`). **Do not** mark Task 15 fully passed until Supabase-mode payment create/edit/soft-delete is tested.

## Fallback functional QC (2026-05-16)

**Environment:** No Supabase env configured — fallback mode only.

| Route | Result |
|-------|--------|
| `/payments` | Passed |
| `/payments/new` | Passed (read-only fallback) |
| `/payments/[id]/edit` | Passed (read-only fallback) |

**Checks:**

- Fallback payment rows visible on list
- CRUD safely disabled without Supabase env
- `local-fallback-*` rows read-only on edit
- Optional invoice, salary, and expense links not forced in UI
- No invoice, salary, or expense CRUD accidentally changed
- `npm run lint` passed
- `npm run build` passed

## Objective

Confirm payments CRUD works with optional invoice/salary/expense links, preserves fallback reads, and does not add salary/expense CRUD or break invoice CRUD.

## Scope

1. **Routes** — `/payments`, `/payments/new`, `/payments/[id]/edit`

2. **Fields** — type, direction, amount, currency, date, bank account, optional links, reference, payer/payee, notes

3. **Soft-delete** — `deleted_at`; optional **Show removed** on list

4. **Optional links** — Payment can be saved with all link fields empty

5. **Fallback** — `getPayments` mock when env missing; `local-fallback-*` read-only

6. **Constraints** — No salary/expense CRUD; no invoice CRUD changes; no dashboard/report logic changes

7. **Docs** — Implementation + QC docs

8. **Technical** — `npm run lint` and `npm run build` pass

## Antigravity QC instructions

1. Read `docs/2026-05-10-phase-2-task-15-payments-crud.md` and key files under `src/lib/actions/payments.ts`, `src/lib/validation/payment-schema.ts`, `src/lib/data/payments.ts`, `src/components/payments/`, `src/app/(app)/payments/`.

2. Run `npm run lint` and `npm run build`.

3. **Fallback mode:** Visit list, new, and edit routes without Supabase env; confirm read-only fallback and blocked writes.

4. **Supabase mode (pending):** Create payment without invoice link; edit with optional salary/expense link; soft-delete; confirm **Show removed** toggle.

5. **Output:** Pass / Fail with findings — Supabase-mode evidence required for full pass.

## Final QC Status

- **Overall:** **Partial pass** — pending Supabase-mode payment create/edit/soft-delete test
- **Static QC:** **Passed**
- **Fallback functional QC:** **Passed**
- **Supabase CRUD functional QC:** **Pending** / not tested
