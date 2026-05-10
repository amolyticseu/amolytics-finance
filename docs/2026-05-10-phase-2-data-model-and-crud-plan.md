# Phase 2 Data Model and Manual CRUD Plan — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Supabase data model and manual CRUD foundation  
Status: Planning

## Objective

Define the Phase 2 implementation scope before coding.

Phase 2 should move the app from mock-only UI to a real Supabase-backed finance control system with manual data entry first.

## Phase 2 Scope

Include these areas:

1. Supabase setup
   - Add Supabase client/server utilities
   - Restore required environment variable documentation
   - Prepare database schema
   - Keep auth simple for now

2. Database tables
   - clients
   - bank_accounts
   - invoices
   - payments
   - team_members
   - salary_payments
   - expenses
   - tasks
   - monthly_snapshots
   - exchange_rates

3. Manual CRUD flows
   - Create, read, update, delete clients
   - Create, read, update, delete bank accounts
   - Create, read, update, delete invoices
   - Create, read, update, delete payments
   - Create, read, update, delete team members
   - Create, read, update, delete salary payments
   - Create, read, update, delete expenses
   - Create, read, update, delete compliance/tasks

4. Dashboard data
   - Replace mock dashboard figures with database-driven summaries
   - Revenue this month
   - Expenses this month
   - Profit/loss estimate
   - Pending invoices
   - Pending salaries
   - Upcoming tasks

5. Reports
   - Monthly P&L from real records
   - Keep Recharts chart
   - Use exchange rate default ₹90/EUR until exchange_rates table is wired

## Database Design Principles

Document these rules:

- Do not hardcode bank accounts as enums.
- Use bank_accounts table for Wise, Revolut, HSBC, ICICI, OPC account, and future accounts.
- Keep personal and company transition clear.
- Every payment should optionally link to invoice, salary, or expense where applicable.
- Every money movement should support proof/reference tracking.
- Manual entry first, automation later.
- Avoid over-engineering.

## Proposed Table Fields

For each table, define suggested fields.

### clients

Suggested fields:

- id
- name
- code
- contact_name
- email
- hourly_rate
- currency
- billing_cycle_notes
- active
- created_at
- updated_at

### bank_accounts

Suggested fields:

- id
- account_name
- account_holder_name
- institution_name
- account_type
- currency
- country
- iban_masked
- swift_bic
- bank_address
- is_business_account
- active
- notes
- created_at
- updated_at

### invoices

Suggested fields:

- id
- client_id
- invoice_number
- period_code
- month
- year
- hours
- hourly_rate
- currency
- amount
- status
- sent_date
- due_date
- paid_date
- bank_account_id
- payment_reference
- workspace_recovery_amount
- notes
- created_at
- updated_at

Status values:

- draft
- sent
- paid
- overdue
- cancelled

### payments

Suggested fields:

- id
- payment_type
- direction
- invoice_id
- bank_account_id
- amount
- currency
- payment_date
- reference
- payer_payee_name
- notes
- created_at
- updated_at

### team_members

Suggested fields:

- id
- name
- role
- base_salary
- currency
- bank_name
- bank_account_masked
- active
- notes
- created_at
- updated_at

### salary_payments

Suggested fields:

- id
- team_member_id
- month
- year
- base_amount
- reimbursement
- deduction
- total_amount
- currency
- status
- payment_date
- bank_account_id
- transaction_reference
- notes
- created_at
- updated_at

Status values:

- pending
- partial
- paid

### expenses

Suggested fields:

- id
- category
- name
- amount
- currency
- expense_date
- due_date
- status
- recurring
- rebillable
- linked_client_id
- bank_account_id
- payment_reference
- notes
- created_at
- updated_at

Categories:

- emi
- rent
- utilities
- subscription
- workspace
- tax
- compliance
- other

Status values:

- pending
- paid
- overdue
- cancelled

### tasks

Suggested fields:

- id
- title
- description
- category
- status
- priority
- due_date
- completed_at
- related_entity_type
- related_entity_id
- notes
- created_at
- updated_at

Categories:

- invoice
- payment
- salary
- compliance
- tax
- company
- bank
- other

Status values:

- todo
- in_progress
- done
- blocked

Priority values:

- low
- medium
- high
- urgent

### monthly_snapshots

Suggested fields:

- id
- month
- year
- revenue_eur
- revenue_inr
- expenses_eur
- expenses_inr
- salary_total_inr
- emi_total_inr
- profit_loss_eur
- profit_loss_inr
- notes
- created_at
- updated_at

### exchange_rates

Suggested fields:

- id
- base_currency
- target_currency
- rate
- rate_date
- source
- notes
- created_at

## Implementation Sequence

Break Phase 2 into small Cursor tasks:

1. Install Supabase packages and recreate env example
2. Add Supabase client utilities
3. Create SQL migration/schema file
4. Add TypeScript database types
5. Replace mock reads page by page
6. Add simple forms for create/edit
7. Add delete/soft-delete where appropriate
8. Add dashboard summary queries
9. Add reports summary queries
10. Prepare Antigravity QC doc for Phase 2

## Not In Scope Yet

Document that these are not Phase 2:

- PDF invoice generation
- Bank CSV import
- AI monthly summary
- Anomaly detection
- Automated exchange rate fetching
- Full auth/roles/permissions
- SaaS multi-tenant architecture

## Open Questions

Add these questions:

1. Should Phase 2 use Supabase Auth immediately or keep a local development bypass first?
2. Should delete be hard delete or soft delete for finance records?
3. Should invoice/payment/salary/expense forms use modals or full pages?
4. Should amounts be stored as decimals or integer minor units?
5. Should month/year be stored as separate fields or a single date field?

## Final Recommendation

Recommend building Phase 2 in small slices, starting with database schema and read-only Supabase connection before CRUD forms.
