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
  expenseCancelSchema,
  expenseFormSchema,
} from "@/lib/validation/expense-schema"

const EXPENSE_PATHS = ["/expenses", "/payments", "/dashboard"] as const

export async function saveExpenseAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, expenseFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback expenses.")
  }

  const supabase = await createClient()
  const payload = {
    category: fields.category,
    name: fields.name,
    amount: fields.amount,
    currency: fields.currency,
    expense_date: fields.expense_date,
    due_date: fields.due_date,
    status: fields.status,
    recurring: fields.recurring === "true",
    rebillable: fields.rebillable === "true",
    linked_client_id: fields.linked_client_id,
    bank_account_id: fields.bank_account_id,
    payment_reference: fields.payment_reference ?? null,
    notes: fields.notes ?? null,
    deleted_at: null,
  }

  if (id) {
    const { data, error } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure(
        "Could not update expense. Check client and bank account links."
      )
    }

    revalidateFinancePaths([...EXPENSE_PATHS])
    redirect(`/expenses/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure(
      "Could not create expense. Check client and bank account links."
    )
  }

  revalidateFinancePaths([...EXPENSE_PATHS])
  redirect(`/expenses/${data.id}/edit?saved=1`)
}

export async function cancelExpenseAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, expenseCancelSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot cancel built-in fallback expenses.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("expenses")
    .update({
      status: "cancelled",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return failure("Could not cancel expense. It may be linked to payments.")
  }

  revalidateFinancePaths([...EXPENSE_PATHS])
  redirect("/expenses?cancelled=1")
}
