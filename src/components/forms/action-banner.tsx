import type { ActionResult } from "@/lib/forms/action-result"
import { cn } from "@/lib/utils"

type ActionBannerProps = {
  result: ActionResult<unknown> | null
  className?: string
}

export function ActionBanner({ result, className }: ActionBannerProps) {
  if (!result || result.ok) return null
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className
      )}
    >
      {result.message}
    </div>
  )
}
