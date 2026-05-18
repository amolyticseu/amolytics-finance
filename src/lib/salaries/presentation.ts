import { inrToEur } from "@/data/mock/constants"
import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"
import type { SalaryPaymentListItem } from "@/lib/supabase/types"
import type { SalaryPaymentStatus } from "@/types"

const DUMMY_MEMBERS = [
  "Team Member 01",
  "Team Member 02",
  "Team Member 03",
  "Team Member 04",
  "Team Member 05",
] as const

const GENERIC_ACCOUNTS = [
  "Payroll Account",
  "Operations Account",
  "Main Account",
] as const

const TEAM_BUCKETS = [
  "Developers",
  "Design",
  "QA",
  "Support",
  "Operations",
] as const

const STATUS_TO_SOFT: Partial<Record<SalaryPaymentStatus, SoftStatusToken>> = {
  pending: "pending",
  partial: "partial",
  paid: "paid",
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export function amountToEur(row: SalaryPaymentListItem): number {
  if (row.currency === "EUR") return row.total_amount
  if (row.currency === "INR") return inrToEur(row.total_amount)
  return row.total_amount
}

export function isActiveSalary(row: SalaryPaymentListItem): boolean {
  return row.deleted_at == null
}

export function displayTeamMember(row: SalaryPaymentListItem): string {
  return DUMMY_MEMBERS[hashId(row.team_member_id) % DUMMY_MEMBERS.length]
}

export function roleBucket(role: string | null): (typeof TEAM_BUCKETS)[number] {
  const r = (role ?? "").toLowerCase()
  if (
    r.includes("dev") ||
    r.includes("engineer") ||
    r.includes("backend") ||
    r.includes("frontend")
  ) {
    return "Developers"
  }
  if (r.includes("design") || r.includes("ui")) return "Design"
  if (r.includes("qa") || r.includes("test")) return "QA"
  if (r.includes("support") || r.includes("success")) return "Support"
  return "Operations"
}

export function displayRole(row: SalaryPaymentListItem): string {
  return `${roleBucket(row.member_role)} Staff`
}

export function displayAccountLabel(row: SalaryPaymentListItem): string {
  if (!row.bank_account_id) return "—"
  return GENERIC_ACCOUNTS[hashId(row.bank_account_id) % GENERIC_ACCOUNTS.length]
}

export function monthYearLabel(month: number, year: number): string {
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString("en-IN", { month: "short", year: "numeric" })
}

export function salaryStatusSoftToken(row: SalaryPaymentListItem): SoftStatusToken {
  if (row.status === "paid") return "paid"
  if (row.status === "partial") return "partial"
  if (row.status === "pending" && row.payment_date) return "scheduled"
  return STATUS_TO_SOFT[row.status] ?? "pending"
}

export function proofChecks(row: SalaryPaymentListItem) {
  return {
    paymentProof: Boolean(row.transaction_reference?.trim()),
    bankReference: Boolean(row.bank_account_id),
    approvalNote: Boolean(row.notes?.trim() && row.notes.trim().length >= 8),
    teamRecord: Boolean(row.team_member_id),
    notesComplete: Boolean(row.notes?.trim()),
  }
}

export function proofPercent(row: SalaryPaymentListItem): number {
  const c = proofChecks(row)
  const done = [
    c.paymentProof,
    c.bankReference,
    c.approvalNote,
    c.teamRecord,
    c.notesComplete,
  ].filter(Boolean).length
  return Math.round((done / 5) * 100)
}

export function isProofComplete(row: SalaryPaymentListItem): boolean {
  return proofPercent(row) === 100
}

export function isScheduledPayout(row: SalaryPaymentListItem): boolean {
  return row.status === "pending" && Boolean(row.payment_date)
}

function currentPeriod(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export type SalaryKpiSummary = {
  totalSalaryBurnEur: number
  paidThisMonthEur: number
  pendingPayoutsCount: number
  partialPaymentsCount: number
  proofCompletionPercent: number
}

export function buildSalaryKpis(rows: SalaryPaymentListItem[]): SalaryKpiSummary {
  const active = rows.filter(isActiveSalary)
  const { month, year } = currentPeriod()
  const totalSalaryBurnEur = active.reduce((s, r) => s + amountToEur(r), 0)
  const paidThisMonthEur = active
    .filter(
      (r) =>
        r.status === "paid" && r.month === month && r.year === year
    )
    .reduce((s, r) => s + amountToEur(r), 0)
  const pendingPayoutsCount = active.filter((r) => r.status === "pending").length
  const partialPaymentsCount = active.filter((r) => r.status === "partial").length
  const proofCompletionPercent =
    active.length === 0
      ? 0
      : Math.round(
          active.reduce((s, r) => s + proofPercent(r), 0) / active.length
        )

  return {
    totalSalaryBurnEur,
    paidThisMonthEur,
    pendingPayoutsCount,
    partialPaymentsCount,
    proofCompletionPercent,
  }
}

export type SalaryBurnTrendPoint = {
  period: string
  total: number
  paid: number
  pending: number
}

function periodKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function buildSalaryBurnTrendSeries(
  rows: SalaryPaymentListItem[]
): SalaryBurnTrendPoint[] {
  const active = rows.filter(isActiveSalary)
  const buckets = new Map<string, { total: number; paid: number; pending: number }>()

  for (const row of active) {
    const key = periodKey(row.month, row.year)
    const eur = amountToEur(row)
    const b = buckets.get(key) ?? { total: 0, paid: 0, pending: 0 }
    b.total += eur
    if (row.status === "paid") b.paid += eur
    else b.pending += eur
    buckets.set(key, b)
  }

  const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))
  const recent = sorted.slice(-6)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  if (recent.length === 0) {
    return [
      { period: "Jan", total: 0, paid: 0, pending: 0 },
      { period: "Feb", total: 0, paid: 0, pending: 0 },
      { period: "Mar", total: 0, paid: 0, pending: 0 },
    ]
  }

  return recent.map(([key, v]) => {
    const [, mm] = key.split("-")
    return {
      period: monthNames[Number(mm) - 1] ?? key,
      total: Math.round(v.total),
      paid: Math.round(v.paid),
      pending: Math.round(v.pending),
    }
  })
}

