import Link from "next/link"

import { ProgressMetric } from "@/components/design-system"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardMonthlyClose() {
  return (
    <div className="space-y-3">
      <ProgressMetric
        label="Monthly Close"
        value={67}
        completed={6}
        total={9}
        helper="Review missing proofs"
        tone="blue"
      />
      <Link
        href="/tasks"
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "h-auto px-0 text-af-primary-blue"
        )}
      >
        Open checklist →
      </Link>
    </div>
  )
}
