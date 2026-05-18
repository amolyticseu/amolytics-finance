import Link from "next/link"
import { notFound } from "next/navigation"

import { InvoiceForm } from "@/components/invoices/invoice-form"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import {
  displayClientLabel,
  formatPeriodLabel,
} from "@/lib/invoices/presentation"
import { buttonVariants } from "@/components/ui/button"
import { getInvoiceById, getInvoiceFormOptions } from "@/lib/data/invoices"
import { invoiceToFormDefaults } from "@/lib/forms/invoice-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditInvoicePageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditInvoicePage({
  params,
  searchParams,
}: EditInvoicePageProps) {
  const { id } = await params
  const query = await searchParams
  const [{ row, canMutate }, options] = await Promise.all([
    getInvoiceById(id),
    getInvoiceFormOptions(),
  ])

  if (!row) notFound()

  const isCancelled =
    row.status === "cancelled" || row.deleted_at != null

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit invoice" : "View invoice"}
        description={`${displayClientLabel(row)} · ${formatPeriodLabel(row)}`}
      />

      {query.saved === "1" ? <PageAlert>Changes saved.</PageAlert> : null}

      <InvoiceForm
        mode="edit"
        canMutate={canMutate}
        isCancelled={isCancelled}
        clients={options.clients}
        bankAccounts={options.bankAccounts}
        defaultValues={invoiceToFormDefaults(row)}
      />

      <Link
        href="/invoices"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to invoices
      </Link>
    </div>
  )
}
