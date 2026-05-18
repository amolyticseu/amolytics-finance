import { inrToEur } from "@/data/mock/constants"
import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"
import type { ExpenseListItem } from "@/lib/supabase/types"
import type { ExpenseCategoryDb, ExpenseStatus } from "@/types"

const DUMMY_VENDORS = ["Vendor Alpha", "Vendor Beta", "Vendor Nova"] as const
const DUMMY_CLIENTS = ["Client Alpha", "Client Beta", "Client Gamma"] as const
const GENERIC_ACCOUNTS = [
  "Main Account",
  "Operations Account",
  "Reserve Account",
] as const

export type BreakdownCategory =
  | "Operations"
  | "Team"
  | "Software"
  | "Infrastructure"
  | "Compliance"
  | "Misc"

const BREAKDOWN_FILLS: Record<BreakdownCategory, string> = {
  Operations: "var(--af-warning)",
  Team: "var(--af-primary-blue)",
  Software: "var(--af-purple)",
  Infrastructure: "var(--af-secondary-teal)",
  Compliance: "var(--af-danger)",
  Misc: "var(--af-text-muted)",
}

const STATUS_TO_SOFT: Partial<Record<ExpenseStatus, SoftStatusToken>> = {
  pending: "pending",
  paid: "paid",
  overdue: "overdue",
  cancelled: "cancelled",
}

const CATEGORY_LABEL: Record<ExpenseCategoryDb, string> = {
  emi: "EMI",
  rent: "Rent",
  utilities: "Utilities",
  subscription: "Subscription",
  workspace: "Workspace",
  tax: "Tax",
  compliance: "Compliance",
  other: "Other",
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export function amountToEur(row: ExpenseListItem): number {
  if (row.currency === "EUR") return row.amount
  if (row.currency === "INR") return inrToEur(row.amount)
  return row.amount
}

export function isActiveExpense(row: ExpenseListItem): boolean {
  return row.deleted_at == null && row.status !== "cancelled"
}

export function displayVendorLabel(row: ExpenseListItem): string {
  return DUMMY_VENDORS[hashId(row.id) % DUMMY_VENDORS.length]
}

export function displayClientLabel(row: ExpenseListItem): string {
  if (!row.linked_client_id) return "—"
  return DUMMY_CLIENTS[hashId(row.linked_client_id) % DUMMY_CLIENTS.length]
}

export function displayAccountLabel(row: ExpenseListItem): string {
  if (!row.bank_account_id) return "—"
  return GENERIC_ACCOUNTS[hashId(row.bank_account_id) % GENERIC_ACCOUNTS.length]
}

export function formatCategoryLabel(cat: ExpenseCategoryDb): string {
  return CATEGORY_LABEL[cat] ?? cat
}

export function categorySoftToken(cat: ExpenseCategoryDb): SoftStatusToken {
  const map: Partial<Record<ExpenseCategoryDb, SoftStatusToken>> = {
    emi: "secondary",
    rent: "pending",
    utilities: "database",
    subscription: "recurring",
    workspace: "primary",
    tax: "urgent",
    compliance: "blocked",
    other: "draft",
  }
  return map[cat] ?? "draft"
}

export function expenseStatusSoftToken(status: ExpenseStatus): SoftStatusToken {
  return STATUS_TO_SOFT[status] ?? "pending"
}

export function breakdownCategory(row: ExpenseListItem): BreakdownCategory {
  switch (row.category) {
    case "subscription":
      return "Software"
    case "utilities":
    case "rent":
      return "Infrastructure"
    case "emi":
      return "Team"
    case "compliance":
    case "tax":
      return "Compliance"
    case "workspace":
    case "other":
      return "Operations"
    default:
      return "Misc"
  }
}

export function proofChecks(row: ExpenseListItem) {
  return {
    paymentProof: Boolean(row.payment_reference?.trim()),
    invoiceReceipt: row.rebillable && Boolean(row.linked_client_id),
    emailConfirmation: Boolean(row.notes?.trim() && row.notes.trim().length >= 8),
    notesComplete: Boolean(row.notes?.trim()),
    linkedRecord: Boolean(row.linked_client_id || row.bank_account_id),
  }
}

export function proofPercent(row: ExpenseListItem): number {
  const c = proofChecks(row)
  const done = [
    c.paymentProof,
    c.invoiceReceipt,
    c.emailConfirmation,
    c.notesComplete,
    c.linkedRecord,
  ].filter(Boolean).length
  return Math.round((done / 5) * 100)
}

export function isProofComplete(row: ExpenseListItem): boolean {
  return proofPercent(row) === 100
}

export type ExpenseKpiSummary = {
  totalExpensesEur: number
  recurringBurnEur: number
  rebillablePendingEur: number
  overdueExpensesEur: number
  proofCompletionPercent: number
}

export function buildExpenseKpis(rows: ExpenseListItem[]): ExpenseKpiSummary {
  const active = rows.filter(isActiveExpense)
  const totalExpensesEur = active.reduce((s, r) => s + amountToEur(r), 0)
  const recurringBurnEur = active
    .filter((r) => r.recurring)
    .reduce((s, r) => s + amountToEur(r), 0)
  const rebillablePendingEur = active
    .filter((r) => r.rebillable && r.status === "pending")
    .reduce((s, r) => s + amountToEur(r), 0)
  const overdueExpensesEur = active
    .filter((r) => r.status === "overdue")
    .reduce((s, r) => s + amountToEur(r), 0)
  const proofCompletionPercent =
    active.length === 0
      ? 0
      : Math.round(
          active.reduce((s, r) => s + proofPercent(r), 0) / active.length
        )

  return {
    totalExpensesEur,
    recurringBurnEur,
    rebillablePendingEur,
    overdueExpensesEur,
    proofCompletionPercent,
  }
}

export type ExpenseTrendPoint = {
  period: string
  total: number
  recurring: number
  rebillable: number
}

function periodKey(date: string): string | null {
  const m = date.match(/^(\d{4})-(\d{2})/)
  if (!m) return null
  return `${m[1]}-${m[2]}`
}

export function buildExpenseTrendSeries(rows: ExpenseListItem[]): ExpenseTrendPoint[] {
  const active = rows.filter(isActiveExpense)
  const buckets = new Map<
    string,
    { total: number; recurring: number; rebillable: number }
  >()

  for (const row of active) {
    const key = periodKey(row.expense_date)
    if (!key) continue
    const eur = amountToEur(row)
    const b = buckets.get(key) ?? { total: 0, recurring: 0, rebillable: 0 }
    b.total += eur
    if (row.recurring) b.recurring += eur
    if (row.rebillable) b.rebillable += eur
    buckets.set(key, b)
  }

  const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))
  const recent = sorted.slice(-6)

  if (recent.length === 0) {
    return [
      { period: "Jan", total: 0, recurring: 0, rebillable: 0 },
      { period: "Feb", total: 0, recurring: 0, rebillable: 0 },
      { period: "Mar", total: 0, recurring: 0, rebillable: 0 },
    ]
  }

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

  return recent.map(([key, v]) => {
    const [, mm] = key.split("-")
    return {
      period: monthNames[Number(mm) - 1] ?? key,
      total: Math.round(v.total),
      recurring: Math.round(v.recurring),
      rebillable: Math.round(v.rebillable),
    }
  })
}

