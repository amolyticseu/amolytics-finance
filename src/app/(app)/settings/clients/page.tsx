import Link from "next/link"

import { SoftStatusBadge } from "@/components/design-system"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
  dataTableRowClassName,
} from "@/components/shell/data-table"
import { DataSourceNote } from "@/components/shell/data-source-note"
import { EmptyTableState } from "@/components/shell/empty-table-state"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { SettingsPanelCard } from "@/components/settings/settings-panel-card"
import { buttonVariants } from "@/components/ui/button"
import { getClientsForManage } from "@/lib/data/clients"
import {
  clientStatusToken,
  displayClientCode,
  displayClientLabel,
  displayContactLabel,
} from "@/lib/settings/presentation"
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

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={source}
          sourceLabel={source === "database" ? "clients table" : "built-in fallback"}
          canMutate={canMutate}
          variant="compact"
        />
      </div>

      <SettingsPanelCard
        title="All clients"
        description={
          includeInactive
            ? "Including inactive clients — presentation labels in table."
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
          <EmptyTableState
            message={
              canMutate
                ? "No clients yet. Add the first client."
                : "No clients to show. Connect Supabase to add clients."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <DataTable className="min-w-4xl border-0 bg-transparent shadow-none">
              <DataTableHeader>
                <tr>
                  <DataTableTh>Client</DataTableTh>
                  <DataTableTh>Code</DataTableTh>
                  <DataTableTh>Contact</DataTableTh>
                  <DataTableTh align="right">Rate</DataTableTh>
                  <DataTableTh>Currency</DataTableTh>
                  <DataTableTh>Status</DataTableTh>
                  <DataTableTh align="right">Actions</DataTableTh>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {rows.map((c) => (
                  <tr key={c.id} className={dataTableRowClassName}>
                    <DataTableTd className="font-medium text-af-text-primary">
                      {displayClientLabel(c)}
                    </DataTableTd>
                    <DataTableTd className="font-mono text-xs text-af-text-secondary">
                      {displayClientCode(c)}
                    </DataTableTd>
                    <DataTableTd className="text-af-text-secondary">
                      {displayContactLabel(c)}
                    </DataTableTd>
                    <DataTableTd align="right" className="tabular-nums">
                      {c.hourly_rate != null ? `€${c.hourly_rate}` : "—"}
                    </DataTableTd>
                    <DataTableTd>{c.currency}</DataTableTd>
                    <DataTableTd>
                      <SoftStatusBadge status={clientStatusToken(c.active)} />
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
          </div>
        )}
      </SettingsPanelCard>

      <Link
        href="/settings"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to settings
      </Link>
    </div>
  )
}
