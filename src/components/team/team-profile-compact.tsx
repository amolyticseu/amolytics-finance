import { cn } from "@/lib/utils"

import { progressToneFromValue, toneProgressFill } from "@/components/design-system/tone-styles"

type TeamProfileCompactProps = {
  percent: number
  className?: string
}

export function TeamProfileCompact({ percent, className }: TeamProfileCompactProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)))
  const tone = progressToneFromValue(clamped)

  return (
    <div className={cn("flex min-w-22 items-center gap-2", className)}>
      <div
        className="h-1.5 w-14 overflow-hidden rounded-full bg-af-soft-gray"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile completeness ${clamped}%`}
      >
        <div
          className={cn("h-full rounded-full", toneProgressFill[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-af-text-secondary">
        {clamped}%
      </span>
    </div>
  )
}
