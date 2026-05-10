import { CLIENT_LABEL } from "@/data/mock/constants"
import { mockPayments } from "@/data/mock/tables"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type {
  PaymentDirection,
  PaymentListItem,
  PaymentRow,
  PaymentTypeDb,
} from "@/lib/supabase/types"

export type PaymentDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback payments.`,
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

const PAYMENT_TYPES: readonly PaymentTypeDb[] = [
  "client_receipt",
  "salary",
  "expense",
  "transfer",
  "other",
]

const DIRECTIONS: readonly PaymentDirection[] = ["in", "out"]

function normalizePaymentType(value: unknown): PaymentTypeDb {
  const s = typeof value === "string" ? value : ""
  if (PAYMENT_TYPES.includes(s as PaymentTypeDb)) return s as PaymentTypeDb
  return "other"
}

function normalizeDirection(value: unknown): PaymentDirection {
  const s = typeof value === "string" ? value : ""
  if (DIRECTIONS.includes(s as PaymentDirection)) return s as PaymentDirection
  return "in"
}

function formatBankDisplay(
  accountName: string | null,
  institutionName: string | null
): string | null {
  const a = accountName?.trim() ?? ""
  const i = institutionName?.trim() ?? ""
  if (a && i) return `${a} · ${i}`
  if (a) return a
  if (i) return i
  return null
}

function embedOne<T extends Record<string, unknown>>(rel: unknown): T | null {
  if (rel == null) return null
  const row = Array.isArray(rel) ? rel[0] : rel
  if (!row || typeof row !== "object") return null
  return row as T
}

function embedInvoiceNumber(rel: unknown): string | null {
  const row = embedOne<{ invoice_number: unknown }>(rel)
  if (!row?.invoice_number) return null
  return String(row.invoice_number)
}

function embedBankDisplay(rel: unknown): string | null {
  const row = embedOne<{
    account_name: unknown
    institution_name: unknown
  }>(rel)
  if (!row) return null
  return formatBankDisplay(
    typeof row.account_name === "string" ? row.account_name : null,
    typeof row.institution_name === "string" ? row.institution_name : null
  )
}

function normalizePaymentFromUnknown(inv: Record<string, unknown>): PaymentRow {
  const amount = toNumber(inv.amount)
  return {
    id: String(inv.id),
    payment_type: normalizePaymentType(inv.payment_type),
    direction: normalizeDirection(inv.direction),
    invoice_id: inv.invoice_id != null ? String(inv.invoice_id) : null,
    salary_payment_id:
      inv.salary_payment_id != null ? String(inv.salary_payment_id) : null,
    expense_id: inv.expense_id != null ? String(inv.expense_id) : null,
    bank_account_id: String(inv.bank_account_id),
    amount: Number.isFinite(amount) ? amount : 0,
    currency: typeof inv.currency === "string" ? inv.currency : "EUR",
    payment_date: inv.payment_date != null ? String(inv.payment_date) : "",
    reference: inv.reference != null ? String(inv.reference) : null,
    payer_payee_name:
      inv.payer_payee_name != null ? String(inv.payer_payee_name) : null,
    notes: inv.notes != null ? String(inv.notes) : null,
    deleted_at: inv.deleted_at != null ? String(inv.deleted_at) : null,
    created_at: String(inv.created_at ?? ""),
    updated_at: String(inv.updated_at ?? ""),
  }
}

type PaymentJoinRow = Record<string, unknown> & {
  invoices: unknown
  bank_accounts: unknown
}

function joinRowToListItem(row: PaymentJoinRow): PaymentListItem {
  const { invoices: invRel, bank_accounts: bankRel, ...rest } = row
  const base = normalizePaymentFromUnknown(rest)
  return {
    ...base,
    invoice_number: embedInvoiceNumber(invRel),
    bank_display: embedBankDisplay(bankRel),
  }
}

function sortPaymentList(rows: PaymentListItem[]): PaymentListItem[] {
  return [...rows].sort((a, b) => {
    const pd = (b.payment_date ?? "").localeCompare(a.payment_date ?? "")
    if (pd !== 0) return pd
    return (b.created_at ?? "").localeCompare(a.created_at ?? "")
  })
}

function fallbackPaymentList(): PaymentListItem[] {
  const now = new Date().toISOString()
  const items: PaymentListItem[] = mockPayments.map((p) => {
    const hasInvoice = Boolean(p.matchedInvoice && p.matchedInvoice !== "—")
    return {
      id: `local-fallback-${p.id}`,
      payment_type: hasInvoice ? "client_receipt" : "other",
      direction: "in",
      invoice_id: null,
      salary_payment_id: null,
      expense_id: null,
      bank_account_id: "local-fallback-bank-ref",
      amount: p.amountEur,
      currency: "EUR",
      payment_date: p.date,
      reference: p.reference,
      payer_payee_name: hasInvoice ? CLIENT_LABEL : null,
      notes: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
      invoice_number: hasInvoice ? p.matchedInvoice : null,
      bank_display: p.account,
    }
  })
  return sortPaymentList(items)
}

export async function getPayments(): Promise<{
  rows: PaymentListItem[]
  source: PaymentDataSource
}> {
  if (!hasSupabaseEnv()) {
    return { rows: fallbackPaymentList(), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("payments")
      .select(
        "*, invoices(invoice_number), bank_accounts(account_name, institution_name)"
      )
      .is("deleted_at", null)
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      warnFallback("getPayments", error)
      return { rows: fallbackPaymentList(), source: "fallback" }
    }

    const rawRows = (data ?? []) as PaymentJoinRow[]
    if (rawRows.length === 0) {
      return { rows: fallbackPaymentList(), source: "fallback" }
    }

    return {
      rows: sortPaymentList(rawRows.map(joinRowToListItem)),
      source: "database",
    }
  } catch (e) {
    warnFallback("getPayments", e)
    return { rows: fallbackPaymentList(), source: "fallback" }
  }
}