export type CategoryBreakdownSlice = {
  name: BreakdownCategory
  value: number
  fill: string
}

export function buildCategoryBreakdown(
  rows: ExpenseListItem[]
): CategoryBreakdownSlice[] {
  const active = rows.filter(isActiveExpense)
  const totals = new Map<BreakdownCategory, number>()

  for (const cat of [
    "Operations",
    "Team",
    "Software",
    "Infrastructure",
    "Compliance",
    "Misc",
  ] as BreakdownCategory[]) {
    totals.set(cat, 0)
  }

  for (const row of active) {
    const cat = breakdownCategory(row)
    totals.set(cat, (totals.get(cat) ?? 0) + amountToEur(row))
  }

  return (
    [
      "Operations",
      "Team",
      "Software",
      "Infrastructure",
      "Compliance",
      "Misc",
    ] as BreakdownCategory[]
  ).map((name) => ({
    name,
    value: Math.round(totals.get(name) ?? 0),
    fill: BREAKDOWN_FILLS[name],
  }))
}

export function buildRebillableFocusItems(rows: ExpenseListItem[]): FocusPanelItem[] {
  const active = rows.filter(isActiveExpense)
  const pendingRecovery = active.filter(
    (r) => r.rebillable && r.status === "pending"
  ).length
  const billedUnrecovered = active.filter(
    (r) => r.rebillable && r.status === "paid" && !isProofComplete(r)
  ).length
  const recoveredThisMonth = active.filter(
    (r) => r.rebillable && r.status === "paid" && isProofComplete(r)
  ).length
  const missingInvoiceLink = active.filter(
    (r) => r.rebillable && !r.linked_client_id
  ).length

  return [
    {
      title: "Pending Recovery",
      subtitle: "Rebillable, not yet collected",
      value: pendingRecovery,
      tone: "amber",
    },
    {
      title: "Billed but Unrecovered",
      subtitle: "Paid, proof incomplete",
      value: billedUnrecovered,
      tone: "red",
    },
    {
      title: "Recovered This Month",
      subtitle: "Paid with full proof",
      value: recoveredThisMonth,
      tone: "green",
    },
    {
      title: "Missing Invoice Link",
      subtitle: "Rebillable without client",
      value: missingInvoiceLink,
      tone: "amber",
    },
  ]
}

