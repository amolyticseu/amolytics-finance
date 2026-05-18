import Link from "next/link"

import { InvoiceForm } from "@/components/invoices/invoice-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getInvoiceFormOptions } from "@/lib/data/invoices"
import { emptyInvoiceFormDefaults } from "@/lib/forms/invoice-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewInvoicePage() {
  const { clients, bankAccounts, canMutate } = await getInvoiceFormOptions()

  const defaultValues = emptyInvoiceFormDefaults({
    client_id: clients[0]?.id ?? "",
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add invoice"
        description="Manual invoice entry — client, T01–T03 period, amounts, and status."
      />
      {canMutate && clients.length === 0 ? (
        <p className="rounded-af-card border border-af-warning/30 bg-af-soft-amber px-3 py-2 text-sm text-af-text-primary">
          Add at least one active client in Settings before creating an invoice.
        </p>
      ) : null}
      <InvoiceForm
        mode="create"
        canMutate={canMutate}
        clients={clients}
        bankAccounts={bankAccounts}
        defaultValues={defaultValues}
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
