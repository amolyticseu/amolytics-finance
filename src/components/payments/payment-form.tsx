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
  savePaymentAction,
  softDeletePaymentAction,
} from "@/lib/actions/payments"
import type { PaymentFormOptions } from "@/lib/data/payments"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import type { PaymentTypeDb } from "@/lib/supabase/types"
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "@/lib/validation/payment-schema"

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm dark:bg-input/30"

const textareaClassName =
  "flex w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"

const PAYMENT_TYPE_LABEL: Record<PaymentTypeDb, string> = {
  client_receipt: "Client receipt",
  salary: "Salary",
  expense: "Expense",
  transfer: "Transfer",
  other: "Other",
}

type PaymentFormProps = {
  mode: "create" | "edit"
  defaultValues: PaymentFormValues
  canMutate: boolean
  options: PaymentFormOptions
  isDeleted?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof PaymentFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof PaymentFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof PaymentFormValues] = messages[0]
    }
  }
  return out
}

export function PaymentForm({
  mode,
  defaultValues,
  canMutate,
  options,
  isDeleted = false,
}: PaymentFormProps) {
  const [saveState, saveAction] = useActionState(savePaymentAction, null)
  const [deleteState, deleteAction] = useActionState(softDeletePaymentAction, null)

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: paymentFormSchema as z.ZodType<PaymentFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof PaymentFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate || isDeleted
  const { bankAccounts, invoices, salaryPayments, expenses } = options

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="payments" /> : null}
      {isDeleted ? (
        <PageAlert>
          This payment is soft-deleted and hidden from the default register.
        </PageAlert>
      ) : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={deleteState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <FormSection
          title="Payment type & direction"
          description="Invoice, salary, and expense links are all optional."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField
              label="Type"
              htmlFor="payment_type"
              error={errors.payment_type?.message}
            >
              <select
                id="payment_type"
                {...register("payment_type")}
                name="payment_type"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(PAYMENT_TYPE_LABEL) as PaymentTypeDb[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {PAYMENT_TYPE_LABEL[t]}
                    </option>
                  )
                )}
              </select>
            </LabeledField>
            <LabeledField
              label="Direction"
              htmlFor="direction"
              error={errors.direction?.message}
            >
              <select
                id="direction"
                {...register("direction")}
                name="direction"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Amount & date">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              label="Payment date"
              htmlFor="payment_date"
              error={errors.payment_date?.message}
            >
              <Input
                id="payment_date"
                type="date"
                {...register("payment_date")}
                name="payment_date"
                disabled={disabled}
                required
              />
            </LabeledField>
            <LabeledField
              label="Bank account"
              htmlFor="bank_account_id"
              error={errors.bank_account_id?.message}
            >
              <select
                id="bank_account_id"
                {...register("bank_account_id")}
                name="bank_account_id"
                disabled={disabled || bankAccounts.length === 0}
                className={selectClassName}
              >
                <option value="">Select account…</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </LabeledField>
          </div>
        </FormSection>

        <FormSection
          title="Optional links"
          description="Link to an invoice, salary run, or expense when helpful — not required."
        >
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <LabeledField
              label="Invoice"
              htmlFor="invoice_id"
              error={errors.invoice_id?.message}
            >
              <select
                id="invoice_id"
                {...register("invoice_id")}
                name="invoice_id"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="">None</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Salary payment"
              htmlFor="salary_payment_id"
              error={errors.salary_payment_id?.message}
            >
              <select
                id="salary_payment_id"
                {...register("salary_payment_id")}
                name="salary_payment_id"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="">None</option>
                {salaryPayments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Expense"
              htmlFor="expense_id"
              error={errors.expense_id?.message}
            >
              <select
                id="expense_id"
                {...register("expense_id")}
                name="expense_id"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="">None</option>
                {expenses.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Reference & notes">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField
              label="Reference"
              htmlFor="reference"
              error={errors.reference?.message}
            >
              <Input
                id="reference"
                {...register("reference")}
                name="reference"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Payer / payee name"
              htmlFor="payer_payee_name"
              error={errors.payer_payee_name?.message}
            >
              <Input
                id="payer_payee_name"
                {...register("payer_payee_name")}
                name="payer_payee_name"
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
            href="/payments"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create payment" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && canMutate && !isDeleted && defaultValues.id ? (
        <FormSection
          title="Remove payment"
          description="Soft-deletes this row from the active register. Does not change linked invoice, salary, or expense records."
        >
          <form action={deleteAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Removing…">
              Soft-delete payment
            </SubmitButton>
          </form>
        </FormSection>
      ) : null}
    </div>
  )
}
