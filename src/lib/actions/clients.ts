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
  clientDeactivateSchema,
  clientFormSchema,
} from "@/lib/validation/client-schema"

const SETTINGS_CLIENTS_PATHS = [
  "/settings",
  "/settings/clients",
] as const

export async function saveClientAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, clientFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback rows.")
  }

  const supabase = await createClient()
  const payload = {
    name: fields.name,
    code: fields.code,
    contact_name: fields.contact_name ?? null,
    email: fields.email,
    hourly_rate: fields.hourly_rate,
    currency: fields.currency,
    billing_cycle_notes: fields.billing_cycle_notes ?? null,
    active: true,
  }

  if (id) {
    const { data, error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure(error.message.includes("unique")
        ? "A client with this code already exists."
        : "Could not update client. Try again.")
    }

    revalidateFinancePaths([...SETTINGS_CLIENTS_PATHS])
    redirect(`/settings/clients/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure(
      error.message.includes("unique")
        ? "A client with this code already exists."
        : "Could not create client. Try again."
    )
  }

  revalidateFinancePaths([...SETTINGS_CLIENTS_PATHS])
  redirect(`/settings/clients/${data.id}/edit?saved=1`)
}

export async function deactivateClientAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, clientDeactivateSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot deactivate built-in fallback rows.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("clients")
    .update({ active: false })
    .eq("id", id)

  if (error) {
    return failure("Could not deactivate client. It may be referenced elsewhere.")
  }

  revalidateFinancePaths([...SETTINGS_CLIENTS_PATHS])
  redirect("/settings/clients?deactivated=1")
}
