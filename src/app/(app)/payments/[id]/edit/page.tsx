import Link from "next/link"
import { notFound } from "next/navigation"

import { PaymentForm } from "@/components/payments/payment-form"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { displayPaymentEditDescription } from "@/lib/payments/presentation"
import { buttonVariants } from "@/components/ui/button"
import { getPaymentById, getPaymentFormOptions } from "@/lib/data/payments"
import { paymentToFormDefaults } from "@/lib/forms/payment-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditPaymentPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditPaymentPage({
  params,
  searchParams,
}: EditPaymentPageProps) {
  const { id } = await params
  const query = await searchParams
  const [{ row, canMutate }, options] = await Promise.all([
    getPaymentById(id),
    getPaymentFormOptions(),
  ])

  if (!row) notFound()

  const isDeleted = row.deleted_at != null

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit payment" : "View payment"}
        description={`${displayPaymentEditDescription(row)} — payment record.`}
      />

      {query.saved === "1" ? <PageAlert>Changes saved.</PageAlert> : null}

      <PaymentForm
        mode="edit"
        canMutate={canMutate}
        isDeleted={isDeleted}
        options={options}
        defaultValues={paymentToFormDefaults(row)}
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
