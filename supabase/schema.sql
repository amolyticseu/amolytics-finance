-- Amolytics Finance — core schema (Phase 2)
-- Apply manually in Supabase SQL Editor or via CLI migrations later.
-- UUIDs, timestamps, soft-delete on sensitive money tables, no bank account enums.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  contact_name text,
  email text,
  hourly_rate numeric(12,4),
  currency text NOT NULL DEFAULT 'EUR',
  billing_cycle_notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- bank_accounts (flexible; no enum of providers)
-- ---------------------------------------------------------------------------
CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name text NOT NULL,
  account_holder_name text,
  institution_name text NOT NULL,
  account_type text,
  currency text NOT NULL,
  country text,
  iban_masked text,
  swift_bic text,
  bank_address text,
  is_business_account boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bank_accounts_currency_nonempty CHECK (length(trim(currency)) > 0)
);

CREATE TRIGGER bank_accounts_set_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX bank_accounts_active_idx ON public.bank_accounts (active) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  base_salary numeric(14,2),
  currency text NOT NULL DEFAULT 'INR',
  bank_name text,
  bank_account_masked text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER team_members_set_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  invoice_number text,
  period_code text,
  month smallint CHECK (month IS NULL OR (month >= 1 AND month <= 12)),
  year integer CHECK (year IS NULL OR (year >= 2000 AND year <= 2100)),
  hours numeric(12,2),
  hourly_rate numeric(12,4),
  currency text NOT NULL DEFAULT 'EUR',
  amount numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  sent_date date,
  due_date date,
  paid_date date,
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  payment_reference text,
  workspace_recovery_amount numeric(14,2),
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  CONSTRAINT invoices_period_code_check CHECK (
    period_code IS NULL OR period_code IN ('T01', 'T02', 'T03')
  )
);

CREATE TRIGGER invoices_set_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX invoices_client_id_idx ON public.invoices (client_id) WHERE deleted_at IS NULL;
CREATE INDEX invoices_status_idx ON public.invoices (status) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------------
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL,
  expense_date date NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  recurring boolean NOT NULL DEFAULT false,
  rebillable boolean NOT NULL DEFAULT false,
  linked_client_id uuid REFERENCES public.clients(id),
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  payment_reference text,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expenses_category_check CHECK (
    category IN ('emi', 'rent', 'utilities', 'subscription', 'workspace', 'tax', 'compliance', 'other')
  ),
  CONSTRAINT expenses_status_check CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'))
);

CREATE TRIGGER expenses_set_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX expenses_category_idx ON public.expenses (category) WHERE deleted_at IS NULL;
CREATE INDEX expenses_linked_client_idx ON public.expenses (linked_client_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- salary_payments
-- ---------------------------------------------------------------------------
CREATE TABLE public.salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid NOT NULL REFERENCES public.team_members(id),
  month smallint NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  base_amount numeric(14,2),
  reimbursement numeric(14,2),
  deduction numeric(14,2),
  total_amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  payment_date date,
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  transaction_reference text,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT salary_payments_status_check CHECK (status IN ('pending', 'partial', 'paid'))
);

CREATE TRIGGER salary_payments_set_updated_at
  BEFORE UPDATE ON public.salary_payments
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX salary_payments_member_idx ON public.salary_payments (team_member_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- payments (optional links to invoice, salary run, or expense)
-- ---------------------------------------------------------------------------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_type text NOT NULL,
  direction text NOT NULL,
  invoice_id uuid REFERENCES public.invoices(id),
  bank_account_id uuid NOT NULL REFERENCES public.bank_accounts(id),
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL,
  payment_date date NOT NULL,
  reference text,
  payer_payee_name text,
  notes text,
  salary_payment_id uuid REFERENCES public.salary_payments(id),
  expense_id uuid REFERENCES public.expenses(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_direction_check CHECK (direction IN ('in', 'out')),
  CONSTRAINT payments_type_check CHECK (
    payment_type IN ('client_receipt', 'salary', 'expense', 'transfer', 'other')
  )
);

CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX payments_bank_account_idx ON public.payments (bank_account_id) WHERE deleted_at IS NULL;
CREATE INDEX payments_invoice_idx ON public.payments (invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX payments_payment_date_idx ON public.payments (payment_date) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- tasks (flexible related_entity_* without polymorphic FK)
-- ---------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  completed_at timestamptz,
  related_entity_type text,
  related_entity_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tasks_category_check CHECK (
    category IN ('invoice', 'payment', 'salary', 'compliance', 'tax', 'company', 'bank', 'other')
  ),
  CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX tasks_due_date_idx ON public.tasks (due_date);
CREATE INDEX tasks_status_idx ON public.tasks (status);

-- ---------------------------------------------------------------------------
-- monthly_snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE public.monthly_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month smallint NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  revenue_eur numeric(14,2),
  revenue_inr numeric(16,2),
  expenses_eur numeric(14,2),
  expenses_inr numeric(16,2),
  salary_total_inr numeric(16,2),
  emi_total_inr numeric(16,2),
  profit_loss_eur numeric(14,2),
  profit_loss_inr numeric(16,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (month, year)
);

CREATE TRIGGER monthly_snapshots_set_updated_at
  BEFORE UPDATE ON public.monthly_snapshots
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- exchange_rates
-- ---------------------------------------------------------------------------
CREATE TABLE public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL,
  target_currency text NOT NULL,
  rate numeric(18,8) NOT NULL,
  rate_date date NOT NULL,
  source text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exchange_rates_positive CHECK (rate > 0)
);

CREATE INDEX exchange_rates_pair_date_idx ON public.exchange_rates (base_currency, target_currency, rate_date DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security — not enabled in Phase 2 Task 1
-- ---------------------------------------------------------------------------
-- Future: enable RLS per table and add policies keyed to auth.uid() once
-- Supabase Auth is wired for real users. Until then, use the Supabase
-- dashboard/service role for admin access and tighten policies before production.

COMMIT;
