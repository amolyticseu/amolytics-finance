import Link from "next/link"
import {
  Banknote,
  CheckCircle2,
  Clock,
  FileWarning,
  PieChart,
  ShieldCheck,
} from "lucide-react"

import { PayoutStatusChart } from "@/components/salaries/payout-status-chart"
import { SalariesLifecycle } from "@/components/salaries/salaries-lifecycle"
import { SalariesPayrollFocus } from "@/components/salaries/salaries-payroll-focus"
import { SalariesProofChecklist } from "@/components/salaries/salaries-proof-checklist"
import { SalariesTeamPayoutSummary } from "@/components/salaries/salaries-team-payout-summary"
import { SalaryBurnTrendChart } from "@/components/salaries/salary-burn-trend-chart"
import { SalaryPanelCard } from "@/components/salaries/salary-panel-card"
import { SalaryProofCompact } from "@/components/salaries/salary-proof-compact"
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
import { buttonVariants } from "@/components/ui/button"
import { getSalaryPayments } from "@/lib/data/salaries"
import { formatCompactEur, formatEur, formatInr } from "@/lib/format"
import {
  buildPayrollFocusItems,
  buildPayoutStatusBreakdown,
  buildSalaryBurnTrendSeries,
  buildSalaryKpis,
  buildSalaryLifecycleStages,
  buildSalaryProofChecklist,
  buildTeamPayoutSummary,
  displayReference,
  displayRole,
  displayTeamMember,
  monthYearLabel,
  proofPercent,
  salaryStatusSoftToken,
} from "@/lib/salaries/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { SalaryPaymentListItem } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—"
  if (currency === "INR") return formatInr(amount)
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${currency}`
}

type SalariesPageProps = {
  searchParams: Promise<{ showDeleted?: string; deleted?: string }>
}

export default async function SalariesPage({ searchParams }: SalariesPageProps) {
  const params = await searchParams
  const includeDeleted = params.showDeleted === "1"
  const { rows, source, canMutate } = await getSalaryPayments({ includeDeleted })
  const supabaseConfigured = hasSupabaseEnv()

  const kpis = buildSalaryKpis(rows)
  const trendSeries = buildSalaryBurnTrendSeries(rows)
  const payoutStatus = buildPayoutStatusBreakdown(rows)
  const focusItems = buildPayrollFocusItems(rows)
  const lifecycleStages = buildSalaryLifecycleStages(rows)
  const proofChecklist = buildSalaryProofChecklist(rows)
  const teamSummary = buildTeamPayoutSummary(rows)

  const registerDescription = includeDeleted
    ? "Including soft-deleted salary payments."
    : source === "database"
      ? "Active rows from Supabase. Team member column uses presentation labels."
      : "Mock lines for local development. Presentation labels applied."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salaries"
        description="Track team payouts, salary status, references, and proof readiness."
        actions={
          canMutate ? (
            <Link
              href="/salaries/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add salary payment
            </Link>
          ) : null
        }
      />

      {params.deleted === "1" ? (
        <PageAlert>Salary payment removed from the active register.</PageAlert>
      ) : null}

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={source}
          sourceLabel={
            source === "database"
              ? "salary_payments (+ team_members & bank_accounts joins)"
              : "built-in mock lines"
          }
          canMutate={canMutate}
        />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Salary summary"
      >
        <PremiumKpiCard
          label="Total Salary Burn"
          value={formatCompactEur(kpis.totalSalaryBurnEur)}
          icon={<Banknote aria-hidden />}
          badge="EUR equiv."
          helper="Active payroll lines"
          variant="blue"
        />
        <PremiumKpiCard
          label="Paid This Month"
          value={formatCompactEur(kpis.paidThisMonthEur)}
          icon={<CheckCircle2 aria-hidden />}
          badge="Current"
          helper="Paid in period"
          variant="green"
        />
        <PremiumKpiCard
          label="Pending Payouts"
          value={String(kpis.pendingPayoutsCount)}
          icon={<Clock aria-hidden />}
          badge="Awaiting"
          helper="Status pending"
          variant="amber"
        />
        <PremiumKpiCard
          label="Partial Payments"
          value={String(kpis.partialPaymentsCount)}
          icon={<PieChart aria-hidden />}
          badge="Incomplete"
          helper="Status partial"
          variant="teal"
        />
        <PremiumKpiCard
          label="Proof Completion"
          value={`${kpis.proofCompletionPercent}%`}
          icon={<ShieldCheck aria-hidden />}
          badge="Readiness"
          helper="Avg checklist score"
          variant="green"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <SalaryPanelCard
          className="xl:col-span-2"
          title="Salary Burn Trend"
          description="Monthly salary movement and payout visibility"
        >
          <SalaryBurnTrendChart data={trendSeries} />
        </SalaryPanelCard>

        <SalaryPanelCard title="Payout Status" description="EUR-equivalent mix by status">
          <PayoutStatusChart data={payoutStatus} />
        </SalaryPanelCard>
      </div>

      <SalariesLifecycle stages={lifecycleStages} />

      <div className="grid gap-6 xl:grid-cols-3">
        <SalaryPanelCard
          className="xl:col-span-2"
          title="Salaries Register"
          description="Monitor team payouts, salary status, transaction references, and proof readiness."
          action={
            <Link
              href={includeDeleted ? "/salaries" : "/salaries?showDeleted=1"}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {includeDeleted ? "Hide removed" : "Show removed"}
            </Link>
          }
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {rows.length === 0 ? (
            <EmptyTableState message="No salary payments to show. Add one when Supabase is connected, or check Show removed." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-6xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Month</DataTableTh>
                    <DataTableTh>Team Member</DataTableTh>
                    <DataTableTh>Role</DataTableTh>
                    <DataTableTh align="right">Base Amount</DataTableTh>
                    <DataTableTh align="right">Reimbursement</DataTableTh>
                    <DataTableTh align="right">Deduction</DataTableTh>
                    <DataTableTh align="right">Total</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                    <DataTableTh>Payment Date</DataTableTh>
                    <DataTableTh>Reference</DataTableTh>
                    <DataTableTh>Proof</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {rows.map((row) => (
                    <SalaryRegisterRow
                      key={row.id}
                      row={row}
                      canMutate={canMutate}
                    />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </SalaryPanelCard>

        <div className="space-y-6">
          <SalariesPayrollFocus items={focusItems} />
          <SalariesTeamPayoutSummary rows={teamSummary} />
          <SalariesProofChecklist items={proofChecklist} />
        </div>
      </div>

      <p className="flex items-center gap-2 text-af-helper text-af-text-muted">
        <FileWarning className="size-3.5 shrink-0" aria-hidden />
        Register team member names are presentation-only (Team Member 01–05). KPI totals
        use EUR equivalents from the current list. Forms still use real team options when
        Supabase is connected.
      </p>
    </div>
  )
}

function SalaryRegisterRow({
  row,
  canMutate,
}: {
  row: SalaryPaymentListItem
  canMutate: boolean
}) {
  const ref = displayReference(row)

  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd className="font-medium tabular-nums text-af-text-primary">
        {monthYearLabel(row.month, row.year)}
      </DataTableTd>
      <DataTableTd className="font-medium text-af-text-primary">
        {displayTeamMember(row)}
      </DataTableTd>
      <DataTableTd className="text-af-text-secondary">{displayRole(row)}</DataTableTd>
      <DataTableTd align="right" className="tabular-nums text-af-text-primary">
        {formatMoney(row.base_amount, row.currency)}
      </DataTableTd>
      <DataTableTd align="right" className="tabular-nums text-af-text-primary">
        {formatMoney(row.reimbursement, row.currency)}
      </DataTableTd>
      <DataTableTd align="right" className="tabular-nums text-af-text-primary">
        {formatMoney(row.deduction, row.currency)}
      </DataTableTd>
      <DataTableTd align="right" className="font-medium tabular-nums text-af-text-primary">
        {formatMoney(row.total_amount, row.currency)}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={salaryStatusSoftToken(row)} />
      </DataTableTd>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {row.payment_date ?? (
          <span className="italic text-af-text-muted">Pending</span>
        )}
      </DataTableTd>
      <DataTableTd>
        {ref === "—" ? (
          <span className="text-af-text-muted">—</span>
        ) : (
          <SoftStatusBadge status="secondary" label={ref} />
        )}
      </DataTableTd>
      <DataTableTd>
        <SalaryProofCompact percent={proofPercent(row)} />
      </DataTableTd>
      <DataTableTd align="right">
        <Link
          href={`/salaries/${row.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {canMutate ? "Edit" : "View"}
        </Link>
      </DataTableTd>
    </tr>
  )
}
