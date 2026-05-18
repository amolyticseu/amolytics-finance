import Link from "next/link"
import {
  AlertCircle,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Wallet,
} from "lucide-react"

import { PremiumKpiCard, SoftStatusBadge } from "@/components/design-system"
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
import { ProfileHealthChart } from "@/components/team/profile-health-chart"
import { TeamCompositionChart } from "@/components/team/team-composition-chart"
import { TeamLifecycle } from "@/components/team/team-lifecycle"
import { TeamMemberAvatar } from "@/components/team/team-member-avatar"
import { TeamPanelCard } from "@/components/team/team-panel-card"
import { TeamPayrollReadiness } from "@/components/team/team-payroll-readiness"
import { TeamProfileChecklist } from "@/components/team/team-profile-checklist"
import { TeamProfileCompact } from "@/components/team/team-profile-compact"
import { TeamReadinessFocus } from "@/components/team/team-readiness-focus"
import { buttonVariants } from "@/components/ui/button"
import { getTeamMembersForManage } from "@/lib/data/team"
import { formatCompactEur, formatEur, formatInr } from "@/lib/format"
import {
  buildPayrollReadiness,
  buildProfileChecklist,
  buildProfileHealth,
  buildTeamComposition,
  buildTeamKpis,
  buildTeamLifecycleStages,
  buildTeamReadinessItems,
  displayBankInfo,
  displayLastPayout,
  displayMemberLabel,
  displayRoleLabel,
  memberInitials,
  profilePercent,
  roleSoftToken,
} from "@/lib/team/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { TeamMemberRow } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function formatSalary(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—"
  if (currency === "INR") return formatInr(amount)
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IN")} ${currency}`
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

  const kpis = buildTeamKpis(rows)
  const composition = buildTeamComposition(rows)
  const profileHealth = buildProfileHealth(rows)
  const readinessItems = buildTeamReadinessItems(rows)
  const profileChecklist = buildProfileChecklist(rows)
  const payrollReadiness = buildPayrollReadiness(rows)
  const lifecycleStages = buildTeamLifecycleStages(rows)

  const registerDescription = includeInactive
    ? "Including inactive members."
    : source === "database"
      ? "Active team members from Supabase. Member column uses presentation labels."
      : "Fallback roster for local development. Presentation labels applied."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Manage active members, roles, payout readiness, and profile completeness."
        actions={
          canMutate ? (
            <Link
              href="/team/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add team member
            </Link>
          ) : null
        }
      />

      {params.deactivated === "1" ? (
        <PageAlert>Team member deactivated.</PageAlert>
      ) : null}

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={source}
          sourceLabel={
            source === "database" ? "team_members table" : "built-in fallback roster"
          }
          canMutate={canMutate}
        />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Team summary"
      >
        <PremiumKpiCard
          label="Active Members"
          value={String(kpis.activeCount)}
          icon={<UserCheck aria-hidden />}
          badge="Roster"
          helper="Currently active"
          variant="green"
        />
        <PremiumKpiCard
          label="Inactive Members"
          value={String(kpis.inactiveCount)}
          icon={<UserMinus aria-hidden />}
          badge="Review"
          helper="Deactivated"
          variant="gray"
        />
        <PremiumKpiCard
          label="Monthly Payroll"
          value={formatCompactEur(kpis.monthlyPayrollEur)}
          icon={<Wallet aria-hidden />}
          badge="EUR equiv."
          helper="Active base salaries"
          variant="blue"
        />
        <PremiumKpiCard
          label="Missing Details"
          value={String(kpis.missingDetailsCount)}
          icon={<AlertCircle aria-hidden />}
          badge="Attention"
          helper="Role, bank, or salary"
          variant="amber"
        />
        <PremiumKpiCard
          label="Profile Completion"
          value={`${kpis.profileCompletionPercent}%`}
          icon={<ShieldCheck aria-hidden />}
          badge="Readiness"
          helper="Avg profile score"
          variant="teal"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <TeamPanelCard
          className="xl:col-span-2"
          title="Team Composition"
          description="Role distribution across the active team"
        >
          <TeamCompositionChart data={composition} />
        </TeamPanelCard>

        <TeamPanelCard title="Profile Health" description="Roster completeness segments">
          <ProfileHealthChart data={profileHealth} />
        </TeamPanelCard>
      </div>

      <TeamLifecycle stages={lifecycleStages} />

      <div className="grid gap-6 xl:grid-cols-3">
        <TeamPanelCard
          className="xl:col-span-2"
          title="Team Members"
          description="Monitor roles, active status, payout readiness, and profile completeness."
          action={
            <Link
              href={includeInactive ? "/team" : "/team?showInactive=1"}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {includeInactive ? "Hide inactive" : "Show inactive"}
            </Link>
          }
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {rows.length === 0 ? (
            <EmptyTableState message="No team members to show. Add one when Supabase is connected, or check Show inactive." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-5xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Member</DataTableTh>
                    <DataTableTh>Role</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                    <DataTableTh align="right">Base Salary</DataTableTh>
                    <DataTableTh>Currency</DataTableTh>
                    <DataTableTh>Bank Info</DataTableTh>
                    <DataTableTh>Last Payout</DataTableTh>
                    <DataTableTh>Profile</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {rows.map((row) => (
                    <TeamRegisterRow key={row.id} row={row} canMutate={canMutate} />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </TeamPanelCard>

        <div className="space-y-6">
          <TeamReadinessFocus items={readinessItems} />
          <TeamProfileChecklist items={profileChecklist} />
          <TeamPayrollReadiness rows={payrollReadiness} />
        </div>
      </div>

      <p className="text-af-helper text-af-text-muted">
        Register member names are presentation-only (Team Member 01–05). KPI totals use
        the current roster. Edit forms still show stored field values when Supabase is
        connected.
      </p>
    </div>
  )
}

function TeamRegisterRow({
  row,
  canMutate,
}: {
  row: TeamMemberRow
  canMutate: boolean
}) {
  const bank = displayBankInfo(row)

  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd>
        <div className="flex items-center gap-2.5">
          <TeamMemberAvatar initials={memberInitials(row)} />
          <span className="font-medium text-af-text-primary">
            {displayMemberLabel(row)}
          </span>
        </div>
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge
          status={roleSoftToken(row)}
          label={displayRoleLabel(row)}
        />
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={row.active ? "active" : "inactive"} />
      </DataTableTd>
      <DataTableTd align="right" className="tabular-nums text-af-text-primary">
        {formatSalary(row.base_salary, row.currency)}
      </DataTableTd>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {row.currency}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={bank.token} label={bank.label} />
      </DataTableTd>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {displayLastPayout(row)}
      </DataTableTd>
      <DataTableTd>
        <TeamProfileCompact percent={profilePercent(row)} />
      </DataTableTd>
      <DataTableTd align="right">
        <Link
          href={`/team/${row.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {canMutate ? "Edit" : "View"}
        </Link>
      </DataTableTd>
    </tr>
  )
}
