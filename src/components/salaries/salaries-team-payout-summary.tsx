import { SoftStatusBadge } from "@/components/design-system"
import { formatEur } from "@/lib/format"
import type { TeamPayoutSummaryRow } from "@/lib/salaries/presentation"

import { SalaryPanelCard } from "./salary-panel-card"

type SalariesTeamPayoutSummaryProps = {
  rows: TeamPayoutSummaryRow[]
}

export function SalariesTeamPayoutSummary({ rows }: SalariesTeamPayoutSummaryProps) {
  return (
    <SalaryPanelCard
      title="Team Payout Summary"
      description="Current month by function — presentation labels only."
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="rounded-xl border border-af-border/80 bg-af-soft-gray/40 px-3 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-af-text-primary">{row.label}</p>
                <p className="mt-1 text-af-helper text-af-text-secondary">
                  {row.headcount} member{row.headcount === 1 ? "" : "s"}
                </p>
              </div>
              <SoftStatusBadge
                status={
                  row.status === "Paid"
                    ? "paid"
                    : row.status === "Partial"
                      ? "partial"
                      : row.status === "Pending"
                        ? "pending"
                        : "draft"
                }
                label={row.status}
              />
            </div>
            <p className="mt-2 text-sm font-semibold tabular-nums text-af-text-primary">
              {formatEur(row.monthlyEur)} / mo
            </p>
          </li>
        ))}
      </ul>
    </SalaryPanelCard>
  )
}
