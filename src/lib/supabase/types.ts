/**
 * Hand-written Supabase `Database` shape for Phase 2 (subset of tables).
 * Replace with `supabase gen types` when convenient.
 */

import type {
  ExpenseCategoryDb,
  ExpenseStatus,
  InvoiceStatus,
  SalaryPaymentStatus,
  TaskCategoryDb,
  TaskDbStatus,
  TaskPriorityDb,
} from "@/types"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * `clients` row. `hourly_rate` is Postgres `numeric` — may arrive as string; normalize in data layer.
 */
export type ClientRow = {
  id: string
  name: string
  code: string
  contact_name: string | null
  email: string | null
  hourly_rate: number | null
  currency: string
  billing_cycle_notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * `bank_accounts` row. UI should use masked fields only; no full account numbers in tables meant for display.
 */
export type BankAccountRow = {
  id: string
  account_name: string
  account_holder_name: string | null
  institution_name: string
  account_type: string | null
  currency: string
  country: string | null
  iban_masked: string | null
  swift_bic: string | null
  bank_address: string | null
  is_business_account: boolean
  active: boolean
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * `exchange_rates` row. `rate` is Postgres `numeric` — normalize in data layer.
 */
export type ExchangeRateRow = {
  id: string
  base_currency: string
  target_currency: string
  rate: number
  rate_date: string
  source: string | null
  notes: string | null
  created_at: string
}

/**
 * `team_members` row. `base_salary` is Postgres `numeric`; PostgREST may return string or number —
 * normalize with `toNumber()` in the data layer before UI use.
 */
export type TeamMemberRow = {
  id: string
  name: string
  role: string | null
  base_salary: number | null
  currency: string
  bank_name: string | null
  bank_account_masked: string | null
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * `invoices` row. Numeric columns may arrive as string from PostgREST — normalize in the data layer.
 */
export type InvoiceRow = {
  id: string
  client_id: string
  invoice_number: string | null
  period_code: string | null
  month: number | null
  year: number | null
  hours: number | null
  hourly_rate: number | null
  currency: string
  amount: number
  status: InvoiceStatus
  sent_date: string | null
  due_date: string | null
  paid_date: string | null
  bank_account_id: string | null
  payment_reference: string | null
  workspace_recovery_amount: number | null
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/** Invoice row plus client display fields after a join or fallback mapping. */
export type InvoiceListItem = InvoiceRow & {
  client_name: string | null
  client_code: string | null
}

/** `payments.direction` — matches schema check. */
export type PaymentDirection = "in" | "out"

/** `payments.payment_type` — matches schema check. */
export type PaymentTypeDb =
  | "client_receipt"
  | "salary"
  | "expense"
  | "transfer"
  | "other"

/**
 * `payments` row. `amount` is Postgres `numeric` — may arrive as string; normalize in the data layer.
 */
export type PaymentRow = {
  id: string
  payment_type: PaymentTypeDb
  direction: PaymentDirection
  invoice_id: string | null
  salary_payment_id: string | null
  expense_id: string | null
  bank_account_id: string
  amount: number
  currency: string
  payment_date: string
  reference: string | null
  payer_payee_name: string | null
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/** Payment row plus joined display fields. */
export type PaymentListItem = PaymentRow & {
  /** From `invoices.invoice_number` when `invoice_id` is set. */
  invoice_number: string | null
  /** Short label from `bank_accounts` (e.g. account name · institution). */
  bank_display: string | null
}

/**
 * `salary_payments` row. Numeric columns may arrive as string from PostgREST — normalize in the data layer.
 */
export type SalaryPaymentRow = {
  id: string
  team_member_id: string
  month: number
  year: number
  base_amount: number | null
  reimbursement: number | null
  deduction: number | null
  total_amount: number
  currency: string
  status: SalaryPaymentStatus
  payment_date: string | null
  bank_account_id: string | null
  transaction_reference: string | null
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/** Salary payment plus joined team member and bank display fields. */
export type SalaryPaymentListItem = SalaryPaymentRow & {
  member_name: string | null
  member_role: string | null
  bank_display: string | null
}

/**
 * `expenses` row. `amount` is Postgres `numeric` — normalize in the data layer.
 */
export type ExpenseRow = {
  id: string
  category: ExpenseCategoryDb
  name: string
  amount: number
  currency: string
  expense_date: string
  due_date: string | null
  status: ExpenseStatus
  recurring: boolean
  rebillable: boolean
  linked_client_id: string | null
  bank_account_id: string | null
  payment_reference: string | null
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/** Expense row plus joined client and bank display fields. */
export type ExpenseListItem = ExpenseRow & {
  client_name: string | null
  client_code: string | null
  bank_display: string | null
}

/**
 * `tasks` row (no `deleted_at` in schema — all rows are active for read).
 */
export type TaskRow = {
  id: string
  title: string
  description: string | null
  category: TaskCategoryDb
  status: TaskDbStatus
  priority: TaskPriorityDb
  due_date: string | null
  completed_at: string | null
  related_entity_type: string | null
  related_entity_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * `monthly_snapshots` row. Numeric columns may arrive as string from PostgREST — normalize in the data layer.
 */
export type MonthlySnapshotRow = {
  id: string
  month: number
  year: number
  revenue_eur: number | null
  revenue_inr: number | null
  expenses_eur: number | null
  expenses_inr: number | null
  salary_total_inr: number | null
  emi_total_inr: number | null
  profit_loss_eur: number | null
  profit_loss_inr: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: ClientRow
        Insert: Omit<ClientRow, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ClientRow, "id">>
        Relationships: []
      }
      bank_accounts: {
        Row: BankAccountRow
        Insert: Omit<BankAccountRow, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<BankAccountRow, "id">>
        Relationships: []
      }
      exchange_rates: {
        Row: ExchangeRateRow
        Insert: Omit<ExchangeRateRow, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<ExchangeRateRow, "id">>
        Relationships: []
      }
      team_members: {
        Row: TeamMemberRow
        Insert: Omit<TeamMemberRow, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<TeamMemberRow, "id">>
        Relationships: []
      }
      invoices: {
        Row: InvoiceRow
        Insert: Omit<
          InvoiceRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<InvoiceRow, "id">>
        Relationships: []
      }
      payments: {
        Row: PaymentRow
        Insert: Omit<
          PaymentRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<PaymentRow, "id">>
        Relationships: []
      }
      salary_payments: {
        Row: SalaryPaymentRow
        Insert: Omit<
          SalaryPaymentRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<SalaryPaymentRow, "id">>
        Relationships: []
      }
      expenses: {
        Row: ExpenseRow
        Insert: Omit<
          ExpenseRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ExpenseRow, "id">>
        Relationships: []
      }
      tasks: {
        Row: TaskRow
        Insert: Omit<TaskRow, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<TaskRow, "id">>
        Relationships: []
      }
      monthly_snapshots: {
        Row: MonthlySnapshotRow
        Insert: Omit<
          MonthlySnapshotRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<MonthlySnapshotRow, "id">>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
