import { SoftStatusBadge } from "@/components/design-system"
import type { PayrollReadinessRow } from "@/lib/team/presentation"

import { TeamPanelCard } from "./team-panel-card"

type TeamPayrollReadinessProps = {
  rows: PayrollReadinessRow[]
}

const TONE_TOKEN = {
  green: "paid",
  amber: "pending",
  red: "overdue",
  gray: "inactive",
} as const

export function TeamPayrollReadiness({ rows }: TeamPayrollReadinessProps) {
  return (
    <TeamPanelCard
      title="Payroll Readiness"
      description="Payout readiness snapshot — widget only."
    >
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-af-border/80 bg-af-soft-gray/40 px-3 py-2.5"
          >
            <span className="text-sm text-af-text-primary">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tabular-nums text-af-text-primary">
                {row.count}
              </span>
              <SoftStatusBadge status={TONE_TOKEN[row.tone]} />
            </div>
          </li>
        ))}
      </ul>
    </TeamPanelCard>
  )
}