export type PayoutStatusSlice = {
  name: string
  value: number
  fill: string
  token: SoftStatusToken
}

export function buildPayoutStatusBreakdown(
  rows: SalaryPaymentListItem[]
): PayoutStatusSlice[] {
  const active = rows.filter(isActiveSalary)
  let paid = 0
  let pending = 0
  let partial = 0
  let scheduled = 0

  for (const row of active) {
    const eur = amountToEur(row)
    if (row.status === "paid") paid += eur
    else if (row.status === "partial") partial += eur
    else if (isScheduledPayout(row)) scheduled += eur
    else pending += eur
  }

  const slices: PayoutStatusSlice[] = [
    { name: "Paid", value: Math.round(paid), fill: "var(--af-success)", token: "paid" },
    {
      name: "Pending",
      value: Math.round(pending),
      fill: "var(--af-warning)",
      token: "pending",
    },
    {
      name: "Partial",
      value: Math.round(partial),
      fill: "var(--af-primary-blue)",
      token: "partial",
    },
    {
      name: "Scheduled",
      value: Math.round(scheduled),
      fill: "var(--af-secondary-teal)",
      token: "scheduled",
    },
  ]
  return slices.filter((s) => s.value > 0)
}

export function buildPayrollFocusItems(
  rows: SalaryPaymentListItem[]
): FocusPanelItem[] {
  const active = rows.filter(isActiveSalary)
  const pending = active.filter((r) => r.status === "pending").length
  const partial = active.filter((r) => r.status === "partial").length
  const missingProof = active.filter((r) => proofPercent(r) < 100).length
  const inactiveReview = active.filter(
    (r) => r.status === "pending" && !r.payment_date && !r.transaction_reference
  ).length

  return [
    {
      title: "Pending Payouts",
      subtitle: "Awaiting full payment",
      value: pending,
      tone: "amber",
    },
    {
      title: "Partial Payments",
      subtitle: "Incomplete payout",
      value: partial,
      tone: "blue",
    },
    {
      title: "Missing Proofs",
      subtitle: "Checklist incomplete",
      value: missingProof,
      tone: "red",
    },
    {
      title: "Inactive Team Review",
      subtitle: "Pending without schedule",
      value: inactiveReview,
      tone: "gray",
    },
  ]
}

