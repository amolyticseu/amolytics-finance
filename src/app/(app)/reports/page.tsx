import Link from "next/link"
import {
  ArrowRightLeft,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Users,
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
import { PageHeader } from "@/components/shell/page-header"
import { ReportsAvailableGrid } from "@/components/reports/reports-available-grid"
import { ReportsBreakdownRow } from "@/components/reports/reports-breakdown-row"
import { ReportsClosingFocus } from "@/components/reports/reports-closing-focus"
import { ReportsExportPanel } from "@/components/reports/reports-export-panel"
import { ReportsHealthChecklist } from "@/components/reports/reports-health-checklist"
import { ReportsMonthlyPlChart } from "@/components/reports/reports-monthly-pl-chart"
import { ReportsPanelCard } from "@/components/reports/reports-panel-card"
import { ReportsProofCompact } from "@/components/reports/reports-proof-compact"
import { buttonVariants } from "@/components/ui/button"
import { getMonthlyProfitLossReport } from "@/lib/data/reports"
import { formatCompactEur, formatEur } from "@/lib/format"
import {
  buildAvailableReports,
  buildCashMovementSummary,
  buildClosingFocusItems,
  buildExpenseBreakdown,
  buildExportOptions,
  buildMonthlyPlSeries,
  buildReportHealthItems,
  buildReportKpis,
  buildRevenueBreakdown,
  buildSnapshotRows,
  profitLossToken,
} from "@/lib/reports/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const report = await getMonthlyProfitLossReport()
  const supabaseConfigured = hasSupabaseEnv()

  const kpis = buildReportKpis(report)
  const plSeries = buildMonthlyPlSeries(report)
  const healthItems = buildReportHealthItems(report)
  const revenueBreakdown = buildRevenueBreakdown(report)
  const expenseBreakdown = buildExpenseBreakdown(report)
  const cashMovement = buildCashMovementSummary(report)
  const snapshots = buildSnapshotRows(report)
  const closingFocus = buildClosingFocusItems(report)
  const availableReports = buildAvailableReports(report)
  const exportOptions = buildExportOptions()

  const registerDescription =
    report.source === "database"
      ? "Rows from monthly_snapshots — presentation labels only."
      : "Mock monthly P&L series for local development."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Review monthly performance, P&L, cash movement, and closing readiness."
      />

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={report.source}
          sourceLabel={
            report.source === "database"
              ? "monthly_snapshots"
              : "mock monthly P&L series"
          }
        />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Reports summary"
      >
        <PremiumKpiCard
          label="Total Revenue"
          value={formatCompactEur(kpis.totalRevenueEur)}
          icon={<TrendingUp aria-hidden />}
          badge="Series"
          helper="Across trailing months"
          variant="blue"
        />
        <PremiumKpiCard
          label="Total Expenses"
          value={formatCompactEur(kpis.totalExpensesEur)}
          icon={<PiggyBank aria-hidden />}
          badge="Series"
          helper="Operating costs"
          variant="amber"
        />
        <PremiumKpiCard
          label="Net Profit"
          value={formatCompactEur(kpis.netProfitEur)}
          icon={<ArrowRightLeft aria-hidden />}
          badge="P&L"
          helper="Revenue minus expenses"
          variant="green"
        />
        <PremiumKpiCard
          label="Salary Burn"
          value={formatCompactEur(kpis.salaryBurnEur)}
          icon={<Users aria-hidden />}
          badge="EUR equiv."
          helper="Payroll load"
          variant="purple"
        />
        <PremiumKpiCard
          label="Closing Readiness"
          value={`${kpis.closingReadinessPercent}%`}
          icon={<ShieldCheck aria-hidden />}
          badge="Readiness"
          helper="Proof & close signals"
          variant="teal"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <ReportsPanelCard
          id="monthly-pl"
          className="xl:col-span-2"
          title="Monthly P&L"
          description="Revenue, expenses, and profit trend across selected months."
        >
          <ReportsMonthlyPlChart data={plSeries} />
        </ReportsPanelCard>

        <ReportsHealthChecklist items={healthItems} />
      </div>

      <ReportsBreakdownRow
        revenue={revenueBreakdown}
        expenses={expenseBreakdown}
        cash={cashMovement}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <ReportsPanelCard
          id="monthly-snapshots"
          className="xl:col-span-2"
          title="Monthly Snapshots"
          description="Month-by-month financial performance summary."
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {snapshots.length === 0 ? (
            <EmptyTableState message="No monthly snapshots to show." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-6xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Month</DataTableTh>
                    <DataTableTh align="right">Revenue</DataTableTh>
                    <DataTableTh align="right">Expenses</DataTableTh>
                    <DataTableTh align="right">Salaries</DataTableTh>
                    <DataTableTh align="right">Net Profit</DataTableTh>
                    <DataTableTh align="right">Margin</DataTableTh>
                    <DataTableTh>Proof Readiness</DataTableTh>
                    <DataTableTh>Close Status</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {snapshots.map((row) => (
                    <tr key={row.id} className={dataTableRowClassName}>
                      <DataTableTd className="font-medium text-af-text-primary">
                        {row.monthLabel}
                      </DataTableTd>
                      <DataTableTd align="right" className="tabular-nums">
                        {formatEur(row.revenueEur)}
                      </DataTableTd>
                      <DataTableTd align="right" className="tabular-nums text-af-text-secondary">
                        {formatEur(row.expensesEur)}
                      </DataTableTd>
                      <DataTableTd align="right" className="tabular-nums text-af-text-secondary">
                        {formatEur(row.salariesEur)}
                      </DataTableTd>
                      <DataTableTd align="right">
                        <SoftStatusBadge
                          status={profitLossToken(row.netProfitEur)}
                          label={formatCompactEur(row.netProfitEur)}
                        />
                      </DataTableTd>
                      <DataTableTd align="right" className="tabular-nums text-af-text-secondary">
                        {row.marginPercent}%
                      </DataTableTd>
                      <DataTableTd>
                        <ReportsProofCompact percent={row.proofPercent} />
                      </DataTableTd>
                      <DataTableTd>
                        <SoftStatusBadge
                          status={row.closeToken}
                          label={
                            row.closeStatus === "ready"
                              ? "Ready"
                              : row.closeStatus === "partial"
                                ? "Partial"
                                : "Pending"
                          }
                        />
                      </DataTableTd>
                      <DataTableTd align="right">
                        <Link
                          href="#monthly-pl"
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                        >
                          View
                        </Link>
                      </DataTableTd>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </ReportsPanelCard>

        <ReportsClosingFocus items={closingFocus} />
      </div>

      <ReportsAvailableGrid cards={availableReports} />

      <ReportsExportPanel options={exportOptions} />

      <p className="text-af-helper text-af-text-muted">
        Breakdown labels are presentation-only (Client Revenue, Operations, etc.). Values
        derive from the current monthly snapshot series. No export or automation is enabled.
      </p>
    </div>
  )
}
