import Link from "next/link"
import { ClipboardCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type InternalFinanceCardProps = {
  className?: string
  compact?: boolean
}

export function InternalFinanceCard({
  className,
  compact = false,
}: InternalFinanceCardProps) {
  return (
    <div
      className={cn(
        "rounded-af-sidebar-active border border-af-border bg-af-soft-blue p-3 shadow-af-card",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <ClipboardCheck
          className="mt-0.5 size-4 shrink-0 text-af-primary-blue"
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold text-af-text-primary">Monthly Close</p>
          <p className="text-xs text-af-text-secondary">
            {compact ? "6/9 checks" : "6/9 checks done"}
          </p>
          {!compact ? (
            <p className="text-[11px] leading-snug text-af-text-muted">
              Review missing proofs
            </p>
          ) : null}
        </div>
      </div>
      <Link
        href="/tasks"
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "mt-2 h-auto px-0 text-xs text-af-primary-blue"
        )}
      >
        Review checklist →
      </Link>
    </div>
  )
}
