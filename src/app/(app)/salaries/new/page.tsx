import Link from "next/link"

import { SalaryPaymentForm } from "@/components/salaries/salary-payment-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getSalaryFormOptions } from "@/lib/data/salaries"
import { emptySalaryPaymentFormDefaults } from "@/lib/forms/salary-payment-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewSalaryPaymentPage() {
  const options = await getSalaryFormOptions()

  const defaultValues = emptySalaryPaymentFormDefaults({
    team_member_id: options.teamMembers[0]?.id ?? "",
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add salary payment"
        description="Manual payroll line — pending, partial, or paid. No automation."
      />
      {options.canMutate && options.teamMembers.length === 0 ? (
        <p className="rounded-af-card border border-af-warning/30 bg-af-soft-amber px-3 py-2 text-sm text-af-text-primary">
          Add at least one active team member before creating a salary payment.
        </p>
      ) : null}
      <SalaryPaymentForm
        mode="create"
        canMutate={options.canMutate}
        options={options}
        defaultValues={defaultValues}
      />
      <Link
        href="/salaries"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to salaries
      </Link>
    </div>
  )
}
