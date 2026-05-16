import { isFallbackEntityId } from "@/lib/server/require-supabase-mutation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { BankAccountRow } from "@/lib/supabase/types"

export type BankAccountDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback bank accounts.`,
    err instanceof Error ? err.message : err
  )
}

/** Matches seed.sql intent when DB is unavailable. No raw IBANs or secrets. */
function fallbackBankAccounts(): BankAccountRow[] {
  const now = new Date().toISOString()
  return [
    {
      id: "local-fallback-wise",
      account_name: "Wise EUR — personal",
      account_holder_name: null,
      institution_name: "Wise",
      account_type: "personal",
      currency: "EUR",
      country: null,
      iban_masked: null,
      swift_bic: null,
      bank_address: null,
      is_business_account: false,
      active: true,
      notes: "Fallback row (no Supabase)",
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-revolut",
      account_name: "Revolut",
      account_holder_name: null,
      institution_name: "Revolut",
      account_type: "personal",
      currency: "EUR",
      country: "MT",
      iban_masked: null,
      swift_bic: null,
      bank_address: null,
      is_business_account: false,
      active: true,
      notes: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-hsbc",
      account_name: "HSBC Malta",
      account_holder_name: null,
      institution_name: "HSBC",
      account_type: "current",
      currency: "EUR",
      country: "MT",
      iban_masked: null,
      swift_bic: null,
      bank_address: null,
      is_business_account: false,
      active: true,
      notes: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-icici",
      account_name: "ICICI India",
      account_holder_name: null,
      institution_name: "ICICI Bank",
      account_type: "current",
      currency: "INR",
      country: "IN",
      iban_masked: null,
      swift_bic: null,
      bank_address: null,
      is_business_account: false,
      active: true,
      notes: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-opc",
      account_name: "Amolytics OPC — current (placeholder)",
      account_holder_name: null,
      institution_name: "TBD",
      account_type: "business_current",
      currency: "EUR",
      country: "MT",
      iban_masked: null,
      swift_bic: null,
      bank_address: null,
      is_business_account: true,
      active: true,
      notes: "Placeholder — fallback",
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
  ].sort((a, b) => {
    const byInst = a.institution_name.localeCompare(b.institution_name, "en")
    if (byInst !== 0) return byInst
    return a.account_name.localeCompare(b.account_name, "en")
  })
}

export type BankAccountsQueryResult = {
  rows: BankAccountRow[]
  source: BankAccountDataSource
  canMutate: boolean
}

export async function getBankAccountsForManage(options?: {
  includeInactive?: boolean
}): Promise<BankAccountsQueryResult> {
  const includeInactive = options?.includeInactive ?? false

  if (!hasSupabaseEnv()) {
    return {
      rows: fallbackBankAccounts(),
      source: "fallback",
      canMutate: false,
    }
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from("bank_accounts")
      .select("*")
      .order("institution_name", { ascending: true })
      .order("account_name", { ascending: true })

    if (!includeInactive) {
      query = query.eq("active", true).is("deleted_at", null)
    }

    const { data, error } = await query

    if (error) {
      warnFallback("getBankAccountsForManage", error)
      return {
        rows: fallbackBankAccounts(),
        source: "fallback",
        canMutate: false,
      }
    }

    return {
      rows: (data ?? []) as BankAccountRow[],
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getBankAccountsForManage", e)
    return {
      rows: fallbackBankAccounts(),
      source: "fallback",
      canMutate: false,
    }
  }
}

export async function getBankAccountById(id: string): Promise<{
  row: BankAccountRow | null
  source: BankAccountDataSource
  canMutate: boolean
}> {
  if (isFallbackEntityId(id) || !hasSupabaseEnv()) {
    const fallback = fallbackBankAccounts().find((b) => b.id === id) ?? null
    return {
      row: fallback,
      source: "fallback",
      canMutate: false,
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      if (error) warnFallback("getBankAccountById", error)
      return { row: null, source: "fallback", canMutate: false }
    }

    return {
      row: data as BankAccountRow,
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getBankAccountById", e)
    return { row: null, source: "fallback", canMutate: false }
  }
}

export async function getActiveBankAccounts(): Promise<{
  rows: BankAccountRow[]
  source: BankAccountDataSource
}> {
  if (!hasSupabaseEnv()) {
    return { rows: fallbackBankAccounts(), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("active", true)
      .is("deleted_at", null)
      .order("institution_name", { ascending: true })
      .order("account_name", { ascending: true })

    if (error) {
      warnFallback("getActiveBankAccounts", error)
      return { rows: fallbackBankAccounts(), source: "fallback" }
    }

    const rows = (data ?? []) as BankAccountRow[]
    if (rows.length === 0) {
      warnFallback(
        "getActiveBankAccounts",
        new Error("No active, non-deleted bank_accounts rows (empty result).")
      )
      return { rows: fallbackBankAccounts(), source: "fallback" }
    }

    return { rows, source: "database" }
  } catch (e) {
    warnFallback("getActiveBankAccounts", e)
    return { rows: fallbackBankAccounts(), source: "fallback" }
  }
}
