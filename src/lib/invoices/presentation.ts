import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"
import type { InvoiceListItem } from "@/lib/supabase/types"
import type { InvoiceStatus } from "@/types"

/** Presentation-only labels — never show raw client names on the invoices list UI. */
const DUMMY_CLIENTS = [
  "Client Alpha",
  "Client Beta",
  "Client Gamma",
  "Client Delta",
] as const

const FINANCE_TO_SOFT: Partial<Record<InvoiceStatus, SoftStatusToken>> = {
  draft: "draft",
  sent: "sent",
  paid: "paid",
  overdue: "overdue",
  cancelled: "cancelled",
}

function hashClientId(clientId: string): number {
  let h = 0
  for (let i = 0; i < clientId.length; i++) {
    h = (h + clientId.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export function displayClientLabel(row: InvoiceListItem): string {
  return DUMMY_CLIENTS[hashClientId(row.client_id) % DUMMY_CLIENTS.length]
}

export function invoiceStatusToSoftToken(status: InvoiceStatus): SoftStatusToken {
  return FINANCE_TO_SOFT[status] ?? "draft"
}

export function invoiceNumberDisplay(row: InvoiceListItem): string {
  return row.invoice_number?.trim() || row.id.slice(0, 12)
}

export function formatPeriodLabel(row: InvoiceListItem): string {
  if (row.year != null && row.month != null && row.period_code) {
    const mm = String(row.month).padStart(2, "0")
    return `${row.year}-${mm} · ${row.period_code}`
  }
  if (row.period_code) return row.period_code
  return "—"
}

export function proofChecks(row: InvoiceListItem) {
  return {
    invoicePdf: Boolean(row.invoice_number?.trim()),
    workReport: row.hours != null && row.hours > 0,
    emailProof: Boolean(row.sent_date),
    paymentProof: Boolean(row.paid_date || row.payment_reference?.trim()),
  }
}

export function proofPercent(row: InvoiceListItem): number {
  const c = proofChecks(row)
  const done = [c.invoicePdf, c.workReport, c.emailProof, c.paymentProof].filter(
    Boolean
  ).length
  return Math.round((done / 4) * 100)
}

export function isProofComplete(row: InvoiceListItem): boolean {
  return proofPercent(row) === 100
}

export function isActiveInvoice(row: InvoiceListItem): boolean {
  return row.status !== "cancelled" && row.deleted_at == null
}

export type InvoiceKpiSummary = {
  totalInvoicedEur: number
  paidCount: number
  pendingCollectionEur: number
  overdueAmountEur: number
  proofCompletionPercent: number
}

export function buildInvoiceKpis(rows: InvoiceListItem[]): InvoiceKpiSummary {
  const active = rows.filter(isActiveInvoice)
  const totalInvoicedEur = active.reduce((s, r) => s + r.amount, 0)
  const paidCount = active.filter((r) => r.status === "paid").length
  const pendingCollectionEur = active
    .filter((r) => r.status === "sent" || r.status === "overdue")
    .reduce((s, r) => s + r.amount, 0)
  const overdueAmountEur = active
    .filter((r) => r.status === "overdue")
    .reduce((s, r) => s + r.amount, 0)
  const proofCompletionPercent =
    active.length === 0
      ? 0
      : Math.round(
          active.reduce((s, r) => s + proofPercent(r), 0) / active.length
        )

  return {
    totalInvoicedEur,
    paidCount,
    pendingCollectionEur,
    overdueAmountEur,
    proofCompletionPercent,
  }
}

export function buildCollectionFocusItems(rows: InvoiceListItem[]): FocusPanelItem[] {
  const active = rows.filter(isActiveInvoice)
  const overdue = active.filter((r) => r.status === "overdue").length
  const awaiting = active.filter(
    (r) => (r.status === "sent" || r.status === "overdue") && !r.paid_date
  ).length
  const missingProof = active.filter((r) => proofPercent(r) < 100).length
  const readyClose = active.filter(
    (r) => r.status === "paid" && isProofComplete(r)
  ).length

  return [
    {
      title: "Overdue invoices",
      subtitle: "Past due date",
      value: overdue,
      tone: "red",
    },
    {
      title: "Awaiting payment",
      subtitle: "Sent, not yet paid",
      value: awaiting,
      tone: "amber",
    },
    {
      title: "Missing proof items",
      subtitle: "Checklist incomplete",
      value: missingProof,
      tone: "amber",
    },
    {
      title: "Ready for monthly close",
      subtitle: "Paid with full proof",
      value: readyClose,
      tone: "green",
    },
  ]
}

export function buildLifecycleStages(rows: InvoiceListItem[]): LifecyclePipelineStage[] {
  const active = rows.filter(isActiveInvoice)
  const draft = active.filter((r) => r.status === "draft").length
  const sent = active.filter((r) => r.status === "sent").length
  const paid = active.filter((r) => r.status === "paid").length
  const proofComplete = active.filter(isProofComplete).length
  const closed = active.filter(
    (r) => r.status === "paid" && isProofComplete(r)
  ).length

  return [
    { label: "Draft", count: draft, tone: "gray" },
    { label: "Sent", count: sent, tone: "blue" },
    { label: "Paid", count: paid, tone: "green" },
    { label: "Proof Complete", count: proofComplete, tone: "teal" },
    { label: "Closed", count: closed, tone: "purple" },
  ]
}

export type ProofChecklistItem = {
  label: string
  percent: number
}

export function buildProofChecklistOverview(
  rows: InvoiceListItem[]
): ProofChecklistItem[] {
  const active = rows.filter(isActiveInvoice)
  if (active.length === 0) {
    return [
      { label: "Invoice PDF", percent: 0 },
      { label: "Work Report", percent: 0 },
      { label: "Email Proof", percent: 0 },
      { label: "Payment Proof", percent: 0 },
    ]
  }

  const totals = active.reduce(
    (acc, row) => {
      const c = proofChecks(row)
      if (c.invoicePdf) acc.invoicePdf += 1
      if (c.workReport) acc.workReport += 1
      if (c.emailProof) acc.emailProof += 1
      if (c.paymentProof) acc.paymentProof += 1
      return acc
    },
    { invoicePdf: 0, workReport: 0, emailProof: 0, paymentProof: 0 }
  )

  const pct = (n: number) => Math.round((n / active.length) * 100)

  return [
    { label: "Invoice PDF", percent: pct(totals.invoicePdf) },
    { label: "Work Report", percent: pct(totals.workReport) },
    { label: "Email Proof", percent: pct(totals.emailProof) },
    { label: "Payment Proof", percent: pct(totals.paymentProof) },
  ]
}

export function paymentSoftStatus(row: InvoiceListItem): SoftStatusToken {
  if (row.paid_date) return "paid"
  if (row.status === "overdue") return "overdue"
  return "pending"
}
