import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type TrendTone = "positive" | "negative" | "neutral"

type DashboardKpiCardProps = {
  label: string
  value: string
  icon: LucideIcon
  trend?: { label: string; tone: TrendTone }
  accent?: "blue" | "orange" | "green" | "teal" | "violet"
  className?: string
}

const accentStyles = {
  blue: {
    icon: "bg-blue-500/10 text-blue-600",
    ring: "ring-blue-500/10",
  },
  orange: {
    icon: "bg-orange-500/10 text-orange-600",
    ring: "ring-orange-500/10",
  },
  green: {
    icon: "bg-emerald-500/10 text-emerald-600",
    ring: "ring-emerald-500/10",
  },
  teal: {
    icon: "bg-teal-500/10 text-teal-600",
    ring: "ring-teal-500/10",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600",
    ring: "ring-violet-500/10",
  },
}

const trendStyles: Record<TrendTone, string> = {
  positive:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  negative:
    "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  neutral:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
}

export function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "blue",
  className,
}: DashboardKpiCardProps) {
  const styles = accentStyles[accent]

  return (
    <article
      className={cn(
        "rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm ring-1",
        styles.ring,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.icon
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        {trend ? (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
              trendStyles[trend.tone]
            )}
          >
            {trend.label}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </article>
  )
}
