import {
  CLIENT_LABEL,
  HOURLY_RATE_EUR,
} from "@/data/mock/constants"
import { mockInvoices } from "@/data/mock/tables"
import { isFallbackEntityId } from "@/lib/server/require-supabase-mutation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { InvoiceListItem, InvoiceRow } from "@/lib/supabase/types"
import type { InvoiceStatus } from "@/types"

export type InvoiceDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback invoices.`,
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

function toFiniteNumberOrNull(value: unknown): number | null {
  if (value == null) return null
  const n = toNumber(value)
  return Number.isFinite(n) ? n : null
}

function toIntOrNull(value: unknown): number | null {
  if (value == null) return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

const INVOICE_STATUSES: readonly InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]

function normalizeStatus(value: unknown): InvoiceStatus {
  const s = typeof value === "string" ? value : ""
  if (INVOICE_STATUSES.includes(s as InvoiceStatus)) {
    return s as InvoiceStatus
  }
  return "draft"
}

function parseMockPeriod(period: string): {
  year: number
  month: number
  period_code: string
} | null {
  const m = period.match(/^(\d{4})-(\d{2})\s·\s(T0[123])$/)
  if (!m) return null
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    period_code: m[3],
  }
}

function normalizeInvoiceFromUnknown(
  inv: Record<string, unknown>
): InvoiceRow {
  const amount = toNumber(inv.amount)
  return {
    id: String(inv.id),
    client_id: String(inv.client_id),
    invoice_number:
      inv.invoice_number != null ? String(inv.invoice_number) : null,
    period_code: inv.period_code != null ? String(inv.period_code) : null,
    month: toIntOrNull(inv.month),
    year: toIntOrNull(inv.year),
    hours: toFiniteNumberOrNull(inv.hours),
    hourly_rate: toFiniteNumberOrNull(inv.hourly_rate),
    currency: typeof inv.currency === "string" ? inv.currency : "EUR",
    amount: Number.isFinite(amount) ? amount : 0,
    status: normalizeStatus(inv.status),
    sent_date: inv.sent_date != null ? String(inv.sent_date) : null,
    due_date: inv.due_date != null ? String(inv.due_date) : null,
    paid_date: inv.paid_date != null ? String(inv.paid_date) : null,
    bank_account_id:
      inv.bank_account_id != null ? String(inv.bank_account_id) : null,
    payment_reference:
      inv.payment_reference != null ? String(inv.payment_reference) : null,
    workspace_recovery_amount: toFiniteNumberOrNull(
      inv.workspace_recovery_amount
    ),
    notes: inv.notes != null ? String(inv.notes) : null,
    deleted_at: inv.deleted_at != null ? String(inv.deleted_at) : null,
    created_at: String(inv.created_at ?? ""),
    updated_at: String(inv.updated_at ?? ""),
  }
}

type ClientEmbed = { name: string; code: string } | null

type InvoiceJoinRow = Record<string, unknown> & {
  clients: ClientEmbed | ClientEmbed[] | null
}

function embedClient(
  rel: ClientEmbed | ClientEmbed[] | null
): { name: string | null; code: string | null } {
  if (rel == null) return { name: null, code: null }
  const row = Array.isArray(rel) ? rel[0] : rel
  if (!row || typeof row !== "object") return { name: null, code: null }
  return {
    name: typeof row.name === "string" ? row.name : null,
    code: typeof row.code === "string" ? row.code : null,
  }
}

function joinRowToListItem(row: InvoiceJoinRow): InvoiceListItem {
  const { clients: c, ...rest } = row
  const base = normalizeInvoiceFromUnknown(rest)
  const { name, code } = embedClient(c)
  return {
    ...base,
    client_name: name,
    client_code: code,
  }
}

function sortInvoiceList(rows: InvoiceListItem[]): InvoiceListItem[] {
  return [...rows].sort((a, b) => {
    const y = (b.year ?? 0) - (a.year ?? 0)
    if (y !== 0) return y
    const m = (b.month ?? 0) - (a.month ?? 0)
    if (m !== 0) return m
    const p = (b.period_code ?? "").localeCompare(a.period_code ?? "", "en")
    if (p !== 0) return p
    return (b.created_at ?? "").localeCompare(a.created_at ?? "", "en")
  })
}

function fallbackInvoiceList(): InvoiceListItem[] {
  const now = new Date().toISOString()
  const items: InvoiceListItem[] = mockInvoices.map((inv) => {
    const parsed = parseMockPeriod(inv.period)
    const year = parsed?.year ?? 2026
    const month = parsed?.month ?? 5
    const period_code = parsed?.period_code ?? "T01"
    const hours = Math.round((inv.amountEur / HOURLY_RATE_EUR) * 100) / 100
    const paid_date = inv.status === "paid" ? inv.due : null

    return {
      id: `local-fallback-${inv.id}`,
      client_id: "local-fallback-client-ref",
      invoice_number: inv.id.replace(/^inv-/i, "BMF-").toUpperCase(),
      period_code,
      month,
      year,
      hours,
      hourly_rate: HOURLY_RATE_EUR,
      currency: "EUR",
      amount: inv.amountEur,
      status: inv.status as InvoiceStatus,
      sent_date: inv.issued,
      due_date: inv.due,
      paid_date,
      bank_account_id: null,
      payment_reference: null,
      workspace_recovery_amount: null,
      notes: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: CLIENT_LABEL,
      client_code: "8BMF8",
    }
  })

  return sortInvoiceList(items)
}

export type InvoiceFormOption = { id: string; label: string }

export async function getInvoiceFormOptions(): Promise<{
  clients: InvoiceFormOption[]
  bankAccounts: InvoiceFormOption[]
  canMutate: boolean
}> {
  if (!hasSupabaseEnv()) {
    return { clients: [], bankAccounts: [], canMutate: false }
  }

  try {
    const supabase = await createClient()
    const [clientsRes, banksRes] = await Promise.all([
      supabase
        .from("clients")
        .select("id, name, code")
        .eq("active", true)
        .order("name", { ascending: true }),
      supabase
        .from("bank_accounts")
        .select("id, account_name, institution_name")
        .eq("active", true)
        .is("deleted_at", null)
        .order("institution_name", { ascending: true }),
    ])

    if (clientsRes.error || banksRes.error) {
      return { clients: [], bankAccounts: [], canMutate: false }
    }

    const clients = (clientsRes.data ?? []).map((c) => ({
      id: String(c.id),
      label: `${c.name} (${c.code})`,
    }))
    const bankAccounts = (banksRes.data ?? []).map((b) => ({
      id: String(b.id),
      label: `${b.institution_name} — ${b.account_name}`,
    }))

    return { clients, bankAccounts, canMutate: true }
  } catch {
    return { clients: [], bankAccounts: [], canMutate: false }
  }
}

export async function getInvoiceById(id: string): Promise<{
  row: InvoiceListItem | null
  source: InvoiceDataSource
  canMutate: boolean
}> {
  if (isFallbackEntityId(id) || !hasSupabaseEnv()) {
    const fallback = fallbackInvoiceList().find((inv) => inv.id === id) ?? null
    return { row: fallback, source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("invoices")
      .select("*, clients(name, code)")
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      if (error) warnFallback("getInvoiceById", error)
      return { row: null, source: "fallback", canMutate: false }
    }

    return {
      row: joinRowToListItem(data as InvoiceJoinRow),
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getInvoiceById", e)
    return { row: null, source: "fallback", canMutate: false }
  }
}

export async function getInvoices(options?: {
  includeCancelled?: boolean
}): Promise<{
  rows: InvoiceListItem[]
  source: InvoiceDataSource
  canMutate: boolean
}> {
  const includeCancelled = options?.includeCancelled ?? false
  const canMutate = hasSupabaseEnv()

  if (!hasSupabaseEnv()) {
    return { rows: fallbackInvoiceList(), source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from("invoices")
      .select("*, clients(name, code)")
      .order("created_at", { ascending: false })

    if (!includeCancelled) {
      query = query.is("deleted_at", null)
    }

    const { data, error } = await query

    if (error) {
      warnFallback("getInvoices", error)
      return { rows: fallbackInvoiceList(), source: "fallback", canMutate: false }
    }

    const rawRows = (data ?? []) as InvoiceJoinRow[]
    if (rawRows.length === 0) {
      return { rows: fallbackInvoiceList(), source: "fallback", canMutate }
    }

    return {
      rows: sortInvoiceList(rawRows.map(joinRowToListItem)),
      source: "database",
      canMutate,
    }
  } catch (e) {
    warnFallback("getInvoices", e)
    return { rows: fallbackInvoiceList(), source: "fallback", canMutate: false }
  }
}
