import Link from "next/link"
import { notFound } from "next/navigation"

import { InvoiceForm } from "@/components/invoices/invoice-form"
import { PageHeader } from "@/components/shell/page-header"
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
        description={
          row.invoice_number?.trim()
            ? row.invoice_number
            : `${row.year ?? "—"}-${String(row.month ?? 0).padStart(2, "0")} · ${row.period_code ?? "—"}`
        }
      />

      {query.saved === "1" ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground">
          Changes saved.
        </p>
      ) : null}

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
