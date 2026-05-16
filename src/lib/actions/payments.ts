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
  paymentDeleteSchema,
  paymentFormSchema,
} from "@/lib/validation/payment-schema"

const PAYMENT_PATHS = ["/payments"] as const

export async function savePaymentAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, paymentFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback payments.")
  }

  const supabase = await createClient()
  const payload = {
    payment_type: fields.payment_type,
    direction: fields.direction,
    invoice_id: fields.invoice_id,
    salary_payment_id: fields.salary_payment_id,
    expense_id: fields.expense_id,
    bank_account_id: fields.bank_account_id,
    amount: fields.amount,
    currency: fields.currency,
    payment_date: fields.payment_date,
    reference: fields.reference ?? null,
    payer_payee_name: fields.payer_payee_name ?? null,
    notes: fields.notes ?? null,
    deleted_at: null,
  }

  if (id) {
    const { data, error } = await supabase
      .from("payments")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure(
        "Could not update payment. Check bank account and optional links."
      )
    }

    revalidateFinancePaths([...PAYMENT_PATHS])
    redirect(`/payments/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure(
      "Could not create payment. Check bank account and optional links."
    )
  }

  revalidateFinancePaths([...PAYMENT_PATHS])
  redirect(`/payments/${data.id}/edit?saved=1`)
}

export async function softDeletePaymentAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, paymentDeleteSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot delete built-in fallback payments.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return failure("Could not remove payment. Try again.")
  }

  revalidateFinancePaths([...PAYMENT_PATHS])
  redirect("/payments?deleted=1")
}
