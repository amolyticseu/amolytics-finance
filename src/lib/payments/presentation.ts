import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"
import type {
  PaymentDirection,
  PaymentListItem,
  PaymentTypeDb,
} from "@/lib/supabase/types"

const DUMMY_PAYERS = [
  "Client Alpha",
  "Client Beta",
  "Vendor Nova",
  "Team Member 01",
] as const

const GENERIC_ACCOUNTS = [
  "Main Account",
  "Payroll Account",
  "Operations Account",
  "Reserve Account",
] as const

export const PAYMENT_TYPE_LABEL: Record<PaymentTypeDb, string> = {
  client_receipt: "Client receipt",
  salary: "Salary",
  expense: "Expense",
  transfer: "Transfer",
  other: "Other",
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export function displayPayerPayeeLabel(row: PaymentListItem): string {
  if (row.payment_type === "salary") return "Team Member 01"
  if (row.payment_type === "expense") return "Vendor Nova"
  if (row.payment_type === "client_receipt") {
    return DUMMY_PAYERS[hashId(row.id) % 2]
  }
  return DUMMY_PAYERS[hashId(row.payer_payee_name ?? row.id) % DUMMY_PAYERS.length]
}

export function displayAccountLabel(row: PaymentListItem): string {
  return GENERIC_ACCOUNTS[hashId(row.bank_account_id) % GENERIC_ACCOUNTS.length]
}

export function formatPaymentType(t: PaymentTypeDb): string {
  return PAYMENT_TYPE_LABEL[t] ?? t
}

export function directionSoftStatus(direction: PaymentDirection): {
  token: SoftStatusToken
  label: string
} {
  return direction === "in"
    ? { token: "primary", label: "In" }
    : { token: "secondary", label: "Out" }
}

/** Page header subtitle for edit/view — no real amounts, dates, or payer names. */
export function displayPaymentEditDescription(row: PaymentListItem): string {
  const dir = directionSoftStatus(row.direction)
  return `${dir.label} · ${formatPaymentType(row.payment_type)} · ${displayPayerPayeeLabel(row)}`
}

export function isActivePayment(row: PaymentListItem): boolean {
  return row.deleted_at == null
}

export function isLinked(row: PaymentListItem): boolean {
  return Boolean(row.invoice_id || row.salary_payment_id || row.expense_id)
}

export function isUnmapped(row: PaymentListItem): boolean {
  return isActivePayment(row) && !isLinked(row)
}

export function proofChecks(row: PaymentListItem) {
  return {
    bankConfirmation: Boolean(row.reference?.trim()),
    screenshot: Boolean(row.reference?.trim() && row.reference.trim().length >= 6),
    emailProof: Boolean(row.payer_payee_name?.trim()),
    linkedInvoice: isLinked(row),
    notesComplete: Boolean(row.notes?.trim()),
  }
}

export function proofPercent(row: PaymentListItem): number {
  const c = proofChecks(row)
  const done = [
    c.bankConfirmation,
    c.screenshot,
    c.emailProof,
    c.linkedInvoice,
    c.notesComplete,
  ].filter(Boolean).length
  return Math.round((done / 5) * 100)
}

export function isProofComplete(row: PaymentListItem): boolean {
  return proofPercent(row) === 100
}

export function paymentStatusSoftToken(row: PaymentListItem): SoftStatusToken {
  if (row.deleted_at) return "inactive"
  if (!isLinked(row)) return "unmapped"
  if (!isProofComplete(row)) return "pending_proof"
  return "completed"
}

export type LinkedRecordDisplay = {
  label: string
  token: SoftStatusToken
}

export function linkedRecordDisplay(row: PaymentListItem): LinkedRecordDisplay {
  if (row.invoice_id) {
    const ref = row.invoice_number?.trim()
    return {
      label: ref ? `Invoice · ${ref.slice(0, 12)}` : "Invoice linked",
      token: "primary",
    }
  }
  if (row.salary_payment_id) {
    return { label: "Salary run", token: "recurring" }
  }
  if (row.expense_id) {
    return { label: "Expense linked", token: "partial" }
  }
  return { label: "Unmapped", token: "unmapped" }
}

export type PaymentKpiSummary = {
  totalInflowEur: number
  totalOutflowEur: number
  netMovementEur: number
  unmappedCount: number
  proofCompletionPercent: number
}

export function buildPaymentKpis(rows: PaymentListItem[]): PaymentKpiSummary {
  const active = rows.filter(isActivePayment)
  let inflow = 0
  let outflow = 0
  for (const row of active) {
    if (row.currency !== "EUR") continue
    if (row.direction === "in") inflow += row.amount
    else outflow += row.amount
  }
  const unmappedCount = active.filter(isUnmapped).length
  const proofCompletionPercent =
    active.length === 0
      ? 0
      : Math.round(
          active.reduce((s, r) => s + proofPercent(r), 0) / active.length
        )

  return {
    totalInflowEur: inflow,
    totalOutflowEur: outflow,
    netMovementEur: inflow - outflow,
    unmappedCount,
    proofCompletionPercent,
  }
}

export type CashMovementPoint = {
  period: string
  inflow: number
  outflow: number
  net: number
}

function periodKey(date: string): string | null {
  const m = date.match(/^(\d{4})-(\d{2})/)
  if (!m) return null
  return `${m[1]}-${m[2]}`
}

export function buildCashMovementSeries(
  rows: PaymentListItem[]
): CashMovementPoint[] {
  const active = rows.filter(isActivePayment)
  const buckets = new Map<string, { inflow: number; outflow: number }>()

  for (const row of active) {
    if (row.currency !== "EUR") continue
    const key = periodKey(row.payment_date)
    if (!key) continue
    const b = buckets.get(key) ?? { inflow: 0, outflow: 0 }
    if (row.direction === "in") b.inflow += row.amount
    else b.outflow += row.amount
    buckets.set(key, b)
  }

  const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))
  const recent = sorted.slice(-6)

  if (recent.length === 0) {
    return [
      { period: "Jan", inflow: 0, outflow: 0, net: 0 },
      { period: "Feb", inflow: 0, outflow: 0, net: 0 },
      { period: "Mar", inflow: 0, outflow: 0, net: 0 },
    ]
  }

  return recent.map(([key, v]) => {
    const [, mm] = key.split("-")
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
    const label = monthNames[Number(mm) - 1] ?? key
    return {
      period: label,
      inflow: Math.round(v.inflow),
      outflow: Math.round(v.outflow),
      net: Math.round(v.inflow - v.outflow),
    }
  })
}

