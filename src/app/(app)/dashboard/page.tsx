import { format } from "date-fns"
import {
  AlertCircle,
  ArrowRightLeft,
  CalendarClock,
  ClipboardList,
  IndianRupee,
  Landmark,
  PiggyBank,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

import { StatCard } from "@/components/dashboard/stat-card"
import { buttonVariants } from "@/components/ui/button"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { DataSourceNote } from "@/components/shell/data-source-note"
import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import { StatusBadge } from "@/components/shell/status-badge"
import {
  CLIENT_LABEL,
  HOURLY_RATE_EUR,
  REVENUE_TYPICAL_HIGH_EUR,
  REVENUE_TYPICAL_LOW_EUR,
} from "@/data/mock/constants"
import { getDashboardSummary } from "@/lib/data/dashboard"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { formatCompactEur, formatEur, formatInr } from "@/lib/format"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { summary, source } = await getDashboardSummary()
  const supabaseConfigured = hasSupabaseEnv()
  const today = new Date()
  const asOf = format(today, "d MMM yyyy")
  const rateLabel = Math.round(summary.exchangeRateInrPerEur)

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        description={`Calm overview for ${CLIENT_LABEL} — billable €${HOURLY_RATE_EUR}/h, planning rate ₹${rateLabel}/€. Figures as of ${asOf}.`}
        actions={
          <Link
            href="/reports"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View reports
          </Link>
        }
      />

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database"
            ? "aggregates from invoices, expenses, salary_payments, tasks, exchange_rates"
            : "mock figures + tables"
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Summary metrics"
      >
        <StatCard
          title="Monthly revenue"
          description={`Typical band ${formatCompactEur(REVENUE_TYPICAL_LOW_EUR)}–${formatCompactEur(REVENUE_TYPICAL_HIGH_EUR)}`}
          value={formatCompactEur(summary.revenueThisMonth)}
          hint="BMF · T01–T03 · accrual from invoiced (paid/sent/overdue) — payments not double-counted"
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly expenses"
          description="India EMI + Malta fixed + subs (from expense lines)"
          value={formatEur(summary.expensesThisMonth)}
          hint={`EMI ${formatEur(summary.expensesHintEmiEur)} · Malta ${formatEur(summary.expensesHintMaltaEur)} · Misc ${formatEur(summary.expensesHintMiscEur)}`}
          icon={PiggyBank}
        />
        <StatCard
          title="Est. profit / loss"
          description="Revenue − expenses − salaries (EUR, salaries converted)"
          value={formatEur(summary.estimatedProfitLoss)}
          hint="Before tax · single-entity view"
          icon={ArrowRightLeft}
        />
        <StatCard
          title="Pending invoices"
          description={summary.pendingInvoicesClientLabel}
          value={`${summary.pendingInvoicesCount} · ${formatCompactEur(summary.pendingInvoicesAmount)}`}
          hint="Sent or overdue, awaiting settlement"
          icon={Landmark}
        />
        <StatCard
          title="Pending salaries"
          description={summary.pendingSalariesPeriodLabel}
          value={`${summary.pendingSalariesCount} · ${formatInr(summary.pendingSalariesAmount)}`}
          hint="India payroll — pending or partial runs"
          icon={IndianRupee}
        />
        <StatCard
          title="Compliance tasks"
          description={`Next ${summary.complianceDueWithinDays} days`}
          value={`${summary.upcomingTasksCount} open`}
          hint={
            summary.overdueTasksCount > 0
              ? `Filings, payroll registers, renewals · ${summary.overdueTasksCount} overdue`
              : "Filings, payroll registers, renewals"
          }
          icon={CalendarClock}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent invoices"
          description={
            source === "database"
              ? "Latest invoice rows by created time."
              : "Latest BMF billing periods (mock ledger)."
          }
          action={
            <Link
              href="/invoices"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              All invoices
            </Link>
          }
        >
          <DataTable>
            <DataTableHeader>
              <tr>
                <DataTableTh>Period</DataTableTh>
                <DataTableTh>Issued</DataTableTh>
                <DataTableTh align="right">Amount</DataTableTh>
                <DataTableTh>Status</DataTableTh>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {summary.recentInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
                >
                  <DataTableTd className="font-medium">{inv.period}</DataTableTd>
                  <DataTableTd className="tabular-nums text-muted-foreground">
                    {inv.issued}
                  </DataTableTd>
                  <DataTableTd align="right" className="font-medium tabular-nums">
                    {formatEur(inv.amountEur)}
                  </DataTableTd>
                  <DataTableTd>
                    <StatusBadge status={inv.status} />
                  </DataTableTd>
                </tr>
              ))}
            </DataTableBody>
          </DataTable>
        </SectionCard>

        <SectionCard
          title="Upcoming compliance"
          description={
            source === "database"
              ? "Next tasks by due date (read-only)."
              : "Tasks with due dates (mock)."
          }
          action={
            <Link
              href="/tasks"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              All tasks
            </Link>
          }
        >
          <ul className="space-y-3">
            {summary.upcomingTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ClipboardList className="size-3.5 shrink-0" aria-hidden />
                    <span className="tabular-nums">Due {task.due}</span>
                    <span className="text-border">·</span>
                    <span>{task.owner ?? "—"}</span>
                  </p>
                </div>
                <StatusBadge status={task.status} />
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            Workspace recovery pending {formatEur(summary.workspaceRecoveryPending)} — bill separately when agreed.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}
