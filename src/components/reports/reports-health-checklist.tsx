import { ProgressMetric } from "@/components/design-system"
import type { ReportHealthItem } from "@/lib/reports/presentation"

import { ReportsPanelCard } from "./reports-panel-card"

type ReportsHealthChecklistProps = {
  items: ReportHealthItem[]
}

export function ReportsHealthChecklist({ items }: ReportsHealthChecklistProps) {
  return (
    <ReportsPanelCard
      title="Report Health"
      description="Readiness signals only — no uploads or monthly close route."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ProgressMetric
            key={item.label}
            label={item.label}
            value={item.percent}
            helper="Across available snapshots"
            tone={
              item.percent >= 80
                ? "green"
                : item.percent >= 50
                  ? "blue"
                  : "amber"
            }
            className="border-0 bg-transparent p-0 shadow-none"
          />
        ))}
      </div>
    </ReportsPanelCard>
  )
}
