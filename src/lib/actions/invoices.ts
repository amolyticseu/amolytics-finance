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
  invoiceCancelSchema,
  invoiceFormSchema,
} from "@/lib/validation/invoice-schema"

const INVOICE_PATHS = ["/invoices", "/dashboard"] as const

export async function saveInvoiceAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, invoiceFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback invoices.")
  }

  const supabase = await createClient()
  const payload = {
    client_id: fields.client_id,
    invoice_number: fields.invoice_number ?? null,
    period_code: fields.period_code,
    month: fields.month,
    year: fields.year,
    hours: fields.hours,
    hourly_rate: fields.hourly_rate,
    currency: fields.currency,
    amount: fields.amount,
    status: fields.status,
    sent_date: fields.sent_date,
    due_date: fields.due_date,
    paid_date: fields.paid_date,
    bank_account_id: fields.bank_account_id,
    payment_reference: fields.payment_reference ?? null,
    workspace_recovery_amount: fields.workspace_recovery_amount,
    notes: fields.notes ?? null,
    deleted_at: null,
  }

  if (id) {
    const { data, error } = await supabase
      .from("invoices")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure("Could not update invoice. Check client and bank account references.")
    }

    revalidateFinancePaths([...INVOICE_PATHS])
    redirect(`/invoices/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure("Could not create invoice. Check client and bank account references.")
  }

  revalidateFinancePaths([...INVOICE_PATHS])
  redirect(`/invoices/${data.id}/edit?saved=1`)
}

export async function cancelInvoiceAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, invoiceCancelSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot cancel built-in fallback invoices.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "cancelled",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return failure("Could not cancel invoice. It may be linked to payments.")
  }

  revalidateFinancePaths([...INVOICE_PATHS])
  redirect("/invoices?cancelled=1")
}
