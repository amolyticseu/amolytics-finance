/**
 * Dashboard summary (Phase 2 Task 10).
 *
 * Revenue rule: **invoice amounts only** — statuses `paid`, `sent`, or `overdue` for the
 * reference month (accrual-style “invoiced in period”). **Payments are not summed** for revenue
 * to avoid double-counting against invoice totals.
 */

import { CLIENT_LABEL } from "@/data/mock/constants"
import {
  mockComplianceUpcoming,
  mockDashboardContext,
  mockMonthlyExpensesEur,
  mockMonthlyRevenueEur,
  mockPendingInvoices,
  mockPendingSalaries,
} from "@/data/mock/figures"
import { mockComplianceTasks, mockInvoices } from "@/data/mock/tables"
import { getLatestExchangeRate } from "@/lib/data/settings"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type {
  ExpenseRow,
  InvoiceRow,
  SalaryPaymentRow,
  TaskRow,
} from "@/lib/supabase/types"
import type {
  ExpenseCategoryDb,
  ExpenseStatus,
  InvoiceStatus,
  TaskDbStatus,
} from "@/types"
import type { FinanceStatus } from "@/types"

export type DashboardDataSource = "database" | "fallback"

export type DashboardRecentInvoice = {
  id: string
  period: string
  issued: string
  amountEur: number
  status: FinanceStatus
}

export type DashboardUpcomingTask = {
  id: string
  title: string
  due: string
  owner: string | null
  status: FinanceStatus
}

