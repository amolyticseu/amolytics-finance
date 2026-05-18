"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import type { z } from "zod"

import { ActionBanner } from "@/components/forms/action-banner"
import { ReadOnlyFallbackBanner } from "@/components/forms/read-only-fallback-banner"
import { PageAlert } from "@/components/shell/page-alert"
import { FormActions } from "@/components/forms/form-actions"
import { ExpensePanelCard } from "@/components/expenses/expense-panel-card"
import { LabeledField } from "@/components/forms/labeled-field"
import { SubmitButton } from "@/components/forms/submit-button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cancelExpenseAction,
  saveExpenseAction,
} from "@/lib/actions/expenses"
import type { ExpenseFormOptions } from "@/lib/data/expenses"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import type { ExpenseCategoryDb, ExpenseStatus } from "@/types"
import {
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/validation/expense-schema"

const selectClassName =
  "flex h-9 w-full rounded-lg border border-af-border bg-af-surface px-2.5 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"

const textareaClassName =
  "flex w-full min-w-0 rounded-lg border border-af-border bg-af-surface px-2.5 py-2 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"

const CATEGORY_LABEL: Record<ExpenseCategoryDb, string> = {
  emi: "EMI",
  rent: "Rent",
  utilities: "Utilities",
  subscription: "Subscription",
  workspace: "Workspace",
  tax: "Tax",
  compliance: "Compliance",
  other: "Other",
}

const STATUS_LABEL: Record<ExpenseStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
}

type ExpenseFormProps = {
  mode: "create" | "edit"
  defaultValues: ExpenseFormValues
  canMutate: boolean
  options: ExpenseFormOptions
  isRemoved?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof ExpenseFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof ExpenseFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof ExpenseFormValues] = messages[0]
    }
  }
  return out
}

export function ExpenseForm({
  mode,
  defaultValues,
  canMutate,
  options,
  isRemoved = false,
}: ExpenseFormProps) {
  const [saveState, saveAction] = useActionState(saveExpenseAction, null)
  const [cancelState, cancelAction] = useActionState(cancelExpenseAction, null)

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: expenseFormSchema as z.ZodType<ExpenseFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof ExpenseFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate || isRemoved
  const { clients, bankAccounts } = options

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="expenses" /> : null}
      {isRemoved ? (
        <PageAlert>
          This expense is cancelled or soft-deleted and hidden from the default
          list.
        </PageAlert>
      ) : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={cancelState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <ExpensePanelCard
          title="Expense details"
          description="Manual entry only — no CSV import or recurring automation."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LabeledField
              label="Category"
              htmlFor="category"
              error={errors.category?.message}
            >
              <select
                id="category"
                {...register("category")}
                name="category"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(CATEGORY_LABEL) as ExpenseCategoryDb[]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </option>
                  )
                )}
              </select>
            </LabeledField>
            <LabeledField
              label="Name"
              htmlFor="name"
              error={errors.name?.message}
              className="sm:col-span-2"
            >
              <Input
                id="name"
                {...register("name")}
                name="name"
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
            <LabeledField label="Status" htmlFor="status" error={errors.status?.message}>
              <select
                id="status"
                {...register("status")}
                name="status"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(STATUS_LABEL) as ExpenseStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Expense date"
              htmlFor="expense_date"
              error={errors.expense_date?.message}
            >
              <Input
                id="expense_date"
                type="date"
                {...register("expense_date")}
                name="expense_date"
                disabled={disabled}
                required
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
            <LabeledField label="Recurring" htmlFor="recurring">
              <select
                id="recurring"
                {...register("recurring")}
                name="recurring"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </LabeledField>
            <LabeledField label="Rebillable" htmlFor="rebillable">
              <select
                id="rebillable"
                {...register("rebillable")}
                name="rebillable"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </LabeledField>
          </div>
        </ExpensePanelCard>

        <ExpensePanelCard title="Links & reference">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField
              label="Linked client"
              htmlFor="linked_client_id"
              error={errors.linked_client_id?.message}
            >
              <select
                id="linked_client_id"
                {...register("linked_client_id")}
                name="linked_client_id"
                disabled={disabled}
                className={selectClassName}
              >
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
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
              className="sm:col-span-2"
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
        </ExpensePanelCard>

        <FormActions>
          <Link
            href="/expenses"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create expense" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && canMutate && !isRemoved && defaultValues.id ? (
        <ExpensePanelCard
          title="Cancel expense"
          description="Sets status to cancelled and soft-deletes from the active list. Does not create payment rows."
        >
          <form action={cancelAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Cancelling…">
              Cancel / soft-delete expense
            </SubmitButton>
          </form>
        </ExpensePanelCard>
      ) : null}
    </div>
  )
}
