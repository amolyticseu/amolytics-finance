import Link from "next/link"
import {
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { DashboardComplianceTasks } from "@/components/dashboard/dashboard-compliance-tasks"
import { DashboardMonthlyClose } from "@/components/dashboard/dashboard-monthly-close"
import { DashboardPanelCard } from "@/components/dashboard/dashboard-panel-card"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart"
import { FinanceSnapshotCard } from "@/components/dashboard/finance-snapshot-card"
import { RevenueVsExpensesChart } from "@/components/dashboard/revenue-vs-expenses-chart"
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
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import {
  KPI_TRENDS,
  buildExpenseBreakdown,
  buildRevenueExpenseChartSeries,
  financeStatusToSoftToken,
  getComplianceTasksWithStatus,
  getFinanceSnapshot,
  getPendingInvoicesPresentation,
  getRecentPaymentsPresentation,
} from "@/lib/dashboard/presentation"
import { getDashboardSummary } from "@/lib/data/dashboard"
import { formatCompactEur, formatEur } from "@/lib/format"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { summary, source } = await getDashboardSummary()
  const supabaseConfigured = hasSupabaseEnv()

  const chartSeries = buildRevenueExpenseChartSeries(summary)
  const pendingInvoices = getPendingInvoicesPresentation(summary)
  const recentPayments = getRecentPaymentsPresentation()
  const complianceTasks = getComplianceTasksWithStatus(summary)
  const expenseBreakdown = buildExpenseBreakdown(summary)
  const snapshot = getFinanceSnapshot(summary)

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100svh-var(--af-header-height))] bg-af-soft-gray md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8">
      <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
        <PageHeader
          title="Dashboard"
          description="Founder overview — revenue, expenses, and operational health at a glance."
        />

        <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
          <DataSourceNote
            supabaseConfigured={supabaseConfigured}
            source={source}
            sourceLabel={
              source === "database"
                ? "aggregates from invoices, expenses, salary_payments, tasks, exchange_rates"
                : "mock figures + presentation tables"
            }
          />
        </div>

        <section
          className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
          aria-label="Key performance indicators"
        >
          <PremiumKpiCard
            label="Revenue This Month"
            value={formatCompactEur(summary.revenueThisMonth)}
            icon={<TrendingUp aria-hidden />}
            badge={KPI_TRENDS.revenue.label}
            helper="vs prior month (preview)"
            variant="blue"
          />
          <PremiumKpiCard
            label="Expenses This Month"
            value={formatEur(summary.expensesThisMonth)}
            icon={<PiggyBank aria-hidden />}
            badge={KPI_TRENDS.expenses.label}
            helper="Operating spend"
            variant="amber"
          />
          <PremiumKpiCard
            label="Net Profit"
            value={formatEur(summary.estimatedProfitLoss)}
            icon={<ArrowRightLeft aria-hidden />}
            badge={KPI_TRENDS.profit.label}
            helper="Estimated P&L"
            variant="green"
          />
          <PremiumKpiCard
            label="Pending Invoices"
            value={String(summary.pendingInvoicesCount)}
            icon={<FileText aria-hidden />}
            badge={KPI_TRENDS.pendingInvoices.label}
            helper="Awaiting collection"
            variant="blue"
          />
          <PremiumKpiCard
            label="Pending Payouts"
            value={String(summary.pendingSalariesCount)}
            icon={<Wallet aria-hidden />}
            badge={KPI_TRENDS.pendingPayouts.label}
            helper="Salary runs"
            variant="amber"
          />
          <PremiumKpiCard
            label="Upcoming Tasks"
            value={String(summary.upcomingTasksCount)}
            icon={<CalendarClock aria-hidden />}
            badge={KPI_TRENDS.upcomingTasks.label}
            helper="Due soon"
            variant="teal"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <DashboardPanelCard
            className="xl:col-span-2"
            title="Revenue vs Expenses"
            description="Monthly financial performance"
          >
            <RevenueVsExpensesChart data={chartSeries} />
          </DashboardPanelCard>

          <div className="space-y-6">
            <DashboardQuickActions />
            <FinanceSnapshotCard
              activeClients={snapshot.activeClients}
              activeTeam={snapshot.activeTeam}
              rebillablePendingEur={snapshot.rebillablePendingEur}
              cashHealth={snapshot.cashHealth}
            />
            <DashboardMonthlyClose />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardPanelCard
            title="Pending Invoices"
            description="Invoices awaiting payment"
            action={
              <Link
                href="/invoices"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                View all
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <DataTable className="min-w-xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Invoice ID</DataTableTh>
                    <DataTableTh>Client</DataTableTh>
                    <DataTableTh align="right">Amount</DataTableTh>
                    <DataTableTh>Due Date</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {pendingInvoices.map((row) => (
                    <tr key={row.id} className={dataTableRowClassName}>
                      <DataTableTd className="font-mono text-xs text-af-text-secondary">
                        {row.id}
                      </DataTableTd>
                      <DataTableTd className="font-medium text-af-text-primary">
                        {row.client}
                      </DataTableTd>
                      <DataTableTd
                        align="right"
                        className="font-medium tabular-nums text-af-text-primary"
                      >
                        {formatEur(row.amountEur)}
                      </DataTableTd>
                      <DataTableTd className="tabular-nums text-af-text-secondary">
                        {row.dueDate}
                      </DataTableTd>
                      <DataTableTd>
                        <SoftStatusBadge status={financeStatusToSoftToken(row.status)} />
                      </DataTableTd>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          </DashboardPanelCard>

          <DashboardComplianceTasks tasks={complianceTasks} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardPanelCard
            title="Recent Payments"
            description="Latest payment activity"
            action={
              <Link
                href="/payments"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                View all
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <DataTable className="min-w-xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Date</DataTableTh>
                    <DataTableTh>Type</DataTableTh>
                    <DataTableTh align="right">Amount</DataTableTh>
                    <DataTableTh>Account</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {recentPayments.map((row, i) => (
                    <tr key={`${row.date}-${i}`} className={dataTableRowClassName}>
                      <DataTableTd className="tabular-nums text-af-text-secondary">
                        {row.date}
                      </DataTableTd>
                      <DataTableTd className="text-af-text-primary">{row.type}</DataTableTd>
                      <DataTableTd
                        align="right"
                        className="font-medium tabular-nums text-af-text-primary"
                      >
                        {formatEur(row.amountEur)}
                      </DataTableTd>
                      <DataTableTd className="text-af-text-secondary">
                        {row.account}
                      </DataTableTd>
                      <DataTableTd>
                        <SoftStatusBadge
                          status={financeStatusToSoftToken(row.status)}
                        />
                      </DataTableTd>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          </DashboardPanelCard>

          <DashboardPanelCard
            title="Expense Breakdown"
            description="Current month distribution"
          >
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </DashboardPanelCard>
        </div>

        <p className="flex items-center gap-2 text-af-helper text-af-text-muted">
          <CheckCircle2
            className="size-3.5 shrink-0 text-af-success"
            aria-hidden
          />
          Dashboard tables and task labels use presentation-only dummy data. KPI totals
          reflect your configured data source when available.
        </p>
      </div>
    </div>
  )
}