export type DashboardSummary = {
  revenueThisMonth: number
  expensesThisMonth: number
  salariesThisMonth: number
  estimatedProfitLoss: number
  pendingInvoicesCount: number
  pendingInvoicesAmount: number
  pendingSalariesCount: number
  pendingSalariesAmount: number
  upcomingTasksCount: number
  overdueTasksCount: number
  workspaceRecoveryPending: number
  exchangeRateInrPerEur: number
  recentInvoices: DashboardRecentInvoice[]
  upcomingTasks: DashboardUpcomingTask[]
  /** StatCard expense hint breakdown (EUR). */
  expensesHintEmiEur: number
  expensesHintMaltaEur: number
  expensesHintMiscEur: number
  pendingInvoicesClientLabel: string
  pendingSalariesPeriodLabel: string
  complianceDueWithinDays: number
}

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback dashboard summary.`,
    err instanceof Error ? err.message : err
  )
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : NaN
  }
  return NaN
}

function refMonthBounds(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 }
}

function expenseDateInMonth(
  expenseDate: string,
  year: number,
  month: number
): boolean {
  if (!expenseDate || expenseDate.length < 7) return false
  const [y, m] = expenseDate.slice(0, 10).split("-").map(Number)
  return y === year && m === month
}

function invoiceMatchesMonth(
  inv: InvoiceRow,
  year: number,
  month: number
): boolean {
  if (inv.year != null && inv.month != null) {
    return inv.year === year && inv.month === month
  }
  const anchor = inv.sent_date ?? inv.created_at?.slice(0, 10) ?? ""
  if (anchor.length < 7) return false
  const [y, m] = anchor.split("-").map(Number)
  return y === year && m === month
}

const REVENUE_STATUSES: readonly InvoiceStatus[] = [
  "paid",
  "sent",
  "overdue",
]

const PENDING_INVOICE_STATUSES: readonly InvoiceStatus[] = ["sent", "overdue"]

const ALL_INVOICE_STATUSES: readonly InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]

function normalizeInvoiceStatus(raw: unknown): InvoiceStatus {
  const s = typeof raw === "string" ? raw : ""
  if (ALL_INVOICE_STATUSES.includes(s as InvoiceStatus)) {
    return s as InvoiceStatus
  }
  return "draft"
}

function isRevenueStatus(s: InvoiceStatus): boolean {
  return REVENUE_STATUSES.includes(s)
}

function isPendingInvoiceStatus(s: InvoiceStatus): boolean {
  return PENDING_INVOICE_STATUSES.includes(s)
}

function amountToEur(
  amount: number,
  currency: string,
  inrPerEur: number
): number {
  if (currency === "EUR") return amount
  if (currency === "INR") return amount / inrPerEur
  return amount
}

function normalizeInvoice(raw: Record<string, unknown>): InvoiceRow {
  const amount = toNumber(raw.amount)
  return {
    id: String(raw.id),
    client_id: String(raw.client_id),
    invoice_number:
      raw.invoice_number != null ? String(raw.invoice_number) : null,
    period_code: raw.period_code != null ? String(raw.period_code) : null,
    month:
      raw.month == null ? null : Math.trunc(Number(raw.month)) || null,
    year: raw.year == null ? null : Math.trunc(Number(raw.year)) || null,
    hours: raw.hours == null ? null : toNumber(raw.hours),
    hourly_rate: raw.hourly_rate == null ? null : toNumber(raw.hourly_rate),
    currency: typeof raw.currency === "string" ? raw.currency : "EUR",
    amount: Number.isFinite(amount) ? amount : 0,
    status: normalizeInvoiceStatus(raw.status),
    sent_date: raw.sent_date != null ? String(raw.sent_date) : null,
    due_date: raw.due_date != null ? String(raw.due_date) : null,
    paid_date: raw.paid_date != null ? String(raw.paid_date) : null,
    bank_account_id:
      raw.bank_account_id != null ? String(raw.bank_account_id) : null,
    payment_reference:
      raw.payment_reference != null ? String(raw.payment_reference) : null,
    workspace_recovery_amount:
      raw.workspace_recovery_amount == null
        ? null
        : toNumber(raw.workspace_recovery_amount),
    notes: raw.notes != null ? String(raw.notes) : null,
    deleted_at: raw.deleted_at != null ? String(raw.deleted_at) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function normalizeExpense(raw: Record<string, unknown>): ExpenseRow {
  const amount = toNumber(raw.amount)
  return {
    id: String(raw.id),
    category: (typeof raw.category === "string"
      ? raw.category
      : "other") as ExpenseCategoryDb,
    name: typeof raw.name === "string" ? raw.name : "",
    amount: Number.isFinite(amount) ? amount : 0,
    currency: typeof raw.currency === "string" ? raw.currency : "EUR",
    expense_date:
      raw.expense_date != null ? String(raw.expense_date) : "",
    due_date: raw.due_date != null ? String(raw.due_date) : null,
    status: (typeof raw.status === "string" ? raw.status : "pending") as ExpenseStatus,
    recurring: Boolean(raw.recurring),
    rebillable: Boolean(raw.rebillable),
    linked_client_id:
      raw.linked_client_id != null ? String(raw.linked_client_id) : null,
    bank_account_id:
      raw.bank_account_id != null ? String(raw.bank_account_id) : null,
    payment_reference:
      raw.payment_reference != null ? String(raw.payment_reference) : null,
    notes: raw.notes != null ? String(raw.notes) : null,
    deleted_at: raw.deleted_at != null ? String(raw.deleted_at) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function normalizeSalary(raw: Record<string, unknown>): SalaryPaymentRow {
  const total = toNumber(raw.total_amount)
  return {
    id: String(raw.id),
    team_member_id: String(raw.team_member_id),
    month: Math.trunc(Number(raw.month)) || 1,
    year: Math.trunc(Number(raw.year)) || 2000,
    base_amount:
      raw.base_amount == null ? null : toNumber(raw.base_amount),
    reimbursement:
      raw.reimbursement == null ? null : toNumber(raw.reimbursement),
    deduction: raw.deduction == null ? null : toNumber(raw.deduction),
    total_amount: Number.isFinite(total) ? total : 0,
    currency: typeof raw.currency === "string" ? raw.currency : "INR",
    status: (typeof raw.status === "string"
      ? raw.status
      : "pending") as SalaryPaymentRow["status"],
    payment_date:
      raw.payment_date != null ? String(raw.payment_date) : null,
    bank_account_id:
      raw.bank_account_id != null ? String(raw.bank_account_id) : null,
    transaction_reference:
      raw.transaction_reference != null
        ? String(raw.transaction_reference)
        : null,
    notes: raw.notes != null ? String(raw.notes) : null,
    deleted_at: raw.deleted_at != null ? String(raw.deleted_at) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function normalizeTask(raw: Record<string, unknown>): TaskRow {
  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : "",
    description:
      raw.description != null ? String(raw.description) : null,
    category: (typeof raw.category === "string"
      ? raw.category
      : "other") as TaskRow["category"],
    status: (typeof raw.status === "string"
      ? raw.status
      : "todo") as TaskDbStatus,
    priority: (typeof raw.priority === "string"
      ? raw.priority
      : "medium") as TaskRow["priority"],
    due_date: raw.due_date != null ? String(raw.due_date) : null,
    completed_at:
      raw.completed_at != null ? String(raw.completed_at) : null,
    related_entity_type:
      raw.related_entity_type != null
        ? String(raw.related_entity_type)
        : null,
    related_entity_id:
      raw.related_entity_id != null ? String(raw.related_entity_id) : null,
    notes: raw.notes != null ? String(raw.notes) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function periodLabel(inv: InvoiceRow): string {
  if (inv.year != null && inv.month != null && inv.period_code) {
    const mm = String(inv.month).padStart(2, "0")
    return `${inv.year}-${mm} · ${inv.period_code}`
  }
  return inv.period_code ?? inv.invoice_number ?? inv.id.slice(0, 8)
}

function mapRecentInvoiceWithRate(
  inv: InvoiceRow,
  rate: number
): DashboardRecentInvoice {
  return {
    id: inv.id,
    period: periodLabel(inv),
    issued: inv.sent_date ?? inv.created_at.slice(0, 10),
    amountEur: amountToEur(inv.amount, inv.currency, rate),
    status: inv.status,
  }
}

function taskIncomplete(status: TaskDbStatus): boolean {
  return status !== "done"
}

function todayUtcDateString(): string {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function dueWithinDays(due: string | null, days: number): boolean {
  if (!due) return false
  const today = new Date(todayUtcDateString() + "T12:00:00.000Z")
  const end = new Date(today)
  end.setUTCDate(end.getUTCDate() + days)
  const d = new Date(due + "T12:00:00.000Z")
  return d >= today && d <= end
}

function fallbackSummary(rate: number): DashboardSummary {
  const recentInvoices: DashboardRecentInvoice[] = mockInvoices
    .slice(0, 3)
    .map((inv) => ({
      id: inv.id,
      period: inv.period,
      issued: inv.issued,
      amountEur: inv.amountEur,
      status: inv.status,
    }))

  const upcomingTasks: DashboardUpcomingTask[] = mockComplianceTasks
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.title,
      due: t.due,
      owner: t.owner,
      status: t.status,
    }))

  const salariesEurForPnl = mockPendingSalaries.totalInr / rate

  return {
    revenueThisMonth: mockMonthlyRevenueEur,
    expensesThisMonth: mockMonthlyExpensesEur,
    salariesThisMonth: mockPendingSalaries.totalInr,
    estimatedProfitLoss:
      mockMonthlyRevenueEur - mockMonthlyExpensesEur - salariesEurForPnl,
    pendingInvoicesCount: mockPendingInvoices.count,
    pendingInvoicesAmount: mockPendingInvoices.totalEur,
    pendingSalariesCount: mockPendingSalaries.runsPending,
    pendingSalariesAmount: mockPendingSalaries.totalInr,
    upcomingTasksCount: mockComplianceUpcoming.count,
    overdueTasksCount: 0,
    workspaceRecoveryPending: mockDashboardContext.workspaceRecoveryPendingEur,
    exchangeRateInrPerEur: rate,
    recentInvoices,
    upcomingTasks,
    expensesHintEmiEur: mockDashboardContext.emiBreakdownEur,
    expensesHintMaltaEur: mockDashboardContext.maltaFixedEur,
    expensesHintMiscEur: mockDashboardContext.subscriptionsMiscEur,
    pendingInvoicesClientLabel: mockPendingInvoices.client,
    pendingSalariesPeriodLabel: mockPendingSalaries.periodLabel,
    complianceDueWithinDays: mockComplianceUpcoming.dueWithinDays,
  }
}

function buildDatabaseSummary(
  invoices: InvoiceRow[],
  expenses: ExpenseRow[],
  salaries: SalaryPaymentRow[],
  tasks: TaskRow[],
  inrPerEur: number,
  refYear: number,
  refMonth: number
): DashboardSummary {
  let revenueThisMonth = 0
  let pendingInvoicesCount = 0
  let pendingInvoicesAmount = 0

  for (const inv of invoices) {
    if (!invoiceMatchesMonth(inv, refYear, refMonth)) continue
    const eur = amountToEur(inv.amount, inv.currency, inrPerEur)
    if (isRevenueStatus(inv.status)) {
      revenueThisMonth += eur
    }
    if (isPendingInvoiceStatus(inv.status)) {
      pendingInvoicesCount += 1
      pendingInvoicesAmount += eur
    }
  }

  let expensesThisMonth = 0
  let emiEur = 0
  let maltaEur = 0
  let miscEur = 0
  let workspaceRecoveryPending = 0

  for (const ex of expenses) {
    if (!expenseDateInMonth(ex.expense_date, refYear, refMonth)) continue
    const eur = amountToEur(ex.amount, ex.currency, inrPerEur)
    expensesThisMonth += eur
    if (ex.category === "emi") emiEur += eur
    else if (ex.category === "rent" || ex.category === "utilities") {
      maltaEur += eur
    } else if (ex.category === "workspace" && ex.status === "pending") {
      workspaceRecoveryPending += eur
    } else {
      miscEur += eur
    }
  }

  let salariesThisMonth = 0
  let pendingSalariesCount = 0
  let pendingSalariesAmount = 0

  for (const s of salaries) {
    if (s.year !== refYear || s.month !== refMonth) continue
    salariesThisMonth += s.total_amount
    if (s.status === "pending" || s.status === "partial") {
      pendingSalariesCount += 1
      pendingSalariesAmount += s.total_amount
    }
  }

  const salariesEur = salariesThisMonth / inrPerEur
  const estimatedProfitLoss = revenueThisMonth - expensesThisMonth - salariesEur

  const complianceWindow = 14
  const todayStr = todayUtcDateString()
  let upcomingTasksCount = 0
  let overdueTasksCount = 0

  for (const t of tasks) {
    if (!taskIncomplete(t.status)) continue
    const due = t.due_date
    if (due && due < todayStr) overdueTasksCount += 1
    else if (!due) upcomingTasksCount += 1
    else if (dueWithinDays(due, complianceWindow)) upcomingTasksCount += 1
  }

  const upcomingTasks: DashboardUpcomingTask[] = tasks
    .filter((t) => taskIncomplete(t.status))
    .sort((a, b) => {
      const ad = a.due_date ?? "9999-12-31"
      const bd = b.due_date ?? "9999-12-31"
      return ad.localeCompare(bd)
    })
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.title,
      due: t.due_date ?? "—",
      owner: null,
      status: t.status as FinanceStatus,
    }))

  const recentInvoices = [...invoices]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 3)
    .map((inv) => mapRecentInvoiceWithRate(inv, inrPerEur))

  const monthName = new Date(Date.UTC(refYear, refMonth - 1, 1)).toLocaleString(
    "en-IN",
    { month: "long", year: "numeric" }
  )

  return {
    revenueThisMonth,
    expensesThisMonth,
    salariesThisMonth,
    estimatedProfitLoss,
    pendingInvoicesCount,
    pendingInvoicesAmount,
    pendingSalariesCount,
    pendingSalariesAmount,
    upcomingTasksCount,
    overdueTasksCount,
    workspaceRecoveryPending,
    exchangeRateInrPerEur: inrPerEur,
    recentInvoices,
    upcomingTasks,
    expensesHintEmiEur: emiEur,
    expensesHintMaltaEur: maltaEur,
    expensesHintMiscEur: miscEur,
    pendingInvoicesClientLabel: CLIENT_LABEL,
    pendingSalariesPeriodLabel: monthName,
    complianceDueWithinDays: complianceWindow,
  }
}

export async function getDashboardSummary(): Promise<{
  summary: DashboardSummary
  source: DashboardDataSource
}> {
  const fx = await getLatestExchangeRate()
  const rate = fx.row.rate

  if (!hasSupabaseEnv()) {
    return { summary: fallbackSummary(rate), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const [invRes, expRes, salRes, taskRes] = await Promise.all([
      supabase.from("invoices").select("*").is("deleted_at", null),
      supabase.from("expenses").select("*").is("deleted_at", null),
      supabase.from("salary_payments").select("*").is("deleted_at", null),
      supabase.from("tasks").select("*"),
    ])

    const firstErr =
      invRes.error ?? expRes.error ?? salRes.error ?? taskRes.error
    if (firstErr) {
      warnFallback("getDashboardSummary", firstErr)
      return { summary: fallbackSummary(rate), source: "fallback" }
    }

    const invoices = (invRes.data ?? []).map((r) =>
      normalizeInvoice(r as Record<string, unknown>)
    )
    const expenses = (expRes.data ?? []).map((r) =>
      normalizeExpense(r as Record<string, unknown>)
    )
    const salaries = (salRes.data ?? []).map((r) =>
      normalizeSalary(r as Record<string, unknown>)
    )
    const tasks = (taskRes.data ?? []).map((r) =>
      normalizeTask(r as Record<string, unknown>)
    )

    const totalRows =
      invoices.length + expenses.length + salaries.length + tasks.length
    if (totalRows === 0) {
      return { summary: fallbackSummary(rate), source: "fallback" }
    }

    const { year, month } = refMonthBounds()
    const summary = buildDatabaseSummary(
      invoices,
      expenses,
      salaries,
      tasks,
      rate,
      year,
      month
    )

    return { summary, source: "database" }
  } catch (e) {
    warnFallback("getDashboardSummary", e)
    return { summary: fallbackSummary(rate), source: "fallback" }
  }
}
