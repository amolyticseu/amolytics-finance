import type { FinanceStatus } from "@/types"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const labels: Record<FinanceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  scheduled: "Scheduled",
  active: "Active",
}

const variantClass: Record<
  FinanceStatus,
  string
> = {
  draft: "border-border/80 bg-muted/40 text-foreground",
  sent: "border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-100",
  paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
  overdue: "",
  cancelled: "border-border/80 bg-muted/30 text-muted-foreground",
  pending: "border-border/80 bg-muted/50 text-foreground",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
  failed: "",
  open: "border-border/80 bg-background text-muted-foreground",
  in_progress: "border-primary/20 bg-primary/10 text-foreground",
  done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
  scheduled: "border-sky-500/20 bg-sky-500/10 text-sky-950 dark:text-sky-100",
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
}

type StatusBadgeProps = {
  status: FinanceStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isDestructive = status === "overdue" || status === "failed"
  const label = labels[status]

  if (isDestructive) {
    return (
      <Badge variant="destructive" className={cn("font-medium", className)}>
        {label}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", variantClass[status], className)}
    >
      {label}
    </Badge>
  )
}
