import Link from "next/link"

import { PaymentForm } from "@/components/payments/payment-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getPaymentFormOptions } from "@/lib/data/payments"
import { emptyPaymentFormDefaults } from "@/lib/forms/payment-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewPaymentPage() {
  const options = await getPaymentFormOptions()

  const defaultValues = emptyPaymentFormDefaults({
    bank_account_id: options.bankAccounts[0]?.id ?? "",
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add payment"
        description="Record cash in or out. Invoice, salary, and expense links are optional."
      />
      {options.canMutate && options.bankAccounts.length === 0 ? (
        <p className="rounded-af-card border border-af-warning/30 bg-af-soft-amber px-3 py-2 text-sm text-af-text-primary">
          Add at least one active bank account in Settings before recording payments.
        </p>
      ) : null}
      <PaymentForm
        mode="create"
        canMutate={options.canMutate}
        options={options}
        defaultValues={defaultValues}
      />
      <Link
        href="/payments"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to payments
      </Link>
    </div>
  )
}
