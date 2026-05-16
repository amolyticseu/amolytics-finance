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
  saveSalaryPaymentAction,
  softDeleteSalaryPaymentAction,
} from "@/lib/actions/salary-payments"
import type { SalaryFormOptions } from "@/lib/data/salaries"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import type { SalaryPaymentStatus } from "@/types"
import {
  salaryPaymentFormSchema,
  type SalaryPaymentFormValues,
} from "@/lib/validation/salary-payment-schema"

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm dark:bg-input/30"

const textareaClassName =
  "flex w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"

const STATUS_LABEL: Record<SalaryPaymentStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
}

type SalaryPaymentFormProps = {
  mode: "create" | "edit"
  defaultValues: SalaryPaymentFormValues
  canMutate: boolean
  options: SalaryFormOptions
  isDeleted?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof SalaryPaymentFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof SalaryPaymentFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof SalaryPaymentFormValues] = messages[0]
    }
  }
  return out
}

export function SalaryPaymentForm({
  mode,
  defaultValues,
  canMutate,
  options,
  isDeleted = false,
}: SalaryPaymentFormProps) {
  const [saveState, saveAction] = useActionState(saveSalaryPaymentAction, null)
  const [deleteState, deleteAction] = useActionState(
    softDeleteSalaryPaymentAction,
    null
  )

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: salaryPaymentFormSchema as z.ZodType<SalaryPaymentFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof SalaryPaymentFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate || isDeleted
  const { teamMembers, bankAccounts } = options

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="salary payments" /> : null}
      {isDeleted ? (
        <PageAlert>
          This salary payment is soft-deleted and hidden from the default payroll list.
        </PageAlert>
      ) : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={deleteState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <FormSection
          title="Payroll period"
          description="Manual entry only — enter amounts yourself; nothing is auto-calculated."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LabeledField
              label="Team member"
              htmlFor="team_member_id"
              error={errors.team_member_id?.message}
              className="sm:col-span-2"
            >
              <select
                id="team_member_id"
                {...register("team_member_id")}
                name="team_member_id"
                disabled={disabled || teamMembers.length === 0}
                className={selectClassName}
              >
                <option value="">Select member…</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
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

        <FormSection title="Amounts">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LabeledField
              label="Base amount"
              htmlFor="base_amount"
              error={errors.base_amount?.message}
            >
              <Input
                id="base_amount"
                type="number"
                step="0.01"
                min="0"
                {...register("base_amount")}
                name="base_amount"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Reimbursement"
              htmlFor="reimbursement"
              error={errors.reimbursement?.message}
            >
              <Input
                id="reimbursement"
                type="number"
                step="0.01"
                min="0"
                {...register("reimbursement")}
                name="reimbursement"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Deduction"
              htmlFor="deduction"
              error={errors.deduction?.message}
            >
              <Input
                id="deduction"
                type="number"
                step="0.01"
                min="0"
                {...register("deduction")}
                name="deduction"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Total amount"
              htmlFor="total_amount"
              error={errors.total_amount?.message}
            >
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                {...register("total_amount")}
                name="total_amount"
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
          </div>
        </FormSection>

        <FormSection title="Status & payout">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LabeledField label="Status" htmlFor="status" error={errors.status?.message}>
              <select
                id="status"
                {...register("status")}
                name="status"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(STATUS_LABEL) as SalaryPaymentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
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
              />
            </LabeledField>
            <LabeledField
              label="Bank account"
              htmlFor="bank_account_id"
              error={errors.bank_account_id?.message}
              className="sm:col-span-2"
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
              label="Transaction reference"
              htmlFor="transaction_reference"
              error={errors.transaction_reference?.message}
              className="sm:col-span-2"
            >
              <Input
                id="transaction_reference"
                {...register("transaction_reference")}
                name="transaction_reference"
                disabled={disabled}
                className="font-mono text-xs"
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
            href="/salaries"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create salary payment" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && canMutate && !isDeleted && defaultValues.id ? (
        <FormSection
          title="Remove salary payment"
          description="Soft-deletes from the active payroll list. Does not remove the team member."
        >
          <form action={deleteAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Removing…">
              Soft-delete salary payment
            </SubmitButton>
          </form>
        </FormSection>
      ) : null}
    </div>
  )
}
