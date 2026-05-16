import Link from "next/link"
import { notFound } from "next/navigation"

import { ClientForm } from "@/components/clients/client-form"
import { PageHeader } from "@/components/shell/page-header"
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
        description={`${row.code} · ${row.name}`}
      />

      {query.saved === "1" ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground">
          Changes saved.
        </p>
      ) : null}

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
