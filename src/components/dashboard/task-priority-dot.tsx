import { cn } from "@/lib/utils"

type TaskPriorityDotProps = {
  priority: "high" | "medium" | "low"
}

const colors = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
}

export function TaskPriorityDot({ priority }: TaskPriorityDotProps) {
  return (
    <span
      className={cn("size-2 shrink-0 rounded-full", colors[priority])}
      aria-hidden
    />
  )
}
