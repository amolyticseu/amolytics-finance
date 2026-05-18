import { ProgressMetric } from "@/components/design-system"
import type { ProfileChecklistItem } from "@/lib/team/presentation"

import { TeamPanelCard } from "./team-panel-card"

type TeamProfileChecklistProps = {
  items: ProfileChecklistItem[]
}

export function TeamProfileChecklist({ items }: TeamProfileChecklistProps) {
  return (
    <TeamPanelCard
      title="Profile Completeness Overview"
      description="Readiness signals only — no uploads or HR automation."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ProgressMetric
            key={item.label}
            label={item.label}
            value={item.percent}
            helper="Across roster"
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
    </TeamPanelCard>
  )
}
