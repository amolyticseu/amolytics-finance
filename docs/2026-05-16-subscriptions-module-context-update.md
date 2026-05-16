# Subscription Module Context Update — Amolytics Finance

Date: 2026-05-16  
Status: Documentation update only  
Scope: Subscription management and future implementation planning

This document captures subscription management as a dedicated future module. It does **not** change application code, schema, seed data, or Phase 2 QC. **Phase 2 QC should continue** after this doc is created.

Related future work (not in scope here): Rebillable Expenses module, Documents / proof upload module, Proof completeness system, Monthly closing checklist.

---

## Current Subscription Records

Known subscriptions to track in the product:

| Name | Notes |
|------|--------|
| Figma Professional | Design tooling |
| Claude Pro | AI assistant |
| Google Workspace — amolytics.tech | Company workspace |
| Google Workspace — 8bmf8.co | Client-related; **rebillable** recovery candidate |
| Hostinger | Hosting |
| Google AI Pro | AI tooling |
| NordVPN | VPN |
| ChatGPT | AI assistant |
| Netflix | Non-business (policy TBD) |

---

## Subscription Module Requirements

The app should eventually support:

- Monthly subscriptions
- Yearly subscriptions
- Multi-year subscriptions
- Renewal reminders
- Monthly burn
- Annualized cost
- Rebillable tracking
- Inactive subscription detection

---

## Business Rules

- Subscriptions should **not** live only inside generic expenses forever.
- Subscription cost should contribute to **monthly burn**.
- Rebillable subscriptions (especially **Google Workspace — 8bmf8.co**) should link to **client recovery**.
- Subscription records should support **proof/document upload** later (see Documents module).
- Subscription **status** should support active / inactive / cancelled where appropriate.
- **Renewal dates** should support alerts (after data model is stable).

---

## Impact on Current App

### Already in Phase 2

| Area | Capability |
|------|------------|
| Expenses module | Manual CRUD, categories, `rebillable` flag |
| Dashboard | Expenses summary (read-only aggregates) |
| Reports | Monthly P&L (read-only) |
| CRUD foundation | Zod, server actions, fallback mode |

### Not yet implemented

| Gap | Notes |
|-----|--------|
| Dedicated subscriptions module | No `subscriptions` table or routes |
| Renewal reminders | Out of scope until model is stable |
| Annualized subscription cost | Not computed |
| Inactive subscription detection | Not automated |
| Rebillable subscription recovery status | Only expense-level `rebillable` boolean today |
| Subscription proof uploads | Depends on Documents module |

---

## Recommended Future Implementation

### Phase 2.1 or Phase 3 — Subscriptions module

Add:

- `subscriptions` table
- Subscriptions list page + create / edit / deactivate flows
- Renewal date tracking
- Monthly / yearly / multi-year billing cycle
- Monthly burn calculation
- Annualized cost calculation
- Rebillable flag
- Linked client
- Linked invoice / recovery status
- Proof/document attachments (later, via Documents module)

### Suggested fields

| Field | Purpose |
|-------|---------|
| `id` | Primary key |
| `name` | Display name (e.g. Figma Professional) |
| `vendor` | Vendor label |
| `category` | Grouping (design, AI, workspace, etc.) |
| `amount` | Per-cycle amount |
| `currency` | EUR / INR / other |
| `billing_cycle` | See values below |
| `renewal_date` | Next renewal |
| `start_date` | Subscription start |
| `end_date` | Optional end |
| `status` | active / inactive / cancelled / pending |
| `recurring` | Recurring vs one-off renewal pattern |
| `rebillable` | Client recovery eligible |
| `linked_client_id` | Optional client (e.g. 8bmf8) |
| `linked_expense_id` | Optional link to expense row |
| `recovery_status` | not_rebillable / pending / billed / recovered |
| `payment_account_id` | Bank account used for payment |
| `notes` | Free text |
| `created_at`, `updated_at` | Audit |
| `deleted_at` | Soft delete |

**Billing cycle values:** `monthly`, `yearly`, `multi_year`, `one_time`

**Status values:** `active`, `inactive`, `cancelled`, `pending`

**Recovery status values:** `not_rebillable`, `pending`, `billed`, `recovered`

---

## Dashboard Impact

Dashboard should eventually show:

- Subscription burn this month
- Upcoming renewals
- Inactive / cancelled subscriptions
- Rebillable subscription recovery pending
- Annualized subscription cost

---

## Reports Impact

Reports should eventually include:

- Monthly subscription cost
- Annualized subscription cost
- Subscription category breakdown
- Rebillable subscription recovery report

---

## Do Not Change Yet

- Do **not** interrupt Phase 2 QC.
- Do **not** add subscription CRUD before Phase 2 final regression passes.
- Do **not** modify expenses logic until Phase 2 is passed.
- Do **not** add renewal reminders before the subscriptions data model is stable.

---

## Final Recommendation

Finish in order:

1. Phase 2 Tasks 13–18 **Supabase CRUD functional QC** (`docs/2026-05-16-phase-2-supabase-crud-functional-qc-plan.md`)
2. Phase 2 **Task 19** final regression QC (`docs/2026-05-10-phase-2-task-19-final-regression-qc.md`)

Then plan a controlled **Phase 2.1 / Phase 3** tranche for:

- **Subscriptions module** (this document)
- **Rebillable expenses upgrade** (pending / billed / recovered — see `docs/2026-05-16-business-context-update-hsbc-documents-rebillables.md`)
- **Documents / proof upload** and **proof completeness**
- **Monthly closing checklist**

---

## Related docs

- `docs/2026-05-16-business-context-update-hsbc-documents-rebillables.md`
- `docs/2026-05-16-phase-2-supabase-crud-functional-qc-plan.md`
- `docs/2026-05-10-master-remaining-phases-execution-plan.md`
- `docs/2026-05-10-phase-2-data-model-and-crud-plan.md`