export type SalaryProofChecklistItem = {
  label: string
  percent: number
}

export function buildSalaryProofChecklist(
  rows: SalaryPaymentListItem[]
): SalaryProofChecklistItem[] {
  const active = rows.filter(isActiveSalary)
  if (active.length === 0) {
    return [
      { label: "Payment Proof", percent: 0 },
      { label: "Bank Reference", percent: 0 },
      { label: "Approval Note", percent: 0 },
      { label: "Team Record", percent: 0 },
      { label: "Notes Complete", percent: 0 },
    ]
  }

  const totals = active.reduce(
    (acc, row) => {
      const c = proofChecks(row)
      if (c.paymentProof) acc.paymentProof += 1
      if (c.bankReference) acc.bankReference += 1
      if (c.approvalNote) acc.approvalNote += 1
      if (c.teamRecord) acc.teamRecord += 1
      if (c.notesComplete) acc.notesComplete += 1
      return acc
    },
    {
      paymentProof: 0,
      bankReference: 0,
      approvalNote: 0,
      teamRecord: 0,
      notesComplete: 0,
    }
  )

  const pct = (n: number) => Math.round((n / active.length) * 100)

  return [
    { label: "Payment Proof", percent: pct(totals.paymentProof) },
    { label: "Bank Reference", percent: pct(totals.bankReference) },
    { label: "Approval Note", percent: pct(totals.approvalNote) },
    { label: "Team Record", percent: pct(totals.teamRecord) },
    { label: "Notes Complete", percent: pct(totals.notesComplete) },
  ]
}

export type TeamPayoutSummaryRow = {
  label: string
  headcount: number
  monthlyEur: number
  status: string
}

export function buildTeamPayoutSummary(
  rows: SalaryPaymentListItem[]
): TeamPayoutSummaryRow[] {
  const active = rows.filter(isActiveSalary)
  const { month, year } = currentPeriod()

  return TEAM_BUCKETS.map((label) => {
    const bucketRows = active.filter((r) => roleBucket(r.member_role) === label)
    const currentRows = bucketRows.filter(
      (r) => r.month === month && r.year === year
    )
    const monthlyEur = currentRows.reduce((s, r) => s + amountToEur(r), 0)
    const paidCount = currentRows.filter((r) => r.status === "paid").length
    const status =
      bucketRows.length === 0
        ? "No lines"
        : paidCount === currentRows.length && currentRows.length > 0
          ? "Paid"
          : paidCount > 0
            ? "Partial"
            : "Pending"

    return {
      label,
      headcount: new Set(bucketRows.map((r) => r.team_member_id)).size,
      monthlyEur: Math.round(monthlyEur),
      status,
    }
  })
}

export function buildSalaryLifecycleStages(
  rows: SalaryPaymentListItem[]
): LifecyclePipelineStage[] {
  const active = rows.filter(isActiveSalary)
  const draft = active.filter(
    (r) => r.status === "pending" && !r.payment_date && !r.transaction_reference
  ).length
  const scheduled = active.filter(isScheduledPayout).length
  const paid = active.filter((r) => r.status === "paid").length
  const proofComplete = active.filter(isProofComplete).length
  const closed = active.filter(
    (r) => r.status === "paid" && isProofComplete(r)
  ).length

  return [
    { label: "Draft", count: draft, tone: "gray" },
    { label: "Scheduled", count: scheduled, tone: "blue" },
    { label: "Paid", count: paid, tone: "green" },
    { label: "Proof Complete", count: proofComplete, tone: "teal" },
    { label: "Closed", count: closed, tone: "purple" },
  ]
}

export function displayReference(row: SalaryPaymentListItem): string {
  const ref = row.transaction_reference?.trim()
  if (!ref) return "—"
  return ref.length > 18 ? `${ref.slice(0, 18)}…` : ref
}
