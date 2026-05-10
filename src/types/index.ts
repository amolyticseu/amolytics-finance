/** Third of month billing windows for BMF (1–10, 11–20, 21–end). */
export type BillingPeriodCode = "T01" | "T02" | "T03"

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"

export type PaymentStatus = "pending" | "completed" | "failed"

/** `salary_payments.status` — matches schema check. */
export type SalaryPaymentStatus = "pending" | "partial" | "paid"

export type BankProvider = "wise" | "revolut" | "hsbc" | "icici" | "other"

export type ExpenseCategory =
  | "malta"
  | "subscription"
  | "emi"
  | "workspace_recovery"
  | "compliance"
  | "other"

/** `expenses.category` — matches `schema.sql` check constraint. */
export type ExpenseCategoryDb =
  | "emi"
  | "rent"
  | "utilities"
  | "subscription"
  | "workspace"
  | "tax"
  | "compliance"
  | "other"

/** `expenses.status` — matches `schema.sql` check constraint. */
export type ExpenseStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"

/** Phase 1 mock tasks UI (`mockComplianceTasks`). */
export type TaskStatus = "open" | "in_progress" | "done"

/** `tasks.category` — matches `schema.sql` check constraint. */
export type TaskCategoryDb =
  | "invoice"
  | "payment"
  | "salary"
  | "compliance"
  | "tax"
  | "company"
  | "bank"
  | "other"

/** `tasks.status` — matches `schema.sql` check constraint. */
export type TaskDbStatus = "todo" | "in_progress" | "done" | "blocked"

/** `tasks.priority` — matches `schema.sql` check constraint. */
export type TaskPriorityDb = "low" | "medium" | "high" | "urgent"

/** Labels shown via StatusBadge in Phase 1 mock UI. */
export type FinanceStatus =
  | InvoiceStatus
  | PaymentStatus
  | TaskStatus
  | TaskDbStatus
  | SalaryPaymentStatus
  | "scheduled"
  | "active"

export interface ClientAccount {
  id: string
  name: string
  code: string
}

export interface Invoice {
  id: string
  clientId: string
  /** e.g. T01 for days 1–10 */
  periodCode: BillingPeriodCode
  periodYear: number
  periodMonth: number
  issueDate: string
  /** Minor units (e.g. cents) to avoid float drift */
  amountMinor: number
  currency: string
  status: InvoiceStatus
}

export interface Payment {
  id: string
  invoiceId: string | null
  receivedAt: string
  amountMinor: number
  currency: string
  provider: BankProvider
  reference: string | null
  status: PaymentStatus
}

export interface BankAccount {
  id: string
  label: string
  provider: BankProvider
  currency: string
  /** Display only until balances are wired up */
  balanceHint: string | null
}

export interface TeamMember {
  id: string
  name: string
  role: string
  location: string
  /** ISO date */
  startedAt: string | null
}

export interface SalaryPayment {
  id: string
  teamMemberId: string
  period: string
  paidAt: string
  amountMinor: number
  currency: string
}

export interface Expense {
  id: string
  category: ExpenseCategory
  vendor: string
  incurredAt: string
  amountMinor: number
  currency: string
  notes: string | null
}

export interface ComplianceTask {
  id: string
  title: string
  dueDate: string | null
  status: TaskStatus
}

export interface MonthlySnapshot {
  month: string
  revenueMinor: number
  expensesMinor: number
  currency: string
}

/** Default hourly rate for BMF engagements (EUR). */
export const DEFAULT_HOURLY_RATE_EUR = 15
