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
  deactivateClientAction,
  saveClientAction,
} from "@/lib/actions/clients"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import type { z } from "zod"

import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validation/client-schema"

type ClientFormProps = {
  mode: "create" | "edit"
  defaultValues: ClientFormValues
  canMutate: boolean
  isActive?: boolean
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof ClientFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof ClientFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof ClientFormValues] = messages[0]
    }
  }
  return out
}

export function ClientForm({
  mode,
  defaultValues,
  canMutate,
  isActive = true,
}: ClientFormProps) {
  const [saveState, saveAction] = useActionState(saveClientAction, null)
  const [deactivateState, deactivateAction] = useActionState(
    deactivateClientAction,
    null
  )

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: clientFormSchema as z.ZodType<ClientFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof ClientFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="clients" /> : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={deactivateState} />

      <form action={saveAction} className="space-y-6">
        {defaultValues.id ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        <SettingsPanelCard
          title="Client details"
          description="Billing identity and rate."
          contentClassName="grid gap-4 sm:grid-cols-2"
        >
            <LabeledField
              label="Name"
              htmlFor="name"
              error={errors.name?.message}
            >
              <Input
                id="name"
                {...register("name")}
                name="name"
                disabled={disabled}
                aria-invalid={Boolean(errors.name)}
              />
            </LabeledField>
            <LabeledField label="Code" htmlFor="code" error={errors.code?.message}>
              <Input
                id="code"
                {...register("code")}
                name="code"
                disabled={disabled}
                className="font-mono text-xs"
                aria-invalid={Boolean(errors.code)}
              />
            </LabeledField>
            <LabeledField
              label="Contact name"
              htmlFor="contact_name"
              error={errors.contact_name?.message}
            >
              <Input
                id="contact_name"
                {...register("contact_name")}
                name="contact_name"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                {...register("email")}
                name="email"
                disabled={disabled}
                aria-invalid={Boolean(errors.email)}
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
              label="Billing cycle notes"
              htmlFor="billing_cycle_notes"
              error={errors.billing_cycle_notes?.message}
              className="sm:col-span-2"
            >
              <textarea
                id="billing_cycle_notes"
                {...register("billing_cycle_notes")}
                name="billing_cycle_notes"
                disabled={disabled}
                rows={3}
                className="flex w-full min-w-0 rounded-lg border border-af-border bg-af-surface px-2.5 py-2 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"
              />
            </LabeledField>
        </SettingsPanelCard>

        <FormActions>
          <Link
            href="/settings/clients"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create client" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && isActive && canMutate && defaultValues.id ? (
        <SettingsPanelCard
          title="Deactivate"
          description="Sets active to false. Historical invoices keep their client reference."
        >
          <form action={deactivateAction}>
            <input type="hidden" name="id" value={defaultValues.id} />
            <SubmitButton variant="destructive" pendingLabel="Deactivating…">
              Deactivate client
            </SubmitButton>
          </form>
        </SettingsPanelCard>
      ) : null}
    </div>
  )
}

