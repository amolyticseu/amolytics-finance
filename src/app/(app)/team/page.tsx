import Link from "next/link"

import { DataSourceNote } from "@/components/shell/data-source-note"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { EmptyTableState } from "@/components/shell/empty-table-state"
import { dataTableRowClassName } from "@/components/shell/data-table"
import { SectionCard } from "@/components/shell/section-card"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { StatusBadge } from "@/components/shell/status-badge"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getTeamMembersForManage } from "@/lib/data/team"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { formatEur, formatInr } from "@/lib/format"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function formatSalary(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—"
  if (currency === "INR") return formatInr(amount)
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IN")} ${currency}`
}

function formatBank(row: {
  bank_name: string | null
  bank_account_masked: string | null
}): string {
  const parts = [row.bank_name, row.bank_account_masked].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : "—"
}

type TeamPageProps = {
  searchParams: Promise<{ showInactive?: string; deactivated?: string }>
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const params = await searchParams
  const includeInactive = params.showInactive === "1"
  const { rows, source, canMutate } = await getTeamMembersForManage({
    includeInactive,
  })
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="India delivery bench — roster from Supabase when configured, otherwise local fallback."
        actions={
          canMutate ? (
            <Link
              href="/team/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add member
            </Link>
          ) : null
        }
      />

      {params.deactivated === "1" ? (
        <PageAlert>Team member deactivated.</PageAlert>
      ) : null}

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database" ? "team_members table" : "built-in fallback roster"
        }
        canMutate={canMutate}
      />

      <SectionCard
        title="Roster"
        description={
          includeInactive
            ? "Including inactive members."
            : `Active team members · ${source === "database" ? "team_members table" : "built-in fallback"}.`
        }
        action={
          <Link
            href={includeInactive ? "/team" : "/team?showInactive=1"}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {includeInactive ? "Hide inactive" : "Show inactive"}
          </Link>
        }
      >
        {rows.length === 0 ? (
          <EmptyTableState message="No team members to show. Add one when Supabase is connected, or check Show inactive." />
        ) : (
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableTh>Name</DataTableTh>
              <DataTableTh>Role</DataTableTh>
              <DataTableTh align="right">Base salary</DataTableTh>
              <DataTableTh>Currency</DataTableTh>
              <DataTableTh>Bank</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh align="right">Actions</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((m) => (
              <tr key={m.id} className={dataTableRowClassName}>
                <DataTableTd className="font-medium">{m.name}</DataTableTd>
                <DataTableTd className="text-muted-foreground">
                  {m.role ?? "—"}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {formatSalary(m.base_salary, m.currency)}
                </DataTableTd>
                <DataTableTd>{m.currency}</DataTableTd>
                <DataTableTd className="max-w-[200px] text-muted-foreground">
                  {formatBank(m)}
                </DataTableTd>
                <DataTableTd>
                  {m.active ? (
                    <StatusBadge status="active" />
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </DataTableTd>
                <DataTableTd align="right">
                  <Link
                    href={`/team/${m.id}/edit`}
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
    </div>
  )
}
