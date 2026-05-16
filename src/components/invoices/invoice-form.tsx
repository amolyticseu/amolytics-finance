"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import type { z } from "zod"

import { ActionBanner } from "@/components/forms/action-banner"
import { ReadOnlyFallbackBanner } from "@/components/forms/read-only-fallback-banner"
import { PageAlert } from "@/components/shell/page-alert"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { LabeledField } from "@/components/forms/labeled-field"
import { SubmitButton } from "@/components/forms/submit-button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cancelInvoiceAction,
  saveInvoiceAction,
} from "@/lib/actions/invoices"
import type { InvoiceFormOption } from "@/lib/data/invoices"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validation/invoice-schema"

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm dark:bg-input/30"

const textareaClassName =
  "flex w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"

type InvoiceFormProps = {
  mode: "create" | "edit"
  defaultValues: InvoiceFormValues
  canMutate: boolean
  clients: InvoiceFormOption[]
  bankAccounts: InvoiceFormOption[]
  isCancelled?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof InvoiceFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof InvoiceFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof InvoiceFormValues] = messages[0]
    }
  }
  return out
}

export function InvoiceForm({
  mode,
  defaultValues,
  canMutate,
  clients,
  bankAccounts,
  isCancelled = false,
}: InvoiceFormProps) {
  const [saveState, saveAction] = useActionState(saveInvoiceAction, null)
  const [cancelState, cancelAction] = useActionState(cancelInvoiceAction, null)

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: invoiceFormSchema as z.ZodType<InvoiceFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof InvoiceFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate || isCancelled

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="invoices" /> : null}
      {isCancelled ? (
        <PageAlert>
          This invoice is cancelled and soft-deleted from the active register.
        </PageAlert>
      ) : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={cancelState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <FormSection
          title="Client & reference"
          description="Bill-to client and optional invoice number."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField
              label="Client"
              htmlFor="client_id"
              error={errors.client_id?.message}
            >
              <select
                id="client_id"
                {...register("client_id")}
                name="client_id"
                disabled={disabled || clients.length === 0}
                className={selectClassName}
                defaultValue={defaultValues.client_id}
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Invoice number"
              htmlFor="invoice_number"
              error={errors.invoice_number?.message}
              hint="Optional; auto-id used in lists when empty."
            >
              <Input
                id="invoice_number"
                {...register("invoice_number")}
                name="invoice_number"
                disabled={disabled}
                className="font-mono text-xs"
              />
            </LabeledField>
          </div>
        </FormSection>

        <FormSection
          title="Period"
          description="BMF third-of-month windows T01 (1–10), T02 (11–20), T03 (21–end)."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <LabeledField
              label="Period code"
              htmlFor="period_code"
              error={errors.period_code?.message}
            >
              <select
                id="period_code"
                {...register("period_code")}
                name="period_code"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="T01">T01 (days 1–10)</option>
                <option value="T02">T02 (days 11–20)</option>
                <option value="T03">T03 (days 21–end)</option>
              </select>
            </LabeledField>
            <LabeledField label="Month" htmlFor="month" error={errors.month?.message}>
              <Input
                id="month"
                type="number"
                min={1}
                max={12}
                {...register("month")}
                name="month"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField label="Year" htmlFor="year" error={errors.year?.message}>
              <Input
                id="year"
                type="number"
                min={2000}
                max={2100}
                {...register("year")}
                name="year"
                disabled={disabled}
              />
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Amounts" description="Hours, rate, and total amount.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LabeledField label="Hours" htmlFor="hours" error={errors.hours?.message}>
              <Input
                id="hours"
                type="number"
                step="0.01"
                min="0"
                {...register("hours")}
                name="hours"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Hourly rate"
              htmlFor="hourly_rate"
              error={errors.hourly_rate?.message}
            >
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                {...register("hourly_rate")}
                name="hourly_rate"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Amount"
              htmlFor="amount"
              error={errors.amount?.message}
            >
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount")}
                name="amount"
                disabled={disabled}
                required
              />
            </LabeledField>
            <LabeledField
              label="Currency"
              htmlFor="currency"
              error={errors.currency?.message}
            >
              <Input
                id="currency"
                {...register("currency")}
                name="currency"
                disabled={disabled}
                className="uppercase"
                maxLength={8}
              />
            </LabeledField>
            <LabeledField
              label="Workspace recovery"
              htmlFor="workspace_recovery_amount"
              error={errors.workspace_recovery_amount?.message}
              className="sm:col-span-2"
            >
              <Input
                id="workspace_recovery_amount"
                type="number"
                step="0.01"
                min="0"
                {...register("workspace_recovery_amount")}
                name="workspace_recovery_amount"
                disabled={disabled}
              />
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Status & dates">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LabeledField label="Status" htmlFor="status" error={errors.status?.message}>
              <select
                id="status"
                {...register("status")}
                name="status"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </LabeledField>
            <LabeledField
              label="Sent date"
              htmlFor="sent_date"
              error={errors.sent_date?.message}
            >
              <Input
                id="sent_date"
                type="date"
                {...register("sent_date")}
                name="sent_date"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Due date"
              htmlFor="due_date"
              error={errors.due_date?.message}
            >
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                name="due_date"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Paid date"
              htmlFor="paid_date"
              error={errors.paid_date?.message}
            >
              <Input
                id="paid_date"
                type="date"
                {...register("paid_date")}
                name="paid_date"
                disabled={disabled}
              />
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Payment details" description="Bank account and reference only — no payment rows created here.">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField
              label="Bank account"
              htmlFor="bank_account_id"
              error={errors.bank_account_id?.message}
            >
              <select
                id="bank_account_id"
                {...register("bank_account_id")}
                name="bank_account_id"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="">None</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Payment reference"
              htmlFor="payment_reference"
              error={errors.payment_reference?.message}
            >
              <Input
                id="payment_reference"
                {...register("payment_reference")}
                name="payment_reference"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Notes"
              htmlFor="notes"
              error={errors.notes?.message}
              className="sm:col-span-2"
            >
              <textarea
                id="notes"
                {...register("notes")}
                name="notes"
                disabled={disabled}
                rows={3}
                className={textareaClassName}
              />
            </LabeledField>
          </div>
        </FormSection>

        <FormActions>
          <Link
            href="/invoices"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create invoice" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && canMutate && !isCancelled && defaultValues.id ? (
        <FormSection
          title="Cancel invoice"
          description="Sets status to cancelled and soft-deletes from the active register. Does not create payment records."
        >
          <form action={cancelAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Cancelling…">
              Cancel invoice
            </SubmitButton>
          </form>
        </FormSection>
      ) : null}
    </div>
  )
}
