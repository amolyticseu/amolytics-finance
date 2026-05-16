# Business Context Update — HSBC, Documents, Rebillables, Salary Proofs

Date: 2026-05-16  
Status: Documentation update only  
Scope: Business rules and future implementation notes

This document captures updated business context for Amolytics Finance. It does **not** change application code, schema, seed data, or Phase 2 implementation. **Phase 2 Task 13–19 QC must continue** after this doc is created.

---

## Key Business Updates

### 1. Client invoice payment account

- **HSBC Malta** is now the **final/default account** for client invoice payments.
- **Do not** keep changing client payment accounts ad hoc.
- **Wise** should **not** be treated as the primary invoice payment layer currently (verification incomplete).
- **HDFC direct client invoice payments** should be **avoided for now** due to extra FEMA/purpose-code paperwork.

### 2. Finance email and handler

| Role | Address / person |
|------|------------------|
| Invoice and finance communication | **accounts@amolytics.tech** |
| Finance handler | **Shweta Amol Bhandare** |
| Founder / technical communication | **amol@amolytics.tech** |
| Legacy / backup only | Old Gmail — backup and past records only |
| **Do not use** | **ops@amolytics.tech** going forward |

### 3. Document / proof tracking

Invoices should eventually support proof and document tracking. Target artifact types per invoice:

| Artifact | Description |
|----------|-------------|
| Invoice PDF | Issued invoice document |
| Payment confirmation PDF | Bank/processor proof of receipt |
| Jira / work report CSV | Delivery evidence for the billing period |
| Email proof | Screenshot or PDF of client/payment correspondence |
| README / summary notes | Short narrative or checklist for the period |

### 4. OneDrive structure

Planned storage layout (reference for future linking; not app-enforced yet):

```text
Amolytics / Finance Records / 2026 /
├── Invoices
├── Payments
├── Bank Statements
├── Team Salaries
├── Expenses
├── Google Workspace
├── Malta Compliance
├── India OPC
└── Monthly Reports
```

### 5. Known paid invoice proof

**Record (for seed/manual entry later — do not store full sensitive bank details in UI):**

| Field | Value |
|-------|--------|
| Invoice reference | **INV-8BMF8-RET-2026-04-T01** |
| Amount | **€1,200** |
| Period | **1st–10th April 2026** (T01) |
| Payer | **BMF Services Ltd** |
| Transaction ID | **178972997** |
| Status | Processed successfully |
| Proof printed | **15/05/2026 09:42** |

Use masked or reference-only fields in the app; never expose full account numbers or IBAN in lists or forms.

### 6. Google Workspace recovery update

| Period | Amount (EUR) |
|--------|----------------|
| March 2026 | €81.00 |
| April 2026 | €24.30 |
| May 2026 | €57.78 |
| **Previous running total** | **€163.08** |
| **Newer confirmed March + April subtotal** | **€105.30** (note for reconciliation) |

The app must eventually support **rebillable expenses** with explicit statuses:

- **pending** — cost incurred, not yet billed to client  
- **billed** — included on an invoice or line item  
- **recovered** — payment received / fully closed  

(Current Phase 2 expenses use `rebillable` boolean and general expense status; dedicated rebillable workflow is future work.)

### 7. Salary / payment proof records from 16 May 2026

Document for **seed or manual entry later** — not immediate app code changes:

| Payee / purpose | Amount | Method | Reference | Date | Notes |
|-----------------|--------|--------|-----------|------|--------|
| Siddhatta Hule | ₹12,000 | NEFT | IN12613637803235 | 16 May 2026 | Inactive / no longer working |
| Vinod Bilagi | ₹23,000 | NEFT | IN12613637804497 | 16 May 2026 | |
| Kajol Kamalkumar Lad | ₹30,000 | NEFT | IN12613637803554 | 16 May 2026 | |
| CreativeWebo / Sagar / Vasudev | ₹40,000 | ICICI | FEK8662519 | 16 May 2026 | Invoice **PCW105** |
| Ganpat | ₹71,273 (planned) | — | — | — | Proof **pending** |
| Monthly rent Pranjape/Palus | ₹6,300 | NEFT | IN12613637806097 | 16 May 2026 | |

### 8. Malta compliance records

The app should eventually store and attach proof for:

- **FS3**
- **MTCA** screenshots
- **SSC** records
- **Residence card** copies
- **Payroll** records
- **Accountant** notes

Align with Tasks / Compliance module and document storage in a later phase.

### 9. Banking rule update

Current banking structure (authoritative for product decisions):

| Flow | Account / channel |
|------|-------------------|
| Client invoice payments | **HSBC Malta** (default) |
| Salary | **HSBC Malta** |
| India transfers | **HSBC Malta → HDFC India** |
| Daily spending | **Revolut** |
| India operational payments | **ICICI / HDFC** |
| Wise | **Pending / verification not completed** — do not depend on it currently |

