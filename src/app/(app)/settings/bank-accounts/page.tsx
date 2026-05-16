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
import { getBankAccountsForManage } from "@/lib/data/bank-accounts"
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
        description="Flexible account records with masked identifiers only. HSBC Malta is the primary client invoice payment account; Wise is not the default for new invoices."
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

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database" ? "bank_accounts table" : "built-in fallback"
        }
        canMutate={canMutate}
        variant="compact"
      />

      <SectionCard
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
          <p className="text-sm text-muted-foreground">
            No bank accounts yet.{" "}
            {canMutate ? (
              <Link
                href="/settings/bank-accounts/new"
                className="text-primary underline-offset-4 hover:underline"
              >
                Add the first account
              </Link>
            ) : (
              "Connect Supabase to add accounts."
            )}
          </p>
        ) : (
          <DataTable>
            <DataTableHeader>
              <tr>
                <DataTableTh>Account</DataTableTh>
                <DataTableTh>Institution</DataTableTh>
                <DataTableTh>Masked ID</DataTableTh>
                <DataTableTh>CCY</DataTableTh>
                <DataTableTh>Status</DataTableTh>
                <DataTableTh align="right">Actions</DataTableTh>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
                >
                  <DataTableTd className="font-medium">{b.account_name}</DataTableTd>
                  <DataTableTd>{b.institution_name}</DataTableTd>
                  <DataTableTd className="font-mono text-xs text-muted-foreground">
                    {b.iban_masked ?? "—"}
                  </DataTableTd>
                  <DataTableTd>{b.currency}</DataTableTd>
                  <DataTableTd>
                    {b.active && !b.deleted_at ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
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
