import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { StatusBadge } from "@/components/shell/status-badge"
import { getActiveTeamMembers } from "@/lib/data/team"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { formatEur, formatInr } from "@/lib/format"

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

export default async function TeamPage() {
  const { rows, source } = await getActiveTeamMembers()
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="India delivery bench — roster from Supabase when configured, otherwise the same local fallback list used after seeding."
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Supabase env: {supabaseConfigured ? "present" : "not set"} · Roster
          source: {source === "database" ? "database" : "fallback"}.
        </span>
      </p>

      <SectionCard
        title="Roster"
        description={`Active team members · sorted by name · ${source === "database" ? "team_members table" : "built-in fallback (see mockTeamFallbackMembers)"}.`}
      >
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableTh>Name</DataTableTh>
              <DataTableTh>Role</DataTableTh>
              <DataTableTh align="right">Base salary</DataTableTh>
              <DataTableTh>Currency</DataTableTh>
              <DataTableTh>Bank</DataTableTh>
              <DataTableTh>Active</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
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
                    <span className="text-sm text-muted-foreground">Inactive</span>
                  )}
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
