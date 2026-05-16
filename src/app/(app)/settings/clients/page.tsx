import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { DataSourceNote } from "@/components/shell/data-source-note"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import { getClientsForManage } from "@/lib/data/clients"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type ClientsPageProps = {
  searchParams: Promise<{ showInactive?: string; deactivated?: string }>
}

export default async function ClientsManagePage({ searchParams }: ClientsPageProps) {
  const params = await searchParams
  const includeInactive = params.showInactive === "1"
  const { rows, source, canMutate } = await getClientsForManage({ includeInactive })
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clients"
        description="Create, edit, and deactivate billing clients. Inactive clients are hidden from default lists elsewhere."
        actions={
          canMutate ? (
            <Link
              href="/settings/clients/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add client
            </Link>
          ) : null
        }
      />

      {params.deactivated === "1" ? (
        <PageAlert>Client deactivated.</PageAlert>
      ) : null}

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={source === "database" ? "clients table" : "built-in fallback"}
        canMutate={canMutate}
        variant="compact"
      />

      <SectionCard
        title="All clients"
        description={
          includeInactive
            ? "Including inactive clients."
            : "Active clients only. Toggle below to include inactive."
        }
        action={
          <Link
            href={
              includeInactive
                ? "/settings/clients"
                : "/settings/clients?showInactive=1"
            }
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {includeInactive ? "Hide inactive" : "Show inactive"}
          </Link>
        }
      >
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No clients yet.{" "}
            {canMutate ? (
              <Link href="/settings/clients/new" className="text-primary underline-offset-4 hover:underline">
                Add the first client
              </Link>
            ) : (
              "Connect Supabase to add clients."
            )}
          </p>
        ) : (
          <DataTable>
            <DataTableHeader>
              <tr>
                <DataTableTh>Code</DataTableTh>
                <DataTableTh>Name</DataTableTh>
                <DataTableTh>Contact</DataTableTh>
                <DataTableTh align="right">Rate</DataTableTh>
                <DataTableTh>Status</DataTableTh>
                <DataTableTh align="right">Actions</DataTableTh>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
                >
                  <DataTableTd className="font-mono text-xs">{c.code}</DataTableTd>
                  <DataTableTd className="font-medium">{c.name}</DataTableTd>
                  <DataTableTd className="text-muted-foreground">
                    {c.contact_name ?? "—"}
                  </DataTableTd>
                  <DataTableTd align="right" className="tabular-nums">
                    {c.hourly_rate != null ? `€${c.hourly_rate}` : "—"}
                  </DataTableTd>
                  <DataTableTd>
                    {c.active ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </DataTableTd>
                  <DataTableTd align="right">
                    <Link
                      href={`/settings/clients/${c.id}/edit`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      {canMutate ? "Edit" : "View"}
                    </Link>
                  </DataTableTd>
                </tr>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </SectionCard>

      <Link
        href="/settings"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to settings
      </Link>
    </div>
  )
}
