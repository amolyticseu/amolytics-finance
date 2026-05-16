import Link from "next/link"
import { notFound } from "next/navigation"

import { PaymentForm } from "@/components/payments/payment-form"
import { PageHeader } from "@/components/shell/page-header"
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
        description={`${row.payment_date} · ${row.direction === "in" ? "In" : "Out"} · ${row.amount} ${row.currency}`}
      />

      {query.saved === "1" ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground">
          Changes saved.
        </p>
      ) : null}

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
