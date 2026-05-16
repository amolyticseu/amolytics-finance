"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import type { z } from "zod"

import { ActionBanner } from "@/components/forms/action-banner"
import { ReadOnlyFallbackBanner } from "@/components/forms/read-only-fallback-banner"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { LabeledField } from "@/components/forms/labeled-field"
import { SubmitButton } from "@/components/forms/submit-button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deactivateTeamMemberAction,
  saveTeamMemberAction,
} from "@/lib/actions/team-members"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import {
  teamMemberFormSchema,
  type TeamMemberFormValues,
} from "@/lib/validation/team-member-schema"

const textareaClassName =
  "flex w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"

type TeamMemberFormProps = {
  mode: "create" | "edit"
  defaultValues: TeamMemberFormValues
  canMutate: boolean
  isActive?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof TeamMemberFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof TeamMemberFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof TeamMemberFormValues] = messages[0]
    }
  }
  return out
}

export function TeamMemberForm({
  mode,
  defaultValues,
  canMutate,
  isActive = true,
}: TeamMemberFormProps) {
  const [saveState, saveAction] = useActionState(saveTeamMemberAction, null)
  const [deactivateState, deactivateAction] = useActionState(
    deactivateTeamMemberAction,
    null
  )

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: teamMemberFormSchema as z.ZodType<TeamMemberFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof TeamMemberFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="team members" /> : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={deactivateState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <FormSection title="Member details" description="India delivery bench roster entry.">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField label="Name" htmlFor="name" error={errors.name?.message}>
              <Input
                id="name"
                {...register("name")}
                name="name"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField label="Role" htmlFor="role" error={errors.role?.message}>
              <Input
                id="role"
                {...register("role")}
                name="role"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Base salary"
              htmlFor="base_salary"
              error={errors.base_salary?.message}
            >
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                min="0"
                {...register("base_salary")}
                name="base_salary"
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
              label="Bank name"
              htmlFor="bank_name"
              error={errors.bank_name?.message}
            >
              <Input
                id="bank_name"
                {...register("bank_name")}
                name="bank_name"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Bank account (masked)"
              htmlFor="bank_account_masked"
              error={errors.bank_account_masked?.message}
              hint="e.g. ****1234 — full account numbers are auto-masked."
            >
              <Input
                id="bank_account_masked"
                {...register("bank_account_masked")}
                name="bank_account_masked"
                disabled={disabled}
                autoComplete="off"
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
            {mode === "edit" ? (
              <LabeledField
                label="Active Status"
                htmlFor="active"
                className="sm:col-span-2"
              >
                <Input
                  id="active"
                  value={isActive ? "Active" : "Inactive"}
                  disabled
                  readOnly
                />
              </LabeledField>
            ) : null}
          </div>
        </FormSection>

        <FormActions>
          <Link
            href="/team"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create member" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && isActive && canMutate && defaultValues.id ? (
        <FormSection
          title="Deactivate"
          description="Sets active to false. Existing salary and payment links are preserved."
        >
          <form action={deactivateAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Deactivating…">
              Deactivate member
            </SubmitButton>
          </form>
        </FormSection>
      ) : null}
    </div>
  )
}
