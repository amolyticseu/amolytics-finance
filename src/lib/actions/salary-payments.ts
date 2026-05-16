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
  salaryPaymentDeleteSchema,
  salaryPaymentFormSchema,
} from "@/lib/validation/salary-payment-schema"

const SALARY_PATHS = ["/salaries", "/payments", "/dashboard"] as const

export async function saveSalaryPaymentAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, salaryPaymentFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback salary payments.")
  }

  const supabase = await createClient()
  const payload = {
    team_member_id: fields.team_member_id,
    month: fields.month,
    year: fields.year,
    base_amount: fields.base_amount,
    reimbursement: fields.reimbursement,
    deduction: fields.deduction,
    total_amount: fields.total_amount,
    currency: fields.currency,
    status: fields.status,
    payment_date: fields.payment_date,
    bank_account_id: fields.bank_account_id,
    transaction_reference: fields.transaction_reference ?? null,
    notes: fields.notes ?? null,
    deleted_at: null,
  }

  if (id) {
    const { data, error } = await supabase
      .from("salary_payments")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure(
        "Could not update salary payment. Check team member and bank account."
      )
    }

    revalidateFinancePaths([...SALARY_PATHS])
    redirect(`/salaries/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("salary_payments")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure(
      "Could not create salary payment. Check team member and bank account."
    )
  }

  revalidateFinancePaths([...SALARY_PATHS])
  redirect(`/salaries/${data.id}/edit?saved=1`)
}

export async function softDeleteSalaryPaymentAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, salaryPaymentDeleteSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot delete built-in fallback salary payments.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("salary_payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return failure("Could not remove salary payment. It may be linked to payments.")
  }

  revalidateFinancePaths([...SALARY_PATHS])
  redirect("/salaries?deleted=1")
}