---

## Impact on Current App

### What Phase 2 already provides

The current app (through Phase 2 Task 18 implementation) includes:

| Area | Capability |
|------|------------|
| **clients** | CRUD, active/inactive |
| **bank_accounts** | CRUD, masking, flexible rows (not enums) |
| **invoices** | CRUD, T01/T02/T03, workspace recovery amount, cancel |
| **payments** | CRUD, optional links to invoice/salary/expense |
| **team_members** | CRUD, deactivate |
| **salary_payments** | CRUD, pending/partial/paid, manual totals |
| **expenses** | CRUD, `rebillable` flag, categories |
| **tasks** | CRUD, compliance categories, status actions |
| **monthly_snapshots** | Reports P&L source |
| **exchange_rates** | Settings / FX |
| **dashboard** | Real summary with fallback |
| **CRUD** | Core modules via Zod + server actions + fallback read-only mode |

### What the app does not yet fully support

| Gap | Notes |
|-----|--------|
| Documents / proof uploads | No file storage or checklist UI |
| Supabase Storage | Not integrated |
| Dedicated `documents` table | Not in schema |
| Dedicated `rebillable_expenses` table | Rebillable is a field on `expenses` only |
| Proof checklist per invoice | No PDF/Jira/email proof workflow |
| OneDrive mapping | External; no in-app path sync |
| Rebillable statuses **pending / billed / recovered** | Not modeled separately from expense status |
| Formal monthly missing-record checklist | Process-only today |

---

## Recommended App Updates After Phase 2 QC

Execute only **after** Phase 2 Tasks 13–18 module QC and **Task 19** final regression QC pass.

### Phase 2.1 — Data correction / seed update

- Update seed/default bank account priority so **HSBC Malta** is primary for invoices.
- Mark **Wise** inactive/pending or clearly secondary — not default for client receipts.
- Ensure **HDFC India** (and ICICI as needed) exist in seed for India operational flows.
- Add **finance email** and **handler** (Shweta Amol Bhandare) into settings/company details when that surface exists.
- Optionally add known paid invoice **INV-8BMF8-RET-2026-04-T01** and **16 May 2026** salary/payment rows as sample/manual entries (references only, no sensitive digits in UI).

### Phase 3 — Documents & proof tracking

- Add `documents` table (metadata + storage path).
- Add **Supabase Storage** (or agreed store) with RLS when auth is introduced.
- Link documents to invoices, payments, salary payments, expenses, and compliance tasks.
- Invoice proof checklist:
  - invoice PDF  
  - payment proof  
  - Jira/work report  
  - email proof  
  - README/notes  

### Phase 3 — Rebillable expenses upgrade

- Model rebillable costs explicitly (table or structured expense subtype).
- Track **Google Workspace recovery** (March/April/May and totals).
- Statuses: **pending**, **billed**, **recovered**.
- Link rebillable lines to **client** and **invoice** where applicable.

### Phase 3 — Compliance records upgrade

- Richer Malta/India compliance fields or task templates (FS3, MTCA, SSC, residence card, payroll, accountant notes).
- Attach proof documents to tasks and compliance categories.

---

## Do Not Change Yet

- **Do not interrupt Phase 2 QC** (Tasks 13–18 module QC, then Task 19 regression).
- **Do not modify schema** before Phase 2 final regression passes unless a **build-breaking** fix is required.
- **Do not modify seed** until Phase 2.1 is explicitly scoped and Phase 2 is signed off.
- **Do not expose** full IBAN or raw account numbers in UI (keep masking).
- **Do not add** document upload before core CRUD QC passes.
- **Do not start Phase 3** before **Phase 2 Task 19** passes.

---

## Final Recommendation

1. **Finish Antigravity QC** for Phase 2 **Tasks 13–18** (module-level).
2. **Run Task 19** final regression QC (`docs/2026-05-10-phase-2-task-19-final-regression-qc.md`).
3. After Phase 2 is marked **PASSED**, run a small **Phase 2.1** update:
   - HSBC Malta as default invoice payment bank in seed/settings  
   - Finance email **accounts@amolytics.tech** and handler **Shweta Amol Bhandare**  
   - Optional seed/manual rows for known invoice proof and 16 May 2026 payments (reference fields only)  
4. Then start **Phase 3**: document/proof tracking and rebillable expense improvements per sections above.

---

## Related docs

- `docs/2026-05-10-master-remaining-phases-execution-plan.md`
- `docs/2026-05-10-phase-2-data-model-and-crud-plan.md`
- `docs/2026-05-10-phase-2-task-19-final-regression-qc.md`
- Phase 2 Task 13–18 implementation and QC docs under `docs/2026-05-10-phase-2-task-*`
