import { mockTeamFallbackMembers } from "@/data/mock/tables"
import { isFallbackEntityId } from "@/lib/server/require-supabase-mutation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type {
  SalaryPaymentListItem,
  SalaryPaymentRow,
} from "@/lib/supabase/types"
import type { SalaryPaymentStatus } from "@/types"

export type SalaryDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback salary payments.`,
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

function toInt(value: unknown, fallback: number): number {
  if (value == null) return fallback
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

const SALARY_STATUSES: readonly SalaryPaymentStatus[] = [
  "pending",
  "partial",
  "paid",
]

function normalizeSalaryStatus(value: unknown): SalaryPaymentStatus {
  const s = typeof value === "string" ? value : ""
  if (SALARY_STATUSES.includes(s as SalaryPaymentStatus)) {
    return s as SalaryPaymentStatus
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

function embedMember(rel: unknown): {
  name: string | null
  role: string | null
} {
  const row = embedOne<{ name: unknown; role: unknown }>(rel)
  if (!row) return { name: null, role: null }
  return {
    name: typeof row.name === "string" ? row.name : null,
    role:
      row.role == null
        ? null
        : typeof row.role === "string"
          ? row.role
          : String(row.role),
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

function normalizeSalaryFromUnknown(
  inv: Record<string, unknown>
): SalaryPaymentRow {
  const total = toNumber(inv.total_amount)
  return {
    id: String(inv.id),
    team_member_id: String(inv.team_member_id),
    month: toInt(inv.month, 1),
    year: toInt(inv.year, 2000),
    base_amount: toFiniteNumberOrNull(inv.base_amount),
    reimbursement: toFiniteNumberOrNull(inv.reimbursement),
    deduction: toFiniteNumberOrNull(inv.deduction),
    total_amount: Number.isFinite(total) ? total : 0,
    currency: typeof inv.currency === "string" ? inv.currency : "INR",
    status: normalizeSalaryStatus(inv.status),
    payment_date:
      inv.payment_date != null ? String(inv.payment_date) : null,
    bank_account_id:
      inv.bank_account_id != null ? String(inv.bank_account_id) : null,
    transaction_reference:
      inv.transaction_reference != null
        ? String(inv.transaction_reference)
        : null,
    notes: inv.notes != null ? String(inv.notes) : null,
    deleted_at: inv.deleted_at != null ? String(inv.deleted_at) : null,
    created_at: String(inv.created_at ?? ""),
    updated_at: String(inv.updated_at ?? ""),
  }
}

type SalaryJoinRow = Record<string, unknown> & {
  team_members: unknown
  bank_accounts: unknown
}

function joinRowToListItem(row: SalaryJoinRow): SalaryPaymentListItem {
  const { team_members: tmRel, bank_accounts: bankRel, ...rest } = row
  const base = normalizeSalaryFromUnknown(rest)
  const { name, role } = embedMember(tmRel)
  return {
    ...base,
    member_name: name,
    member_role: role,
    bank_display: embedBankDisplay(bankRel),
  }
}

function sortSalaryList(rows: SalaryPaymentListItem[]): SalaryPaymentListItem[] {
  return [...rows].sort((a, b) => {
    if (a.year !== b.year) return (b.year ?? 0) - (a.year ?? 0)
    if (a.month !== b.month) return (b.month ?? 0) - (a.month ?? 0)
    return (a.member_name ?? "").localeCompare(b.member_name ?? "", "en")
  })
}

function fallbackSalaryPayments(): SalaryPaymentListItem[] {
  const now = new Date().toISOString()
  const month = 5
  const year = 2026
  const items: SalaryPaymentListItem[] = mockTeamFallbackMembers.map(
    (m, i) => {
      const base_amount = 92_000 + i * 400
      const reimbursement = 4_800
      const deduction = 320 + i * 15
      const total_amount = base_amount + reimbursement - deduction
      const paid = i < 2
      return {
        id: `local-fallback-sal-${i}`,
        team_member_id: `local-fallback-team-${i}`,
        month,
        year,
        base_amount,
        reimbursement,
        deduction,
        total_amount,
        currency: "INR",
        status: paid ? "paid" : i === 2 ? "partial" : "pending",
        payment_date: paid ? "2026-05-14" : null,
        bank_account_id: null,
        transaction_reference: paid
          ? `SAL-MAY-2026-${m.name.slice(0, 3).toUpperCase()}`
          : null,
        notes:
          i === 0
            ? "Local mock payroll line — seed salary_payments in Supabase for live data."
            : null,
        deleted_at: null,
        created_at: now,
        updated_at: now,
        member_name: m.name,
        member_role: m.role,
        bank_display: null,
      }
    }
  )
  return sortSalaryList(items)
}

export type SalaryFormOption = { id: string; label: string }

export type SalaryFormOptions = {
  teamMembers: SalaryFormOption[]
  bankAccounts: SalaryFormOption[]
  canMutate: boolean
}

export async function getSalaryFormOptions(): Promise<SalaryFormOptions> {
  if (!hasSupabaseEnv()) {
    return { teamMembers: [], bankAccounts: [], canMutate: false }
  }

  try {
    const supabase = await createClient()
    const [membersRes, banksRes] = await Promise.all([
      supabase
        .from("team_members")
        .select("id, name, role")
        .eq("active", true)
        .order("name", { ascending: true }),
      supabase
        .from("bank_accounts")
        .select("id, account_name, institution_name")
        .eq("active", true)
        .is("deleted_at", null)
        .order("institution_name", { ascending: true }),
    ])

    if (membersRes.error || banksRes.error) {
      return { teamMembers: [], bankAccounts: [], canMutate: false }
    }

    const teamMembers = (membersRes.data ?? []).map((m) => ({
      id: String(m.id),
      label: m.role ? `${m.name} — ${m.role}` : String(m.name),
    }))

    const bankAccounts = (banksRes.data ?? []).map((b) => ({
      id: String(b.id),
      label: `${b.institution_name} — ${b.account_name}`,
    }))

    return { teamMembers, bankAccounts, canMutate: true }
  } catch {
    return { teamMembers: [], bankAccounts: [], canMutate: false }
  }
}

export async function getSalaryPaymentById(id: string): Promise<{
  row: SalaryPaymentListItem | null
  source: SalaryDataSource
  canMutate: boolean
}> {
  if (isFallbackEntityId(id) || !hasSupabaseEnv()) {
    const fallback = fallbackSalaryPayments().find((s) => s.id === id) ?? null
    return { row: fallback, source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("salary_payments")
      .select(
        "*, team_members(name, role), bank_accounts(account_name, institution_name)"
      )
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      if (error) warnFallback("getSalaryPaymentById", error)
      return { row: null, source: "fallback", canMutate: false }
    }

    return {
      row: joinRowToListItem(data as SalaryJoinRow),
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getSalaryPaymentById", e)
    return { row: null, source: "fallback", canMutate: false }
  }
}

export async function getSalaryPayments(options?: {
  includeDeleted?: boolean
}): Promise<{
  rows: SalaryPaymentListItem[]
  source: SalaryDataSource
  canMutate: boolean
}> {
  const includeDeleted = options?.includeDeleted ?? false
  const canMutate = hasSupabaseEnv()

  if (!hasSupabaseEnv()) {
    return { rows: fallbackSalaryPayments(), source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from("salary_payments")
      .select(
        "*, team_members(name, role), bank_accounts(account_name, institution_name)"
      )
      .order("year", { ascending: false })
      .order("month", { ascending: false })

    if (!includeDeleted) {
      query = query.is("deleted_at", null)
    }

    const { data, error } = await query

    if (error) {
      warnFallback("getSalaryPayments", error)
      return { rows: fallbackSalaryPayments(), source: "fallback", canMutate: false }
    }

    const rawRows = (data ?? []) as SalaryJoinRow[]
    if (rawRows.length === 0) {
      return { rows: fallbackSalaryPayments(), source: "fallback", canMutate }
    }

    return {
      rows: sortSalaryList(rawRows.map(joinRowToListItem)),
      source: "database",
      canMutate,
    }
  } catch (e) {
    warnFallback("getSalaryPayments", e)
    return { rows: fallbackSalaryPayments(), source: "fallback", canMutate: false }
  }
}
