import { PageHeader } from "@/components/shell/page-header"
import { MonthlyPlChart } from "@/components/reports/monthly-pl-chart"
import { SectionCard } from "@/components/shell/section-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { getMonthlyProfitLossReport } from "@/lib/data/reports"
import { formatCompactEur, formatEur, formatInr } from "@/lib/format"
import {
  ArrowRightLeft,
  CalendarRange,
  CreditCard,
  IndianRupee,
  PiggyBank,
  TrendingUp,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const report = await getMonthlyProfitLossReport()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Monthly revenue vs expenses from snapshots (or mock series when offline)."
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Source:{" "}
          {report.source === "database"
            ? "monthly_snapshots"
            : "mock monthly P&L (tables)"}
          .
        </span>
      </p>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Report totals"
      >
        <StatCard
          title="Total revenue (series)"
          value={formatCompactEur(report.totalRevenueEur)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total expenses (series)"
          value={formatEur(report.totalExpensesEur)}
          icon={PiggyBank}
        />
        <StatCard
          title="Total P&L (series)"
          value={formatCompactEur(report.totalProfitLossEur)}
          hint="Sum of monthly profit/loss"
          icon={ArrowRightLeft}
        />
        <StatCard
          title="Total salary (INR, series)"
          value={formatInr(report.totalSalaryInr)}
          icon={IndianRupee}
        />
        <StatCard
          title="Total EMI (INR, series)"
          value={formatInr(report.totalEmiInr)}
          icon={CreditCard}
        />
        <StatCard
          title="Latest month"
          value={report.latestMonthLabel}
          icon={CalendarRange}
        />
      </section>

      <SectionCard
        title="Revenue vs expenses"
        description={`Trailing months through ${report.latestMonthLabel} — values in EUR.`}
      >
        <MonthlyPlChart data={report.series} />
      </SectionCard>
    </div>
  )
}
