"use server"

import { redirect } from "next/navigation"

import { failure, isFailure, type ActionResult } from "@/lib/forms/action-result"
import { parseFormDataWithSchema } from "@/lib/forms/parse-form-data"
import {
  isFallbackEntityId,
  requireSupabaseForMutation,
} from "@/lib/server/require-supabase-mutation"
import { revalidateFinancePaths } from "@/lib/server/revalidate-paths"
import { createClient } from "@/lib/supabase/server"
import {
  teamMemberDeactivateSchema,
  teamMemberFormSchema,
} from "@/lib/validation/team-member-schema"

const TEAM_PATHS = ["/team", "/salaries", "/payments"] as const

export async function saveTeamMemberAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, teamMemberFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback team members.")
  }

  const supabase = await createClient()
  const payload = {
    name: fields.name,
    role: fields.role ?? null,
    base_salary: fields.base_salary,
    currency: fields.currency,
    bank_name: fields.bank_name ?? null,
    bank_account_masked: fields.bank_account_masked,
    notes: fields.notes ?? null,
    active: true,
  }

  if (id) {
    const { data, error } = await supabase
      .from("team_members")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure("Could not update team member. Try again.")
    }

    revalidateFinancePaths([...TEAM_PATHS])
    redirect(`/team/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure("Could not create team member. Try again.")
  }

  revalidateFinancePaths([...TEAM_PATHS])
  redirect(`/team/${data.id}/edit?saved=1`)
}

export async function deactivateTeamMemberAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, teamMemberDeactivateSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot deactivate built-in fallback team members.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("team_members")
    .update({ active: false })
    .eq("id", id)

  if (error) {
    return failure(
      "Could not deactivate team member. Salary or payment links may block this."
    )
  }

  revalidateFinancePaths([...TEAM_PATHS])
  redirect("/team?deactivated=1")
}
