-- Amolytics Finance — starter seed (Phase 2)
-- Run once after schema.sql in Supabase SQL Editor.
-- Re-running without truncating may insert duplicates.

BEGIN;

-- Bank accounts (flexible rows — not enums)
INSERT INTO public.bank_accounts (
  account_name,
  account_holder_name,
  institution_name,
  account_type,
  currency,
  country,
  is_business_account,
  active,
  notes
) VALUES
  (
    'Wise EUR — personal',
    NULL,
    'Wise',
    'personal',
    'EUR',
    NULL,
    false,
    true,
    'Primary EUR personal wallet'
  ),
  (
    'Revolut',
    NULL,
    'Revolut',
    'personal',
    'EUR',
    'MT',
    false,
    true,
    NULL
  ),
  (
    'HSBC Malta',
    NULL,
    'HSBC',
    'current',
    'EUR',
    'MT',
    false,
    true,
    'Malta business / ops'
  ),
  (
    'ICICI India',
    NULL,
    'ICICI Bank',
    'current',
    'INR',
    'IN',
    false,
    true,
    'India INR account'
  ),
  (
    'Amolytics OPC — current (placeholder)',
    NULL,
    'TBD',
    'business_current',
    'EUR',
    'MT',
    true,
    true,
    'Future Amolytics OPC current account — placeholder row'
  );

-- Primary client
INSERT INTO public.clients (
  name,
  code,
  contact_name,
  email,
  hourly_rate,
  currency,
  billing_cycle_notes,
  active
) VALUES (
  '8BMF8 / BMF',
  '8BMF8',
  'Mariusz',
  NULL,
  15,
  'EUR',
  'Three invoices per month: T01 (days 1–10), T02 (11–20), T03 (21–end).',
  true
);

-- India team (names per business context)
INSERT INTO public.team_members (name, role, currency, active, notes) VALUES
  ('Ganpat', 'Engineer', 'INR', true, NULL),
  ('Kamal', 'Engineer', 'INR', true, NULL),
  ('Vinod', 'Engineer', 'INR', true, NULL),
  ('Vasudev', 'Engineer', 'INR', true, NULL),
  ('Siddhatta', 'Engineer', 'INR', true, NULL);

-- Default EUR → INR planning rate
INSERT INTO public.exchange_rates (
  base_currency,
  target_currency,
  rate,
  rate_date,
  source,
  notes
) VALUES (
  'EUR',
  'INR',
  90,
  '2026-05-10',
  'manual_seed',
  'Planning default until automated rates; Phase 1 mock used ₹90/€.'
);

-- EMI lines (amounts sum to ₹69,598)
INSERT INTO public.expenses (
  category, name, amount, currency, expense_date, status, recurring, rebillable, linked_client_id, notes
)
SELECT 'emi', 'Kotak EMI', 16352, 'INR', '2026-05-01', 'pending', true, false, id, 'Loan EMI — Kotak'
FROM public.clients WHERE code = '8BMF8' LIMIT 1;

INSERT INTO public.expenses (
  category, name, amount, currency, expense_date, status, recurring, rebillable, linked_client_id, notes
)
SELECT 'emi', 'IDFC EMI', 20528, 'INR', '2026-05-01', 'pending', true, false, id, 'Loan EMI — IDFC'
FROM public.clients WHERE code = '8BMF8' LIMIT 1;

INSERT INTO public.expenses (
  category, name, amount, currency, expense_date, status, recurring, rebillable, linked_client_id, notes
)
SELECT 'emi', 'Axis EMI — facility 1', 26619, 'INR', '2026-05-01', 'pending', true, false, id, 'Loan EMI — Axis 1'
FROM public.clients WHERE code = '8BMF8' LIMIT 1;

INSERT INTO public.expenses (
  category, name, amount, currency, expense_date, status, recurring, rebillable, linked_client_id, notes
)
SELECT 'emi', 'Axis EMI — facility 2', 6099, 'INR', '2026-05-01', 'pending', true, false, id, 'Loan EMI — Axis 2'
FROM public.clients WHERE code = '8BMF8' LIMIT 1;

-- Malta fixed (€625/mo split: rent + utilities)
INSERT INTO public.expenses (
  category, name, amount, currency, expense_date, status, recurring, rebillable, notes
) VALUES
  ('rent', 'Malta rent', 500, 'EUR', '2026-05-01', 'pending', true, false, 'Fixed Malta rent component'),
  ('utilities', 'Malta utilities', 125, 'EUR', '2026-05-01', 'pending', true, false, 'Fixed Malta utilities component');

-- Workspace recovery — rebillable to client when agreed
INSERT INTO public.expenses (
  category, name, amount, currency, expense_date, status, recurring, rebillable, linked_client_id, notes
)
SELECT
  'workspace',
  'Workspace recovery (pending recharge)',
  163.08,
  'EUR',
  '2026-05-10',
  'pending',
  false,
  true,
  id,
  'Pending €163.08 recovery; link to invoice line when billed.'
FROM public.clients WHERE code = '8BMF8' LIMIT 1;

-- Follow-up task (not tied to expense row via FK — flexible related_entity_* reserved for later)
INSERT INTO public.tasks (
  title,
  description,
  category,
  status,
  priority,
  due_date,
  notes
) VALUES (
  'Recharge workspace recovery to BMF',
  'Align €163.08 workspace recovery with next BMF invoice or separate line item.',
  'company',
  'todo',
  'medium',
  '2026-05-31',
  'Seed task — replace related_entity_* when expense/invoice IDs are stable in app.'
);

-- Optional snapshot row for current planning month (figures partial / illustrative)
INSERT INTO public.monthly_snapshots (
  month,
  year,
  revenue_eur,
  expenses_eur,
  emi_total_inr,
  notes
) VALUES (
  5,
  2026,
  2985,
  1517,
  69598,
  'Illustrative seed — replace with computed aggregates once CRUD is live.'
);

COMMIT;