export type RecurringBurnRow = {
  label: string
  monthlyEur: number
  annualEur: number
  nextDue: string
  status: string
}

function burnBucket(row: ExpenseListItem): string {
  if (row.category === "subscription") return "Software"
  if (row.category === "utilities" || row.category === "rent") {
    return "Infrastructure"
  }
  if (row.category === "workspace") return "Workspace"
  if (row.category === "compliance" || row.category === "tax") return "Compliance"
  return "Operations"
}

export function buildRecurringBurn(rows: ExpenseListItem[]): RecurringBurnRow[] {
  const labels = [
    "Software",
    "Infrastructure",
    "Workspace",
    "Operations",
    "Compliance",
  ] as const
  const active = rows.filter((r) => isActiveExpense(r) && r.recurring)

  return labels.map((label) => {
    const bucketRows = active.filter((r) => burnBucket(r) === label)
    const monthlyEur = bucketRows.reduce((s, r) => s + amountToEur(r), 0)
    const nextRow = bucketRows.sort((a, b) =>
      (a.due_date ?? a.expense_date).localeCompare(b.due_date ?? b.expense_date)
    )[0]
    const nextDue = nextRow?.due_date ?? nextRow?.expense_date ?? "—"
    const status =
      bucketRows.length === 0
        ? "No lines"
        : bucketRows.some((r) => r.status === "overdue")
          ? "Attention"
          : "On track"

    return {
      label,
      monthlyEur: Math.round(monthlyEur),
      annualEur: Math.round(monthlyEur * 12),
      nextDue,
      status,
    }
  })
}

export function buildExpenseLifecycleStages(
  rows: ExpenseListItem[]
): LifecyclePipelineStage[] {
  const active = rows.filter(isActiveExpense)
  const recorded = active.length
  const approved = active.filter((r) => r.status !== "pending").length
  const paid = active.filter((r) => r.status === "paid").length
  const proofComplete = active.filter(isProofComplete).length
  const closed = active.filter(
    (r) => r.status === "paid" && isProofComplete(r)
  ).length

  return [
    { label: "Recorded", count: recorded, tone: "gray" },
    { label: "Approved", count: approved, tone: "blue" },
    { label: "Paid", count: paid, tone: "green" },
    { label: "Proof Complete", count: proofComplete, tone: "teal" },
    { label: "Closed", count: closed, tone: "purple" },
  ]
}

export type ExpenseProofChecklistItem = {
  label: string
  percent: number
}

export function buildExpenseProofChecklist(
  rows: ExpenseListItem[]
): ExpenseProofChecklistItem[] {
  const active = rows.filter(isActiveExpense)
  if (active.length === 0) {
    return [
      { label: "Payment Proof", percent: 0 },
      { label: "Invoice / Receipt", percent: 0 },
      { label: "Email Confirmation", percent: 0 },
      { label: "Notes Complete", percent: 0 },
      { label: "Linked Record", percent: 0 },
    ]
  }

  const totals = active.reduce(
    (acc, row) => {
      const c = proofChecks(row)
      if (c.paymentProof) acc.paymentProof += 1
      if (c.invoiceReceipt) acc.invoiceReceipt += 1
      if (c.emailConfirmation) acc.emailConfirmation += 1
      if (c.notesComplete) acc.notesComplete += 1
      if (c.linkedRecord) acc.linkedRecord += 1
      return acc
    },
    {
      paymentProof: 0,
      invoiceReceipt: 0,
      emailConfirmation: 0,
      notesComplete: 0,
      linkedRecord: 0,
    }
  )

  const pct = (n: number) => Math.round((n / active.length) * 100)

  return [
    { label: "Payment Proof", percent: pct(totals.paymentProof) },
    { label: "Invoice / Receipt", percent: pct(totals.invoiceReceipt) },
    { label: "Email Confirmation", percent: pct(totals.emailConfirmation) },
    { label: "Notes Complete", percent: pct(totals.notesComplete) },
    { label: "Linked Record", percent: pct(totals.linkedRecord) },
  ]
}

export function displayPaymentRef(row: ExpenseListItem): string {
  const ref = row.payment_reference?.trim()
  if (!ref) return "—"
  return ref.length > 20 ? `${ref.slice(0, 20)}…` : ref
}
