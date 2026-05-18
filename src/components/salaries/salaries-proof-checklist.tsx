import { ProgressMetric } from "@/components/design-system"
import type { SalaryProofChecklistItem } from "@/lib/salaries/presentation"

import { SalaryPanelCard } from "./salary-panel-card"

type SalariesProofChecklistProps = {
  items: SalaryProofChecklistItem[]
}

export function SalariesProofChecklist({ items }: SalariesProofChecklistProps) {
  return (
    <SalaryPanelCard
      title="Salary Proof Overview"
      description="Readiness signals only — no uploads or document storage."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ProgressMetric
            key={item.label}
            label={item.label}
            value={item.percent}
            helper="Across active salary lines"
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
    </SalaryPanelCard>
  )
}
