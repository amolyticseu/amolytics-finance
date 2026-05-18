import Link from "next/link"

import { SoftStatusBadge } from "@/components/design-system"
import { toneRowSurface } from "@/components/design-system/tone-styles"
import { buttonVariants } from "@/components/ui/button"
import type { getComplianceTasksWithStatus } from "@/lib/dashboard/presentation"
import { cn } from "@/lib/utils"

import { DashboardPanelCard } from "./dashboard-panel-card"

type ComplianceTaskRow = ReturnType<typeof getComplianceTasksWithStatus>[number]

type DashboardComplianceTasksProps = {
  tasks: ComplianceTaskRow[]
}

export function DashboardComplianceTasks({ tasks }: DashboardComplianceTasksProps) {
  return (
    <DashboardPanelCard
      title="Compliance & Tasks"
      description="Urgent and upcoming tasks"
      action={
        <Link
          href="/tasks"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          View all
        </Link>
      }
    >
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
              toneRowSurface[task.tone]
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-af-text-primary">
                {task.title}
              </p>
              <p className="text-af-helper text-af-text-secondary">
                {task.priorityLabel} priority
              </p>
            </div>
            <SoftStatusBadge status={task.softStatus} />
          </li>
        ))}
      </ul>
    </DashboardPanelCard>
  )
}
