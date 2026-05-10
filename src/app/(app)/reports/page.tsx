import { PageHeader } from "@/components/shell/page-header"
import { MonthlyPlChart } from "@/components/reports/monthly-pl-chart"
import { SectionCard } from "@/components/shell/section-card"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  mockEstimatedProfitEur,
  mockMonthlyExpensesEur,
  mockMonthlyRevenueEur,
} from "@/data/mock/figures"
import { mockMonthlyPl } from "@/data/mock/tables"
import { formatCompactEur, formatEur } from "@/lib/format"
import { ArrowRightLeft, PiggyBank, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const last = mockMonthlyPl[mockMonthlyPl.length - 1]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="High-level P&L view — mock monthly totals below; chart uses the same static series."
      />

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="Report highlights"
      >
        <StatCard
          title="Revenue (May, mock)"
          value={formatCompactEur(mockMonthlyRevenueEur)}
          icon={TrendingUp}
        />
        <StatCard
          title="Expenses (May, mock)"
          value={formatEur(mockMonthlyExpensesEur)}
          icon={PiggyBank}
        />
        <StatCard
          title="Operating margin (est.)"
          value={formatCompactEur(mockEstimatedProfitEur)}
          hint="Before tax"
          icon={ArrowRightLeft}
        />
      </section>

      <SectionCard
        title="Revenue vs expenses"
        description={`Trailing months through ${last.month} — values in EUR (mock).`}
      >
        <MonthlyPlChart />
      </SectionCard>
    </div>
  )
}
