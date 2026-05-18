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
import { getBankAccountsForManage } from "@/lib/data/bank-accounts"
import {
  bankStatusToken,
  displayAccountLabel,
  displayInstitutionLabel,
  displayMaskedId,
} from "@/lib/settings/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type BankAccountsPageProps = {
  searchParams: Promise<{ showInactive?: string; deactivated?: string }>
}

export default async function BankAccountsManagePage({
  searchParams,
}: BankAccountsPageProps) {
  const params = await searchParams
  const includeInactive = params.showInactive === "1"
  const { rows, source, canMutate } = await getBankAccountsForManage({
    includeInactive,
  })
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bank accounts"
        description="Flexible account records with masked identifiers only. Presentation labels applied in the register."
        actions={
          canMutate ? (
            <Link
              href="/settings/bank-accounts/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add account
            </Link>
          ) : null
        }
      />

      {params.deactivated === "1" ? (
        <PageAlert>Bank account deactivated.</PageAlert>
      ) : null}

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={source}
          sourceLabel={
            source === "database" ? "bank_accounts table" : "built-in fallback"
          }
          canMutate={canMutate}
          variant="compact"
        />
      </div>

      <SettingsPanelCard
        title="Accounts"
        description={
          includeInactive
            ? "Including inactive or soft-deleted rows."
            : "Active accounts only (active, not deleted)."
        }
        action={
          <Link
            href={
              includeInactive
                ? "/settings/bank-accounts"
                : "/settings/bank-accounts?showInactive=1"
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
                ? "No bank accounts yet. Add the first account."
                : "No accounts to show. Connect Supabase to add accounts."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <DataTable className="min-w-4xl border-0 bg-transparent shadow-none">
              <DataTableHeader>
                <tr>
                  <DataTableTh>Account</DataTableTh>
                  <DataTableTh>Institution</DataTableTh>
                  <DataTableTh>Masked ID</DataTableTh>
                  <DataTableTh>Currency</DataTableTh>
                  <DataTableTh>Status</DataTableTh>
                  <DataTableTh align="right">Actions</DataTableTh>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {rows.map((b) => (
                  <tr key={b.id} className={dataTableRowClassName}>
                    <DataTableTd className="font-medium text-af-text-primary">
                      {displayAccountLabel(b)}
                    </DataTableTd>
                    <DataTableTd className="text-af-text-secondary">
                      {displayInstitutionLabel(b)}
                    </DataTableTd>
                    <DataTableTd className="font-mono text-xs text-af-text-muted">
                      {displayMaskedId(b)}
                    </DataTableTd>
                    <DataTableTd>{b.currency}</DataTableTd>
                    <DataTableTd>
                      <SoftStatusBadge status={bankStatusToken(b)} />
                    </DataTableTd>
                    <DataTableTd align="right">
                      <Link
                        href={`/settings/bank-accounts/${b.id}/edit`}
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
