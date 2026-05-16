import Link from "next/link"

import { ClientForm } from "@/components/clients/client-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getClientsForManage } from "@/lib/data/clients"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewClientPage() {
  const { canMutate } = await getClientsForManage()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add client"
        description="Add a billing client for invoices and reporting."
      />
      <ClientForm
        mode="create"
        canMutate={canMutate}
        defaultValues={{
          name: "",
          code: "",
          contact_name: "",
          email: "",
          hourly_rate: "",
          currency: "EUR",
          billing_cycle_notes: "",
        }}
      />
      <Link
        href="/settings/clients"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to clients
      </Link>
    </div>
  )
}
