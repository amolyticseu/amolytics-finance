import { cn } from "@/lib/utils"

import {
  type DesignTone,
  progressToneFromValue,
  toneProgressFill,
} from "./tone-styles"

export type ProgressMetricProps = {
  label: string
  /** Percentage 0–100 when `completed` / `total` are not set. */
  value: number
  helper?: string
  completed?: number
  total?: number
  tone?: DesignTone
  className?: string
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function ProgressMetric({
  label,
  value,
  helper,
  completed,
  total,
  tone,
  className,
}: ProgressMetricProps) {
  const percent =
    completed !== undefined &&
    total !== undefined &&
    total > 0
      ? clampPercent((completed / total) * 100)
      : clampPercent(value)

  const resolvedTone = tone ?? progressToneFromValue(percent)
  const fillClass = toneProgressFill[resolvedTone]

  const completedLabel =
    completed !== undefined && total !== undefined
      ? `${completed} / ${total} complete`
      : null

  return (
    <div
      className={cn(
        "rounded-af-card border border-af-border bg-af-surface p-5 shadow-af-card",
        className
      )}
    >
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-sm font-medium text-af-text-primary">{label}</p>
        <p
          className="text-sm font-semibold tabular-nums text-af-text-primary"
          aria-hidden
        >
          {percent}%
        </p>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-af-soft-gray"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percent}%`}
      >
        <div
          className={cn("h-full rounded-full transition-[width]", fillClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {helper || completedLabel ? (
        <p className="mt-2 text-af-helper text-af-text-secondary">
          {[helper, completedLabel].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  )
}
