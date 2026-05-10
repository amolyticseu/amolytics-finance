import { CLIENT_LABEL } from "@/data/mock/constants"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { ExpenseListItem, ExpenseRow } from "@/lib/supabase/types"
import type { ExpenseCategoryDb, ExpenseStatus } from "@/types"

export type ExpenseDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback expenses.`,
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

function toBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value
  if (value === "t" || value === "true" || value === 1) return true
  if (value === "f" || value === "false" || value === 0) return false
  return fallback
}

const EXPENSE_CATEGORIES: readonly ExpenseCategoryDb[] = [
  "emi",
  "rent",
  "utilities",
  "subscription",
  "workspace",
  "tax",
  "compliance",
  "other",
]

const EXPENSE_STATUSES: readonly ExpenseStatus[] = [
  "pending",
  "paid",
  "overdue",
  "cancelled",
]

function normalizeCategory(value: unknown): ExpenseCategoryDb {
  const s = typeof value === "string" ? value : ""
  if (EXPENSE_CATEGORIES.includes(s as ExpenseCategoryDb)) {
    return s as ExpenseCategoryDb
  }
  return "other"
}

function normalizeExpenseStatus(value: unknown): ExpenseStatus {
  const s = typeof value === "string" ? value : ""
  if (EXPENSE_STATUSES.includes(s as ExpenseStatus)) {
    return s as ExpenseStatus
  }
  return "pending"
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

function embedClient(rel: unknown): {
  name: string | null
  code: string | null
} {
  const row = embedOne<{ name: unknown; code: unknown }>(rel)
  if (!row) return { name: null, code: null }
  return {
    name: typeof row.name === "string" ? row.name : null,
    code: typeof row.code === "string" ? row.code : null,
  }
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

function normalizeExpenseFromUnknown(inv: Record<string, unknown>): ExpenseRow {
  const amount = toNumber(inv.amount)
  return {
    id: String(inv.id),
    category: normalizeCategory(inv.category),
    name: typeof inv.name === "string" ? inv.name : "",
    amount: Number.isFinite(amount) ? amount : 0,
    currency: typeof inv.currency === "string" ? inv.currency : "EUR",
    expense_date:
      inv.expense_date != null ? String(inv.expense_date) : "",
    due_date: inv.due_date != null ? String(inv.due_date) : null,
    status: normalizeExpenseStatus(inv.status),
    recurring: toBool(inv.recurring, false),
    rebillable: toBool(inv.rebillable, false),
    linked_client_id:
      inv.linked_client_id != null ? String(inv.linked_client_id) : null,
    bank_account_id:
      inv.bank_account_id != null ? String(inv.bank_account_id) : null,
    payment_reference:
      inv.payment_reference != null ? String(inv.payment_reference) : null,
    notes: inv.notes != null ? String(inv.notes) : null,
    deleted_at: inv.deleted_at != null ? String(inv.deleted_at) : null,
    created_at: String(inv.created_at ?? ""),
    updated_at: String(inv.updated_at ?? ""),
  }
}

type ExpenseJoinRow = Record<string, unknown> & {
  clients: unknown
  bank_accounts: unknown
}

function joinRowToListItem(row: ExpenseJoinRow): ExpenseListItem {
  const { clients: cRel, bank_accounts: bankRel, ...rest } = row
  const base = normalizeExpenseFromUnknown(rest)
  const { name, code } = embedClient(cRel)
  return {
    ...base,
    client_name: name,
    client_code: code,
    bank_display: embedBankDisplay(bankRel),
  }
}

function sortExpenseList(rows: ExpenseListItem[]): ExpenseListItem[] {
  return [...rows].sort((a, b) => {
    const ed = (b.expense_date ?? "").localeCompare(a.expense_date ?? "")
    if (ed !== 0) return ed
    const dd = (b.due_date ?? "").localeCompare(a.due_date ?? "")
    if (dd !== 0) return dd
    return (b.created_at ?? "").localeCompare(a.created_at ?? "")
  })
}

function fallbackExpenseList(): ExpenseListItem[] {
  const now = new Date().toISOString()
  const linked = "local-fallback-client"
  const items: ExpenseListItem[] = [
    {
      id: "local-fallback-exp-kotak",
      category: "emi",
      name: "Kotak EMI",
      amount: 16_352,
      currency: "INR",
      expense_date: "2026-05-01",
      due_date: null,
      status: "pending",
      recurring: true,
      rebillable: false,
      linked_client_id: linked,
      bank_account_id: null,
      payment_reference: null,
      notes: "Loan EMI — Kotak",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: CLIENT_LABEL,
      client_code: "8BMF8",
      bank_display: null,
    },
    {
      id: "local-fallback-exp-idfc",
      category: "emi",
      name: "IDFC EMI",
      amount: 20_528,
      currency: "INR",
      expense_date: "2026-05-01",
      due_date: null,
      status: "pending",
      recurring: true,
      rebillable: false,
      linked_client_id: linked,
      bank_account_id: null,
      payment_reference: null,
      notes: "Loan EMI — IDFC",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: CLIENT_LABEL,
      client_code: "8BMF8",
      bank_display: null,
    },
    {
      id: "local-fallback-exp-axis1",
      category: "emi",
      name: "Axis EMI — facility 1",
      amount: 26_619,
      currency: "INR",
      expense_date: "2026-05-01",
      due_date: null,
      status: "pending",
      recurring: true,
      rebillable: false,
      linked_client_id: linked,
      bank_account_id: null,
      payment_reference: null,
      notes: "Loan EMI — Axis 1",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: CLIENT_LABEL,
      client_code: "8BMF8",
      bank_display: null,
    },
    {
      id: "local-fallback-exp-axis2",
      category: "emi",
      name: "Axis EMI — facility 2",
      amount: 6_099,
      currency: "INR",
      expense_date: "2026-05-01",
      due_date: null,
      status: "pending",
      recurring: true,
      rebillable: false,
      linked_client_id: linked,
      bank_account_id: null,
      payment_reference: null,
      notes: "Loan EMI — Axis 2",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: CLIENT_LABEL,
      client_code: "8BMF8",
      bank_display: null,
    },
    {
      id: "local-fallback-exp-rent",
      category: "rent",
      name: "Malta rent",
      amount: 500,
      currency: "EUR",
      expense_date: "2026-05-01",
      due_date: null,
      status: "pending",
      recurring: true,
      rebillable: false,
      linked_client_id: null,
      bank_account_id: null,
      payment_reference: null,
      notes: "Fixed Malta rent component",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: null,
      client_code: null,
      bank_display: null,
    },
    {
      id: "local-fallback-exp-utilities",
      category: "utilities",
      name: "Malta utilities",
      amount: 125,
      currency: "EUR",
      expense_date: "2026-05-01",
      due_date: null,
      status: "pending",
      recurring: true,
      rebillable: false,
      linked_client_id: null,
      bank_account_id: null,
      payment_reference: null,
      notes: "Fixed Malta utilities component",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: null,
      client_code: null,
      bank_display: null,
    },
    {
      id: "local-fallback-exp-workspace",
      category: "workspace",
      name: "Workspace recovery (pending recharge)",
      amount: 163.08,
      currency: "EUR",
      expense_date: "2026-05-10",
      due_date: null,
      status: "pending",
      recurring: false,
      rebillable: true,
      linked_client_id: linked,
      bank_account_id: null,
      payment_reference: null,
      notes: "Pending €163.08 recovery; link to invoice line when billed.",
      deleted_at: null,
      created_at: now,
      updated_at: now,
      client_name: CLIENT_LABEL,
      client_code: "8BMF8",
      bank_display: null,
    },
  ]

  return sortExpenseList(items)
}

export async function getExpenses(): Promise<{
  rows: ExpenseListItem[]
  source: ExpenseDataSource
}> {
  if (!hasSupabaseEnv()) {
    return { rows: fallbackExpenseList(), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("expenses")
      .select(
        "*, clients(name, code), bank_accounts(account_name, institution_name)"
      )
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      warnFallback("getExpenses", error)
      return { rows: fallbackExpenseList(), source: "fallback" }
    }

    const rawRows = (data ?? []) as ExpenseJoinRow[]
    if (rawRows.length === 0) {
      return { rows: fallbackExpenseList(), source: "fallback" }
    }

    return {
      rows: sortExpenseList(rawRows.map(joinRowToListItem)),
      source: "database",
    }
  } catch (e) {
    warnFallback("getExpenses", e)
    return { rows: fallbackExpenseList(), source: "fallback" }
  }
}
