import { INR_PER_EUR } from "@/data/mock/constants"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { ExchangeRateRow } from "@/lib/supabase/types"

/** FX read uses the same labels as clients / bank_accounts / team (`database` | `fallback`). */
export type ExchangeRateDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback defaults.`,
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

function mapExchangeRow(row: ExchangeRateRow): ExchangeRateRow {
  return {
    ...row,
    rate: toNumber(row.rate),
  }
}

function fallbackExchangeRate(): ExchangeRateRow {
  const now = new Date().toISOString().slice(0, 10)
  return {
    id: "local-fallback-fx",
    base_currency: "EUR",
    target_currency: "INR",
    rate: INR_PER_EUR,
    rate_date: now,
    source: "mock_constants",
    notes: "Planning default when Supabase is not configured or query fails.",
    created_at: now,
  }
}

export async function getLatestExchangeRate(): Promise<{
  row: ExchangeRateRow
  source: ExchangeRateDataSource
}> {
  if (!hasSupabaseEnv()) {
    return { row: fallbackExchangeRate(), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("base_currency", "EUR")
      .eq("target_currency", "INR")
      .order("rate_date", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      warnFallback("getLatestExchangeRate", error)
      return { row: fallbackExchangeRate(), source: "fallback" }
    }

    if (!data) {
      warnFallback(
        "getLatestExchangeRate",
        new Error("No EUR/INR row in exchange_rates (empty result).")
      )
      return { row: fallbackExchangeRate(), source: "fallback" }
    }

    return {
      row: mapExchangeRow(data as ExchangeRateRow),
      source: "database",
    }
  } catch (e) {
    warnFallback("getLatestExchangeRate", e)
    return { row: fallbackExchangeRate(), source: "fallback" }
  }
}
