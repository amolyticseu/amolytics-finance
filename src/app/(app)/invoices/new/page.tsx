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
        description="Manual invoice entry — client, T01–T03 period, amounts, and status. No PDF or payment rows."
      />
      {canMutate && clients.length === 0 ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
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
