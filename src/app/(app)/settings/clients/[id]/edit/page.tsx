import Link from "next/link"
import { notFound } from "next/navigation"

import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { ClientForm } from "@/components/clients/client-form"
import { displayClientLabel } from "@/lib/settings/presentation"
import { buttonVariants } from "@/components/ui/button"
import { clientToFormDefaults } from "@/lib/forms/client-form-defaults"
import { getClientById } from "@/lib/data/clients"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditClientPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditClientPage({
  params,
  searchParams,
}: EditClientPageProps) {
  const { id } = await params
  const query = await searchParams
  const { row, canMutate } = await getClientById(id)

  if (!row) notFound()

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit client" : "View client"}
        description={`${displayClientLabel(row)} — billing client profile.`}
      />

      {query.saved === "1" ? <PageAlert>Changes saved.</PageAlert> : null}

      <ClientForm
        mode="edit"
        canMutate={canMutate}
        isActive={row.active}
        defaultValues={clientToFormDefaults(row)}
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
