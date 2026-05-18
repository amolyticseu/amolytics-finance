import { cn } from "@/lib/utils"

import { progressToneFromValue, toneProgressFill } from "@/components/design-system/tone-styles"
import type { MonthlyCloseWidget } from "@/lib/tasks/presentation"

import { TasksPanelCard } from "./tasks-panel-card"

type TasksMonthlyCloseProps = {
  widget: MonthlyCloseWidget
}

export function TasksMonthlyClose({ widget }: TasksMonthlyCloseProps) {
  const tone = progressToneFromValue(widget.percent)

  return (
    <TasksPanelCard
      title="Monthly Close Checklist"
      description="Visual readiness widget — no automation or separate close route."
    >
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-af-text-primary">
              {widget.completed}/{widget.total}
            </p>
            <p className="text-af-helper text-af-text-secondary">
              Checklist items complete
            </p>
          </div>
          <span className="text-lg font-semibold tabular-nums text-af-primary-blue">
            {widget.percent}%
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-af-soft-gray"
          role="progressbar"
          aria-valuenow={widget.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn("h-full rounded-full", toneProgressFill[tone])}
            style={{ width: `${widget.percent}%` }}
          />
        </div>
        <ul className="space-y-2">
          {widget.items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2.5 text-sm text-af-text-secondary"
            >
              <span
                className={cn(
                  "inline-flex size-4 shrink-0 items-center justify-center rounded border text-[10px] font-semibold",
                  item.done
                    ? "border-af-success/40 bg-af-soft-green text-af-success"
                    : "border-af-border bg-af-soft-gray text-af-text-muted"
                )}
                aria-hidden
              >
                {item.done ? "✓" : ""}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </TasksPanelCard>
  )
}
