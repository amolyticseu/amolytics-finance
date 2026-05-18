import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { DesignTone } from "@/components/design-system/tone-styles"
import { mockMonthlyPl } from "@/data/mock/tables"
import type { DashboardSummary } from "@/lib/data/dashboard"
import type { FinanceStatus } from "@/types"

/** Presentation-only dashboard data — no real client/team names or bank identifiers. */

export type DashboardChartPoint = {
  month: string
  revenue: number
  expenses: number
}

export type DashboardPendingInvoiceRow = {
  id: string
  client: string
  amountEur: number
  dueDate: string
  status: FinanceStatus
}

export type DashboardPaymentRow = {
  date: string
  type: string
  amountEur: number
  account: string
  status: FinanceStatus
}

export type DashboardComplianceTaskRow = {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: FinanceStatus
}

export type ExpenseBreakdownSlice = {
  name: string
  value: number
  fill: string
}

const DUMMY_CLIENTS = [
  "Client Alpha",
  "Client Beta",
  "Client Gamma",
  "Client Delta",
] as const

const PRESENTATION_PENDING_INVOICES: DashboardPendingInvoiceRow[] = [
  {
    id: "INV-2401",
    client: "Client Alpha",
    amountEur: 4_200,
    dueDate: "2026-05-28",
    status: "sent",
  },
  {
    id: "INV-2402",
    client: "Client Beta",
    amountEur: 3_150,
    dueDate: "2026-05-22",
    status: "overdue",
  },
  {
    id: "INV-2403",
    client: "Client Gamma",
    amountEur: 2_890,
    dueDate: "2026-06-04",
    status: "sent",
  },
  {
    id: "INV-2404",
    client: "Client Delta",
    amountEur: 2_240,
    dueDate: "2026-06-10",
    status: "paid",
  },
]

const PRESENTATION_PAYMENTS: DashboardPaymentRow[] = [
  {
    date: "2026-05-16",
    type: "Invoice receipt",
    amountEur: 3_150,
    account: "Main Account",
    status: "completed",
  },
  {
    date: "2026-05-14",
    type: "Salary batch",
    amountEur: 4_820,
    account: "Payroll Account",
    status: "completed",
  },
  {
    date: "2026-05-12",
    type: "Vendor expense",
    amountEur: 920,
    account: "Operations Account",
    status: "pending",
  },
  {
    date: "2026-05-10",
    type: "Invoice receipt",
    amountEur: 2_890,
    account: "Main Account",
    status: "completed",
  },
]

const PRESENTATION_COMPLIANCE_TASKS: DashboardComplianceTaskRow[] = [
  {
    id: "d-t1",
    title: "Review monthly invoice set",
    priority: "high",
    status: "todo",
  },
  {
    id: "d-t2",
    title: "Follow up pending collection",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "d-t3",
    title: "Update salary register",
    priority: "medium",
    status: "todo",
  },
  {
    id: "d-t4",
    title: "Prepare compliance checklist",
    priority: "low",
    status: "done",
  },
  {
    id: "d-t5",
    title: "Review expense reports",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "d-t6",
    title: "Schedule team meeting",
    priority: "low",
    status: "blocked",
  },
]

/** Decorative trend pills for KPI cards (presentation only). */
export const KPI_TRENDS = {
  revenue: { label: "+8.2%", tone: "positive" as const },
  expenses: { label: "-3.1%", tone: "negative" as const },
  profit: { label: "+12.5%", tone: "positive" as const },
  pendingInvoices: { label: "Awaiting", tone: "neutral" as const },
  pendingPayouts: { label: "Scheduled", tone: "neutral" as const },
  upcomingTasks: { label: "This week", tone: "neutral" as const },
}

export function buildRevenueExpenseChartSeries(
  summary: DashboardSummary
): DashboardChartPoint[] {
  const months = [...mockMonthlyPl]
  const currentRevenue = Math.round(summary.revenueThisMonth)
  const currentExpenses = Math.round(summary.expensesThisMonth)

  if (months.length >= 5) {
    months[months.length - 1] = {
      month: months[months.length - 1].month,
      revenue: currentRevenue,
      expenses: currentExpenses,
    }
  }

  return [
    ...months,
    {
      month: "Jun",
      revenue: Math.round(currentRevenue * 1.02),
      expenses: Math.round(currentExpenses * 0.98),
    },
  ]
}

export function getPendingInvoicesPresentation(
  summary: DashboardSummary
): DashboardPendingInvoiceRow[] {
  const count = Math.min(
    Math.max(summary.pendingInvoicesCount, 1),
    PRESENTATION_PENDING_INVOICES.length
  )
  return PRESENTATION_PENDING_INVOICES.slice(0, count)
}

export function getRecentPaymentsPresentation(): DashboardPaymentRow[] {
  return PRESENTATION_PAYMENTS
}

export function getComplianceTasksPresentation(
  summary: DashboardSummary
): DashboardComplianceTaskRow[] {
  const target = Math.min(
    Math.max(summary.upcomingTasksCount, 4),
    PRESENTATION_COMPLIANCE_TASKS.length
  )
  return PRESENTATION_COMPLIANCE_TASKS.slice(0, target)
}

export function buildExpenseBreakdown(
  summary: DashboardSummary
): ExpenseBreakdownSlice[] {
  const total = Math.max(summary.expensesThisMonth, 1)
  const weights = [
    { name: "Operations", share: 0.36, fill: "var(--af-primary-blue)" },
    { name: "Team", share: 0.36, fill: "var(--af-secondary-teal)" },
    { name: "Software", share: 0.18, fill: "var(--af-purple)" },
    { name: "Compliance", share: 0.08, fill: "var(--af-warning)" },
    { name: "Misc", share: 0.02, fill: "var(--af-text-muted)" },
  ]
  return weights.map((w) => ({
    name: w.name,
    value: Math.round(total * w.share),
    fill: w.fill,
  }))
}

export function getFinanceSnapshot(summary: DashboardSummary) {
  return {
    activeClients: 8,
    activeTeam: 12,
    rebillablePendingEur: summary.workspaceRecoveryPending,
    cashHealth: "Healthy" as const,
  }
}

export { DUMMY_CLIENTS }

const PRIORITY_TONE: Record<
  DashboardComplianceTaskRow["priority"],
  DesignTone
> = {
  high: "red",
  medium: "amber",
  low: "gray",
}

const PRIORITY_LABEL: Record<DashboardComplianceTaskRow["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

const FINANCE_TO_SOFT: Partial<Record<FinanceStatus, SoftStatusToken>> = {
  draft: "draft",
  sent: "sent",
  paid: "paid",
  overdue: "overdue",
  cancelled: "cancelled",
  pending: "pending",
  completed: "completed",
  partial: "partial",
  todo: "todo",
  in_progress: "in_progress",
  done: "done",
  blocked: "blocked",
  scheduled: "scheduled",
  active: "active",
  open: "todo",
  failed: "blocked",
}

/** Map app finance statuses to design-system soft badge tokens. */
export function financeStatusToSoftToken(status: FinanceStatus): SoftStatusToken {
  return FINANCE_TO_SOFT[status] ?? "todo"
}

/** Rows with status for dashboard compliance widget (badges rendered in UI). */
export function getComplianceTasksWithStatus(summary: DashboardSummary) {
  return getComplianceTasksPresentation(summary).map((task) => ({
    ...task,
    softStatus: financeStatusToSoftToken(task.status),
    priorityLabel: PRIORITY_LABEL[task.priority],
    tone: PRIORITY_TONE[task.priority],
  }))
}
