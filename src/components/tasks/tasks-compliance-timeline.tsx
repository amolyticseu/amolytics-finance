import { cn } from "@/lib/utils"

import type { ComplianceTimelineItem } from "@/lib/tasks/presentation"

import { TasksPanelCard } from "./tasks-panel-card"

type TasksComplianceTimelineProps = {
  items: ComplianceTimelineItem[]
}

export function TasksComplianceTimeline({ items }: TasksComplianceTimelineProps) {
  return (
    <TasksPanelCard
      title="Compliance Timeline"
      description="Upcoming and completed operational milestones — reporting only."
    >
      <ol className="relative space-y-0 border-l border-af-border pl-5">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn("relative pb-6 last:pb-0", index === items.length - 1 && "pb-0")}
          >
            <span
              className={cn(
                "absolute -left-5.5 top-1 size-2.5 rounded-full ring-2 ring-af-surface",
                item.tone === "done"
                  ? "bg-af-success"
                  : "bg-af-warning"
              )}
              aria-hidden
            />
            <p className="text-sm font-medium text-af-text-primary">{item.label}</p>
            <p className="mt-0.5 text-xs tabular-nums text-af-text-muted">{item.date}</p>
            <p className="mt-1 text-xs text-af-text-secondary">
              {item.tone === "done" ? "Completed" : "Upcoming"}
            </p>
          </li>
        ))}
      </ol>
    </TasksPanelCard>
  )
}
