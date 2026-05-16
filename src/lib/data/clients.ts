import {
  CLIENT_LABEL,
  HOURLY_RATE_EUR,
} from "@/data/mock/constants"
import { isFallbackEntityId } from "@/lib/server/require-supabase-mutation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { ClientRow } from "@/lib/supabase/types"

export type ClientDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback clients.`,
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

function normalizeClient(row: ClientRow): ClientRow {
  return {
    ...row,
    hourly_rate:
      row.hourly_rate == null ? null : toNumber(row.hourly_rate as unknown),
  }
}

function fallbackClients(): ClientRow[] {
  const now = new Date().toISOString()
  return [
    {
      id: "local-fallback-client",
      name: CLIENT_LABEL,
      code: "8BMF8",
      contact_name: "Mariusz",
      email: null,
      hourly_rate: HOURLY_RATE_EUR,
      currency: "EUR",
      billing_cycle_notes:
        "T01 (1–10), T02 (11–20), T03 (21–end) — local mock default.",
      active: true,
      created_at: now,
      updated_at: now,
    },
  ]
}

export type ClientsQueryResult = {
  rows: ClientRow[]
  source: ClientDataSource
  /** False when env missing or reads fell back — CRUD actions must not run. */
  canMutate: boolean
}

export async function getClientsForManage(options?: {
  includeInactive?: boolean
}): Promise<ClientsQueryResult> {
  const includeInactive = options?.includeInactive ?? false

  if (!hasSupabaseEnv()) {
    return {
      rows: fallbackClients(),
      source: "fallback",
      canMutate: false,
    }
  }

  try {
    const supabase = await createClient()
    let query = supabase.from("clients").select("*").order("name", { ascending: true })

    if (!includeInactive) {
      query = query.eq("active", true)
    }

    const { data, error } = await query

    if (error) {
      warnFallback("getClientsForManage", error)
      return {
        rows: fallbackClients(),
        source: "fallback",
        canMutate: false,
      }
    }

    const rows = ((data ?? []) as ClientRow[]).map(normalizeClient)
    return { rows, source: "database", canMutate: true }
  } catch (e) {
    warnFallback("getClientsForManage", e)
    return {
      rows: fallbackClients(),
      source: "fallback",
      canMutate: false,
    }
  }
}

export async function getClientById(id: string): Promise<{
  row: ClientRow | null
  source: ClientDataSource
  canMutate: boolean
}> {
  if (isFallbackEntityId(id) || !hasSupabaseEnv()) {
    const fallback = fallbackClients().find((c) => c.id === id) ?? null
    return {
      row: fallback,
      source: "fallback",
      canMutate: false,
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      if (error) warnFallback("getClientById", error)
      return { row: null, source: "fallback", canMutate: false }
    }

    return {
      row: normalizeClient(data as ClientRow),
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getClientById", e)
    return { row: null, source: "fallback", canMutate: false }
  }
}

export async function getActiveClients(): Promise<{
  rows: ClientRow[]
  source: ClientDataSource
}> {
  if (!hasSupabaseEnv()) {
    return { rows: fallbackClients(), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })

    if (error) {
      warnFallback("getActiveClients", error)
      return { rows: fallbackClients(), source: "fallback" }
    }

    const rows = ((data ?? []) as ClientRow[]).map(normalizeClient)
    if (rows.length === 0) {
      warnFallback(
        "getActiveClients",
        new Error("No active clients rows (empty result).")
      )
      return { rows: fallbackClients(), source: "fallback" }
    }

    return { rows, source: "database" }
  } catch (e) {
    warnFallback("getActiveClients", e)
    return { rows: fallbackClients(), source: "fallback" }
  }
}