export type BankDistributionSlice = {
  name: string
  value: number
  fill: string
}

export function buildBankDistribution(
  rows: PaymentListItem[]
): BankDistributionSlice[] {
  const active = rows.filter((r) => isActivePayment(r) && r.currency === "EUR")
  const totals = new Map<string, number>()

  for (const account of GENERIC_ACCOUNTS) {
    totals.set(account, 0)
  }

  for (const row of active) {
    const label = displayAccountLabel(row)
    totals.set(label, (totals.get(label) ?? 0) + row.amount)
  }

  const fills: Record<string, string> = {
    "Main Account": "var(--af-primary-blue)",
    "Payroll Account": "var(--af-secondary-teal)",
    "Operations Account": "var(--af-warning)",
    "Reserve Account": "var(--af-purple)",
  }

  return GENERIC_ACCOUNTS.map((name) => ({
    name,
    value: Math.round(totals.get(name) ?? 0),
    fill: fills[name],
  })).filter((s) => s.value > 0)
}

export function buildReconciliationFocusItems(
  rows: PaymentListItem[]
): FocusPanelItem[] {
  const active = rows.filter(isActivePayment)
  const unmapped = active.filter(isUnmapped).length
  const missingProof = active.filter((r) => proofPercent(r) < 100).length
  const referencesToVerify = active.filter(
    (r) => !r.reference?.trim() && isLinked(r)
  ).length
  const bankMismatch = active.filter(
    (r) => isLinked(r) && !r.reference?.trim() && r.direction === "in"
  ).length

  return [
    {
      title: "Unmapped payments",
      subtitle: "No invoice, salary, or expense link",
      value: unmapped,
      tone: "red",
    },
    {
      title: "Missing proofs",
      subtitle: "Checklist incomplete",
      value: missingProof,
      tone: "amber",
    },
    {
      title: "References to verify",
      subtitle: "Linked but no reference",
      value: referencesToVerify,
      tone: "amber",
    },
    {
      title: "Bank mismatch",
      subtitle: "Inflow without reference",
      value: bankMismatch,
      tone: "red",
    },
  ]
}

export function buildPaymentLifecycleStages(
  rows: PaymentListItem[]
): LifecyclePipelineStage[] {
  const active = rows.filter(isActivePayment)
  const detected = active.length
  const linked = active.filter(isLinked).length
  const verified = active.filter((r) => Boolean(r.reference?.trim())).length
  const proofComplete = active.filter(isProofComplete).length
  const closed = active.filter(
    (r) => isLinked(r) && isProofComplete(r)
  ).length

  return [
    { label: "Detected", count: detected, tone: "gray" },
    { label: "Linked", count: linked, tone: "blue" },
    { label: "Verified", count: verified, tone: "teal" },
    { label: "Proof Complete", count: proofComplete, tone: "green" },
    { label: "Closed", count: closed, tone: "purple" },
  ]
}

export type PaymentProofChecklistItem = {
  label: string
  percent: number
}

export function buildPaymentProofChecklist(
  rows: PaymentListItem[]
): PaymentProofChecklistItem[] {
  const active = rows.filter(isActivePayment)
  if (active.length === 0) {
    return [
      { label: "Bank Confirmation", percent: 0 },
      { label: "Screenshot", percent: 0 },
      { label: "Email Proof", percent: 0 },
      { label: "Linked Invoice", percent: 0 },
      { label: "Notes Complete", percent: 0 },
    ]
  }

  const totals = active.reduce(
    (acc, row) => {
      const c = proofChecks(row)
      if (c.bankConfirmation) acc.bankConfirmation += 1
      if (c.screenshot) acc.screenshot += 1
      if (c.emailProof) acc.emailProof += 1
      if (c.linkedInvoice) acc.linkedInvoice += 1
      if (c.notesComplete) acc.notesComplete += 1
      return acc
    },
    {
      bankConfirmation: 0,
      screenshot: 0,
      emailProof: 0,
      linkedInvoice: 0,
      notesComplete: 0,
    }
  )

  const pct = (n: number) => Math.round((n / active.length) * 100)

  return [
    { label: "Bank Confirmation", percent: pct(totals.bankConfirmation) },
    { label: "Screenshot", percent: pct(totals.screenshot) },
    { label: "Email Proof", percent: pct(totals.emailProof) },
    { label: "Linked Invoice", percent: pct(totals.linkedInvoice) },
    { label: "Notes Complete", percent: pct(totals.notesComplete) },
  ]
}
