"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"

import { ActionBanner } from "@/components/forms/action-banner"
import { ReadOnlyFallbackBanner } from "@/components/forms/read-only-fallback-banner"
import { FormActions } from "@/components/forms/form-actions"
import { LabeledField } from "@/components/forms/labeled-field"
import { SettingsPanelCard } from "@/components/settings/settings-panel-card"
import { SubmitButton } from "@/components/forms/submit-button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deactivateBankAccountAction,
  saveBankAccountAction,
} from "@/lib/actions/bank-accounts"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import type { z } from "zod"

import {
  bankAccountFormSchema,
  type BankAccountFormValues,
} from "@/lib/validation/bank-account-schema"

type BankAccountFormProps = {
  mode: "create" | "edit"
  defaultValues: BankAccountFormValues
  canMutate: boolean
  isActive?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof BankAccountFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof BankAccountFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof BankAccountFormValues] = messages[0]
    }
  }
  return out
}

export function BankAccountForm({
  mode,
  defaultValues,
  canMutate,
  isActive = true,
}: BankAccountFormProps) {
  const [saveState, saveAction] = useActionState(saveBankAccountAction, null)
  const [deactivateState, deactivateAction] = useActionState(
    deactivateBankAccountAction,
    null
  )

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: bankAccountFormSchema as z.ZodType<BankAccountFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof BankAccountFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="bank accounts" /> : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={deactivateState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <SettingsPanelCard
          title="Account details"
          description="Flexible records — not a fixed provider enum. Sensitive numbers are stored masked only."
          contentClassName="grid gap-4 sm:grid-cols-2"
        >
            <LabeledField
              label="Account name"
              htmlFor="account_name"
              error={errors.account_name?.message}
            >
              <Input
                id="account_name"
                {...register("account_name")}
                name="account_name"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Institution"
              htmlFor="institution_name"
              error={errors.institution_name?.message}
            >
              <Input
                id="institution_name"
                {...register("institution_name")}
                name="institution_name"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Account holder"
              htmlFor="account_holder_name"
              error={errors.account_holder_name?.message}
            >
              <Input
                id="account_holder_name"
                {...register("account_holder_name")}
                name="account_holder_name"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Account type"
              htmlFor="account_type"
              error={errors.account_type?.message}
              hint="e.g. personal, current, business_current"
            >
              <Input
                id="account_type"
                {...register("account_type")}
                name="account_type"
                disabled={disabled}
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
              label="Country"
              htmlFor="country"
              error={errors.country?.message}
              hint="2-letter code (MT, IN)"
            >
              <Input
                id="country"
                {...register("country")}
                name="country"
                disabled={disabled}
                className="uppercase"
                maxLength={2}
              />
            </LabeledField>
            <LabeledField
              label="IBAN / account (masked)"
              htmlFor="iban_masked"
              error={errors.iban_masked?.message}
              hint="Last 4 digits or ****1234 — full numbers are auto-masked on save."
              className="sm:col-span-2"
            >
              <Input
                id="iban_masked"
                {...register("iban_masked")}
                name="iban_masked"
                disabled={disabled}
                autoComplete="off"
              />
            </LabeledField>
            <LabeledField
              label="SWIFT / BIC"
              htmlFor="swift_bic"
              error={errors.swift_bic?.message}
            >
              <Input
                id="swift_bic"
                {...register("swift_bic")}
                name="swift_bic"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField label="Business account" htmlFor="is_business_account">
              <select
                id="is_business_account"
                {...register("is_business_account")}
                name="is_business_account"
                disabled={disabled}
                className="flex h-9 w-full rounded-lg border border-af-border bg-af-surface px-2.5 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </LabeledField>
            <LabeledField
              label="Bank address"
              htmlFor="bank_address"
              error={errors.bank_address?.message}
              className="sm:col-span-2"
            >
              <textarea
                id="bank_address"
                {...register("bank_address")}
                name="bank_address"
                disabled={disabled}
                rows={2}
                className="flex w-full min-w-0 rounded-lg border border-af-border bg-af-surface px-2.5 py-2 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"
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
                rows={2}
                className="flex w-full min-w-0 rounded-lg border border-af-border bg-af-surface px-2.5 py-2 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"
              />
            </LabeledField>
        </SettingsPanelCard>

        <FormActions>
          <Link
            href="/settings/bank-accounts"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create account" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && isActive && canMutate && defaultValues.id ? (
        <SettingsPanelCard
          title="Deactivate"
          description="Sets active to false and deleted_at. Existing payment links are preserved."
        >
          <form action={deactivateAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Deactivating…">
              Deactivate bank account
            </SubmitButton>
          </form>
        </SettingsPanelCard>
      ) : null}
    </div>
  )
}
