import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { type DesignTone, toneIconShell } from "./tone-styles"

export type PremiumKpiCardProps = {
  icon?: ReactNode
  label: string
  value: string
  helper?: string
  badge?: string
  variant?: DesignTone
  className?: string
}

const cardShell =
  "rounded-af-card border border-af-border bg-af-surface p-5 shadow-af-card transition-shadow hover:shadow-af-card-hover"

export function PremiumKpiCard({
  icon,
  label,
  value,
  helper,
  badge,
  variant = "blue",
  className,
}: PremiumKpiCardProps) {
  return (
    <article className={cn(cardShell, className)}>
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5",
              toneIconShell[variant]
            )}
          >
            {icon}
          </div>
        ) : (
          <span className="size-10 shrink-0" aria-hidden />
        )}
        {badge ? (
          <span
            className={cn(
              "rounded-af-badge border border-af-border/80 bg-af-soft-gray px-2 py-0.5 text-xs font-medium text-af-text-secondary"
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <p
        className="mt-4 text-af-table-body font-medium text-af-text-secondary"
      >
        {label}
      </p>
      <p
        className="mt-1 font-heading text-af-kpi-value font-semibold tracking-tight text-af-text-primary"
      >
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-af-helper leading-af-helper text-af-text-muted">
          {helper}
        </p>
      ) : null}
    </article>
  )
}
