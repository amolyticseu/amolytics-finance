import { cn } from "@/lib/utils"

import { type DesignTone, toneRowSurface } from "./tone-styles"

/**
 * Design-system status tokens (Phase 2). Extends app statuses without changing
 * `src/components/shell/status-badge.tsx` used by existing pages.
 */
export type SoftStatusToken =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "completed"
  | "pending"
  | "pending_proof"
  | "unmapped"
  | "partial"
  | "todo"
  | "in_progress"
  | "done"
  | "blocked"
  | "urgent"
  | "high"
  | "medium"
  | "low"
  | "active"
  | "inactive"
  | "masked"
  | "missing"
  | "rebillable"
  | "recurring"
  | "primary"
  | "secondary"
  | "database"
  | "fallback"
  | "local_preview"
  | "failed"
  | "open"
  | "scheduled"

const labels: Record<SoftStatusToken, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  completed: "Completed",
  pending: "Pending",
  pending_proof: "Pending proof",
  unmapped: "Unmapped",
  partial: "Partial",
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  active: "Active",
  inactive: "Inactive",
  masked: "Masked",
  missing: "Missing",
  rebillable: "Rebillable",
  recurring: "Recurring",
  primary: "Primary",
  secondary: "Secondary",
  database: "Database",
  fallback: "Fallback",
  local_preview: "Local preview",
  failed: "Failed",
  open: "Open",
  scheduled: "Scheduled",
}

const tokenTone: Record<SoftStatusToken, DesignTone> = {
  draft: "gray",
  sent: "amber",
  paid: "green",
  overdue: "red",
  cancelled: "gray",
  completed: "green",
  pending: "amber",
  pending_proof: "amber",
  unmapped: "red",
  partial: "amber",
  todo: "gray",
  in_progress: "blue",
  done: "green",
  blocked: "red",
  urgent: "red",
  high: "amber",
  medium: "blue",
  low: "gray",
  active: "green",
  inactive: "gray",
  masked: "purple",
  missing: "red",
  rebillable: "teal",
  recurring: "purple",
  primary: "blue",
  secondary: "gray",
  database: "teal",
  fallback: "amber",
  local_preview: "gray",
  failed: "red",
  open: "gray",
  scheduled: "blue",
}

export type SoftStatusBadgeProps = {
  status: SoftStatusToken
  /** Override visible label (defaults from token map). */
  label?: string
  className?: string
}

export function SoftStatusBadge({
  status,
  label,
  className,
}: SoftStatusBadgeProps) {
  const tone = tokenTone[status]
  const text = label ?? labels[status]

  return (
    <span
      role="status"
      className={cn(
        "inline-flex max-w-full items-center rounded-af-badge border px-2 py-0.5 text-af-table-header font-semibold leading-tight",
        toneRowSurface[tone],
        "text-af-text-primary",
        className
      )}
    >
      <span className="sr-only">Status: </span>
      {text}
    </span>
  )
}
