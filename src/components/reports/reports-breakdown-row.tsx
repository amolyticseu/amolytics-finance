import { formatCompactEur } from "@/lib/format"
import type {
  CashMovementSummary,
  ExpenseBreakdown,
  RevenueBreakdown,
} from "@/lib/reports/presentation"
import { cn } from "@/lib/utils"

import { ReportsPanelCard } from "./reports-panel-card"

type ReportsBreakdownRowProps = {
  revenue: RevenueBreakdown
  expenses: ExpenseBreakdown
  cash: CashMovementSummary
}

function BreakdownList({
  lines,
  totalLabel,
  totalEur,
}: {
  lines: { label: string; amountEur: number; sharePercent: number }[]
  totalLabel: string
  totalEur: number
}) {
  return (
    <ul className="space-y-2.5">
      {lines.map((line) => (
        <li
          key={line.label}
          className="flex items-center justify-between gap-3 rounded-xl border border-af-border/80 bg-af-soft-gray/40 px-3 py-2.5 text-sm"
        >
          <span className="text-af-text-secondary">{line.label}</span>
          <div className="text-right">
            <span className="font-medium tabular-nums text-af-text-primary">
              {formatCompactEur(line.amountEur)}
            </span>
            <span className="ml-2 text-xs text-af-text-muted">{line.sharePercent}%</span>
          </div>
        </li>
      ))}
      <li className="flex items-center justify-between gap-3 border-t border-af-border pt-2 text-sm font-semibold">
        <span className="text-af-text-primary">{totalLabel}</span>
        <span className="tabular-nums text-af-primary-blue">{formatCompactEur(totalEur)}</span>
      </li>
    </ul>
  )
}

export function ReportsBreakdownRow({
  revenue,
  expenses,
  cash,
}: ReportsBreakdownRowProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ReportsPanelCard
        id="revenue-breakdown"
        title="Revenue Breakdown"
        description="Aggregated presentation — no client names."
      >
        <BreakdownList
          lines={revenue.lines}
          totalLabel="Total revenue"
          totalEur={revenue.totalEur}
        />
      </ReportsPanelCard>

      <ReportsPanelCard
        id="expense-breakdown"
        title="Expense Breakdown"
        description="Operating cost categories."
      >
        <BreakdownList
          lines={expenses.lines}
          totalLabel="Total expenses"
          totalEur={expenses.totalEur}
        />
      </ReportsPanelCard>

      <ReportsPanelCard
        id="cash-movement"
        title="Cash Movement Summary"
        description="Inflow, outflow, and reconciliation signals."
      >
        <ul className="space-y-2.5">
          {[
            { label: "Inflow", value: cash.inflowEur, tone: "text-af-success" },
            { label: "Outflow", value: cash.outflowEur, tone: "text-af-warning" },
            {
              label: "Net Movement",
              value: cash.netMovementEur,
              tone:
                cash.netMovementEur >= 0 ? "text-af-success" : "text-af-danger",
            },
            {
              label: "Unmapped Payments",
              value: cash.unmappedPaymentsEur,
              tone: "text-af-text-secondary",
            },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-af-border/80 bg-af-soft-gray/40 px-3 py-2.5 text-sm"
            >
              <span className="text-af-text-secondary">{row.label}</span>
              <span className={cn("font-medium tabular-nums", row.tone)}>
                {formatCompactEur(row.value)}
              </span>
            </li>
          ))}
        </ul>
      </ReportsPanelCard>
    </div>
  )
}
