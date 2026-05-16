"use server"

import { redirect } from "next/navigation"

import {
  failure,
  isFailure,
  type ActionResult,
} from "@/lib/forms/action-result"
import { parseFormDataWithSchema } from "@/lib/forms/parse-form-data"
import {
  isFallbackEntityId,
  requireSupabaseForMutation,
} from "@/lib/server/require-supabase-mutation"
import { revalidateFinancePaths } from "@/lib/server/revalidate-paths"
import { createClient } from "@/lib/supabase/server"
import {
  bankAccountDeactivateSchema,
  bankAccountFormSchema,
} from "@/lib/validation/bank-account-schema"

const SETTINGS_BANK_PATHS = [
  "/settings",
  "/settings/bank-accounts",
] as const

export async function saveBankAccountAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, bankAccountFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback rows.")
  }

  const supabase = await createClient()
  const payload = {
    account_name: fields.account_name,
    account_holder_name: fields.account_holder_name ?? null,
    institution_name: fields.institution_name,
    account_type: fields.account_type ?? null,
    currency: fields.currency,
    country: fields.country,
    iban_masked: fields.iban_masked,
    swift_bic: fields.swift_bic ?? null,
    bank_address: fields.bank_address ?? null,
    is_business_account: fields.is_business_account === "true",
    notes: fields.notes ?? null,
    active: true,
    deleted_at: null,
  }

  if (id) {
    const { data, error } = await supabase
      .from("bank_accounts")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure("Could not update bank account. Try again.")
    }

    revalidateFinancePaths([...SETTINGS_BANK_PATHS])
    redirect(`/settings/bank-accounts/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure("Could not create bank account. Try again.")
  }

  revalidateFinancePaths([...SETTINGS_BANK_PATHS])
  redirect(`/settings/bank-accounts/${data.id}/edit?saved=1`)
}

export async function deactivateBankAccountAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, bankAccountDeactivateSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot deactivate built-in fallback rows.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("bank_accounts")
    .update({
      active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return failure(
      "Could not deactivate bank account. It may be referenced on invoices or payments."
    )
  }

  revalidateFinancePaths([...SETTINGS_BANK_PATHS])
  redirect("/settings/bank-accounts?deactivated=1")
}
