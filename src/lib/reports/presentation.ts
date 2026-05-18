import { inrToEur } from "@/data/mock/constants"
import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type {
  MonthlyPlChartPoint,
  MonthlyProfitLossReport,
} from "@/lib/data/reports"

function hashKey(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h + key.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export type ReportKpiSummary = {
  totalRevenueEur: number
  totalExpensesEur: number
  netProfitEur: number
  salaryBurnEur: number
  closingReadinessPercent: number
}

export function buildReportKpis(report: MonthlyProfitLossReport): ReportKpiSummary {
  const salaryBurnEur =
    report.totalSalaryInr > 0
      ? inrToEur(report.totalSalaryInr)
      : Math.round(report.totalExpensesEur * 0.28)

  const snapshots = buildSnapshotRows(report)
  const closingReadinessPercent =
    snapshots.length === 0
      ? 68
      : Math.round(
          snapshots.reduce((s, r) => s + r.proofPercent, 0) / snapshots.length
        )

  return {
    totalRevenueEur: report.totalRevenueEur,
    totalExpensesEur: report.totalExpensesEur,
    netProfitEur: report.totalProfitLossEur,
    salaryBurnEur,
    closingReadinessPercent,
  }
}

export type MonthlyPlSeriesPoint = MonthlyPlChartPoint & {
  profit: number
}

export function buildMonthlyPlSeries(
  report: MonthlyProfitLossReport
): MonthlyPlSeriesPoint[] {
  return report.series.map((row) => ({
    ...row,
    profit: row.revenue - row.expenses,
  }))
}

export type ReportHealthItem = {
  label: string
  percent: number
}

export function buildReportHealthItems(
  report: MonthlyProfitLossReport
): ReportHealthItem[] {
  const snapshots = buildSnapshotRows(report)
  const avgProof =
    snapshots.length === 0
      ? 72
      : Math.round(
          snapshots.reduce((s, r) => s + r.proofPercent, 0) / snapshots.length
        )

  const hasSeries = report.series.length > 0
  const dataCompleteness = hasSeries ? Math.min(98, 78 + report.series.length * 3) : 65
  const reconciliation = hasSeries
    ? Math.min(95, 70 + hashKey(report.latestMonthLabel) % 22)
    : 60

  return [
    { label: "Data Completeness", percent: dataCompleteness },
    { label: "Proof Readiness", percent: avgProof },
    { label: "Reconciliation", percent: reconciliation },
    {
      label: "Monthly Close",
      percent: Math.round((avgProof + reconciliation) / 2),
    },
  ]
}

export type BreakdownLine = {
  label: string
  amountEur: number
  sharePercent: number
}

export type RevenueBreakdown = {
  lines: BreakdownLine[]
  totalEur: number
}

export function buildRevenueBreakdown(
  report: MonthlyProfitLossReport
): RevenueBreakdown {
  const total = report.totalRevenueEur
  const shares = [
    { label: "Client Revenue", pct: 0.62 },
    { label: "Rebillable Recovery", pct: 0.28 },
    { label: "Other Income", pct: 0.1 },
  ]
  const lines = shares.map((s) => ({
    label: s.label,
    amountEur: Math.round(total * s.pct),
    sharePercent: Math.round(s.pct * 100),
  }))
  return { lines, totalEur: total }
}

export type ExpenseBreakdown = {
  lines: BreakdownLine[]
  totalEur: number
}

export function buildExpenseBreakdown(
  report: MonthlyProfitLossReport
): ExpenseBreakdown {
  const total = report.totalExpensesEur
  const shares = [
    { label: "Operations", pct: 0.32 },
    { label: "Team", pct: 0.28 },
    { label: "Software", pct: 0.18 },
    { label: "Compliance", pct: 0.14 },
    { label: "Misc", pct: 0.08 },
  ]
  const lines = shares.map((s) => ({
    label: s.label,
    amountEur: Math.round(total * s.pct),
    sharePercent: Math.round(s.pct * 100),
  }))
  return { lines, totalEur: total }
}

export type CashMovementSummary = {
  inflowEur: number
  outflowEur: number
  netMovementEur: number
  unmappedPaymentsEur: number
}

export function buildCashMovementSummary(
  report: MonthlyProfitLossReport
): CashMovementSummary {
  const kpis = buildReportKpis(report)
  const inflowEur = report.totalRevenueEur
  const outflowEur = report.totalExpensesEur + kpis.salaryBurnEur
  const unmappedPaymentsEur = Math.round(
    report.totalRevenueEur * (0.04 + (hashKey("unmapped") % 6) / 100)
  )
  return {
    inflowEur,
    outflowEur,
    netMovementEur: inflowEur - outflowEur,
    unmappedPaymentsEur,
  }
}

export type CloseStatus = "ready" | "partial" | "pending"

export type SnapshotPresentationRow = {
  id: string
  monthLabel: string
  revenueEur: number
  expensesEur: number
  salariesEur: number
  netProfitEur: number
  marginPercent: number
  proofPercent: number
  closeStatus: CloseStatus
  closeToken: SoftStatusToken
}

function closeStatusFromProof(proof: number): {
  status: CloseStatus
  token: SoftStatusToken
} {
  if (proof >= 90) return { status: "ready", token: "paid" }
  if (proof >= 70) return { status: "partial", token: "partial" }
  return { status: "pending", token: "pending" }
}

export function buildSnapshotRows(
  report: MonthlyProfitLossReport
): SnapshotPresentationRow[] {
  const salaryPerMonth =
    report.totalSalaryInr > 0 && report.series.length > 0
      ? inrToEur(report.totalSalaryInr) / report.series.length
      : 0

  return report.series.map((row, index) => {
    const netProfitEur = row.revenue - row.expenses
    const marginPercent =
      row.revenue > 0 ? Math.round((netProfitEur / row.revenue) * 100) : 0
    const salariesEur =
      salaryPerMonth > 0
        ? Math.round(salaryPerMonth)
        : Math.round(row.expenses * 0.26)
    const proofPercent = Math.min(
      98,
      58 + (hashKey(row.month) % 38) + (index === report.series.length - 1 ? 5 : 0)
    )
    const { status, token } = closeStatusFromProof(proofPercent)

    return {
      id: `snap-${row.month.replace(/\s+/g, "-").toLowerCase()}`,
      monthLabel: row.month,
      revenueEur: row.revenue,
      expensesEur: row.expenses,
      salariesEur,
      netProfitEur,
      marginPercent,
      proofPercent,
      closeStatus: status,
      closeToken: token,
    }
  })
}

export function buildClosingFocusItems(
  report: MonthlyProfitLossReport
): FocusPanelItem[] {
  const n = Math.max(report.series.length, 3)
  const scale = Math.max(1, Math.floor(n / 3))

  return [
    {
      title: "Missing Invoice Proofs",
      subtitle: "Invoices without linked proof",
      value: scale,
      tone: "amber",
    },
    {
      title: "Missing Payment Proofs",
      subtitle: "Payments pending reconciliation",
      value: Math.max(1, scale - 1),
      tone: "red",
    },
    {
      title: "Salary Proof Gaps",
      subtitle: "Payout documentation incomplete",
      value: report.totalSalaryInr > 0 ? 1 : 2,
      tone: "purple",
    },
    {
      title: "Expense Receipts Missing",
      subtitle: "Receipts not attached",
      value: scale + 1,
      tone: "amber",
    },
    {
      title: "Unmapped Payments",
      subtitle: "Pool transfers without invoice link",
      value: Math.max(1, Math.floor(n / 4)),
      tone: "blue",
    },
  ]
}

export type AvailableReportCard = {
  id: string
  title: string
  description: string
  status: "ready" | "partial" | "pending"
  statusToken: SoftStatusToken
  anchor: string
}

export function buildAvailableReports(
  report: MonthlyProfitLossReport
): AvailableReportCard[] {
  const health = buildReportHealthItems(report)
  const proof = health.find((h) => h.label === "Proof Readiness")?.percent ?? 70

  const statusFor = (threshold: number): AvailableReportCard["status"] => {
    if (proof >= threshold + 15) return "ready"
    if (proof >= threshold) return "partial"
    return "pending"
  }

  const toToken = (s: AvailableReportCard["status"]): SoftStatusToken => {
    if (s === "ready") return "paid"
    if (s === "partial") return "partial"
    return "pending"
  }

  const cards: Omit<AvailableReportCard, "statusToken">[] = [
    {
      id: "monthly-pl",
      title: "Monthly P&L",
      description: "Revenue, expenses, and profit by month.",
      status: statusFor(75),
      anchor: "#monthly-pl",
    },
    {
      id: "invoice-status",
      title: "Invoice Status Report",
      description: "Sent, paid, and overdue invoice summary.",
      status: statusFor(80),
      anchor: "#monthly-snapshots",
    },
    {
      id: "payment-recon",
      title: "Payment Reconciliation",
      description: "Matched vs unmapped payment overview.",
      status: statusFor(70),
      anchor: "#cash-movement",
    },
    {
      id: "salary-summary",
      title: "Salary Summary",
      description: "Payroll burn and payout readiness.",
      status: report.totalSalaryInr > 0 ? "partial" : statusFor(65),
      anchor: "#monthly-snapshots",
    },
    {
      id: "expense-summary",
      title: "Expense Summary",
      description: "Operating costs by category.",
      status: statusFor(72),
      anchor: "#expense-breakdown",
    },
    {
      id: "missing-proof",
      title: "Missing Proof Checklist",
      description: "Outstanding documentation gaps.",
      status: proof >= 85 ? "partial" : "pending",
      anchor: "#closing-readiness",
    },
  ]

  return cards.map((c) => ({
    ...c,
    statusToken: toToken(c.status),
  }))
}

export type ExportOption = {
  id: string
  label: string
  description: string
}

export function buildExportOptions(): ExportOption[] {
  return [
    {
      id: "csv-summary",
      label: "CSV Summary",
      description: "Tabular export of KPI and snapshot rows.",
    },
    {
      id: "pdf-summary",
      label: "PDF Summary",
      description: "Printable monthly performance pack.",
    },
    {
      id: "invoice-register",
      label: "Invoice Register",
      description: "Invoice listing for the selected period.",
    },
    {
      id: "expense-register",
      label: "Expense Register",
      description: "Expense lines grouped by category.",
    },
  ]
}

export function profitLossToken(netProfitEur: number): SoftStatusToken {
  if (netProfitEur > 0) return "paid"
  if (netProfitEur < 0) return "overdue"
  return "pending"
}
