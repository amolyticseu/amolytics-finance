# Phase 2 Task 14 Invoices CRUD QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Manual invoice create / edit / cancel  
Status: Partial pass — fallback functional QC passed; Supabase-mode CRUD QC pending

## QC status summary

| Layer | Status |
|-------|--------|
| **Static QC** (lint / build / code review) | **Passed** |
| **Fallback functional QC** (browser, no Supabase env) | **Passed** |
| **Supabase CRUD functional QC** (create / edit / cancel) | **Pending** — not tested |

> **Note (2026-05-16):** Static QC passed earlier. Fallback-mode functional QC passed on 2026-05-16 (no `.env.local`). **Do not** mark Task 14 fully passed until Supabase-mode invoice create/edit/cancel is tested.

## Fallback functional QC (2026-05-16)

**Environment:** No Supabase env configured — fallback mode only.

| Route | Result |
|-------|--------|
| `/invoices` | Passed |
| `/invoices/new` | Passed (read-only fallback) |
| `/invoices/[id]/edit` | Passed (read-only fallback) |

**Checks:**

- Invoice list renders fallback rows
- **Add invoice** hidden or CRUD safely disabled without Supabase env
- `local-fallback-*` invoice rows read-only on edit
- No PDF generation UI present
- No payment row auto-created from invoice flows
- Cancel / save actions blocked or read-only in fallback mode

## Objective

Confirm invoice CRUD works with Zod + server actions, uses clients and bank accounts from the database when configured, preserves fallback reads, and does not add PDF or payment CRUD.

## Scope

1. **Routes**
   - `/invoices`, `/invoices/new`, `/invoices/[id]/edit`

2. **Fields**
   - Client, period T01–T03, month/year, hours, rate, amount, currency, status, dates, bank account, payment reference, workspace recovery, notes

3. **Cancel**
   - Soft-delete (`deleted_at`) + `status: cancelled`
   - Optional list toggle for cancelled rows

4. **Fallback**
   - `getInvoices` still serves mock data without env
   - Writes blocked without Supabase
   - Fallback invoice ids not mutable

5. **Constraints**
   - No PDF
   - No payment CRUD in this task
   - Dashboard/report logic unchanged (revalidate only)

6. **Docs**
   - Implementation + QC docs exist

7. **Technical**
   - `npm run lint` passes
   - `npm run build` passes

## Antigravity QC instructions

1. Read `docs/2026-05-10-phase-2-task-14-invoices-crud.md` and key files under `src/lib/actions/invoices.ts`, `src/lib/validation/invoice-schema.ts`, `src/lib/data/invoices.ts`, `src/components/invoices/`, `src/app/(app)/invoices/`.

2. Run `npm run lint` and `npm run build`.

3. **Fallback mode:** Visit list, new, and edit routes without Supabase env; confirm read-only fallback and blocked writes.

4. **Supabase mode (pending):** Create invoice with T02, link bank account, cancel, verify hidden from default list with **Show cancelled** toggle.

5. **Output:** Pass / Fail with findings — Supabase-mode evidence required for full pass.

## Final QC Status

- **Overall:** **Partial pass** — pending Supabase-mode invoice create/edit/cancel test
- **Static QC:** **Passed**
- **Fallback functional QC:** **Passed**
- **Supabase CRUD functional QC:** **Pending** / not tested
