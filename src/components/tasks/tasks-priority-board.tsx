import Link from "next/link"

import { SoftStatusBadge } from "@/components/design-system"
import {
  statusSoftToken,
  type PriorityBoardTask,
} from "@/lib/tasks/presentation"
import type { TaskPriorityDb } from "@/types"
import { cn } from "@/lib/utils"

import { TasksPanelCard } from "./tasks-panel-card"

type TasksPriorityBoardProps = {
  buckets: Record<TaskPriorityDb, PriorityBoardTask[]>
}

const PRIORITY_ORDER: TaskPriorityDb[] = ["urgent", "high", "medium", "low"]

const PRIORITY_LABEL: Record<TaskPriorityDb, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export function TasksPriorityBoard({ buckets }: TasksPriorityBoardProps) {
  return (
    <TasksPanelCard
      title="Priority Board"
      description="Open tasks by priority — presentation labels only."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {PRIORITY_ORDER.map((priority) => (
          <div key={priority} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-af-text-muted">
              {PRIORITY_LABEL[priority]}
            </h3>
            {buckets[priority].length === 0 ? (
              <p className="rounded-xl border border-dashed border-af-border/80 px-3 py-4 text-xs text-af-text-muted">
                No open tasks
              </p>
            ) : (
              <ul className="space-y-2">
                {buckets[priority].map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className={cn(
                        "block rounded-xl border border-af-border/80 bg-af-soft-gray/40 px-3 py-2.5 transition-colors hover:bg-af-soft-blue/30"
                      )}
                    >
                      <p className="text-sm font-medium text-af-text-primary">
                        {task.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <SoftStatusBadge
                          status={task.categoryToken}
                          label={task.category}
                        />
                        <span className="text-xs tabular-nums text-af-text-muted">
                          Due {task.dueDate}
                        </span>
                        <SoftStatusBadge status={statusSoftToken(task.status)} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </TasksPanelCard>
  )
}
