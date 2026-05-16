import { mockTeamFallbackMembers } from "@/data/mock/tables"
import { isFallbackEntityId } from "@/lib/server/require-supabase-mutation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { TeamMemberRow } from "@/lib/supabase/types"

export type TeamDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback team roster.`,
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

function normalizeTeamMember(row: TeamMemberRow): TeamMemberRow {
  const salary = row.base_salary
  let base_salary: number | null = null
  if (salary != null) {
    const n = toNumber(salary as unknown)
    base_salary = Number.isFinite(n) ? n : null
  }
  return {
    ...row,
    base_salary,
  }
}

function fallbackTeamMembers(): TeamMemberRow[] {
  const now = new Date().toISOString()
  const rows: TeamMemberRow[] = mockTeamFallbackMembers.map((m, i) => ({
    id: `local-fallback-team-${i}`,
    name: m.name,
    role: m.role,
    base_salary: null,
    currency: "INR",
    bank_name: null,
    bank_account_masked: null,
    active: true,
    notes: "Local fallback — configure Supabase and seed team_members for live data.",
    created_at: now,
    updated_at: now,
  }))
  return rows.sort((a, b) => a.name.localeCompare(b.name, "en"))
}

export async function getTeamMembersForManage(options?: {
  includeInactive?: boolean
}): Promise<{
  rows: TeamMemberRow[]
  source: TeamDataSource
  canMutate: boolean
}> {
  const includeInactive = options?.includeInactive ?? false

  if (!hasSupabaseEnv()) {
    return {
      rows: fallbackTeamMembers(),
      source: "fallback",
      canMutate: false,
    }
  }

  try {
    const supabase = await createClient()
    let query = supabase.from("team_members").select("*").order("name", {
      ascending: true,
    })

    if (!includeInactive) {
      query = query.eq("active", true)
    }

    const { data, error } = await query

    if (error) {
      warnFallback("getTeamMembersForManage", error)
      return {
        rows: fallbackTeamMembers(),
        source: "fallback",
        canMutate: false,
      }
    }

    const rows = ((data ?? []) as TeamMemberRow[]).map(normalizeTeamMember)
    return { rows, source: "database", canMutate: true }
  } catch (e) {
    warnFallback("getTeamMembersForManage", e)
    return {
      rows: fallbackTeamMembers(),
      source: "fallback",
      canMutate: false,
    }
  }
}

export async function getTeamMemberById(id: string): Promise<{
  row: TeamMemberRow | null
  source: TeamDataSource
  canMutate: boolean
}> {
  if (isFallbackEntityId(id) || !hasSupabaseEnv()) {
    const fallback = fallbackTeamMembers().find((m) => m.id === id) ?? null
    return { row: fallback, source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      if (error) warnFallback("getTeamMemberById", error)
      return { row: null, source: "fallback", canMutate: false }
    }

    return {
      row: normalizeTeamMember(data as TeamMemberRow),
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getTeamMemberById", e)
    return { row: null, source: "fallback", canMutate: false }
  }
}

export async function getActiveTeamMembers(): Promise<{
  rows: TeamMemberRow[]
  source: TeamDataSource
}> {
  if (!hasSupabaseEnv()) {
    return { rows: fallbackTeamMembers(), source: "fallback" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })

    if (error) {
      warnFallback("getActiveTeamMembers", error)
      return { rows: fallbackTeamMembers(), source: "fallback" }
    }

    const rows = ((data ?? []) as TeamMemberRow[]).map(normalizeTeamMember)
    if (rows.length === 0) {
      warnFallback(
        "getActiveTeamMembers",
        new Error("No active team_members rows (empty result).")
      )
      return { rows: fallbackTeamMembers(), source: "fallback" }
    }

    return { rows, source: "database" }
  } catch (e) {
    warnFallback("getActiveTeamMembers", e)
    return { rows: fallbackTeamMembers(), source: "fallback" }
  }
}
