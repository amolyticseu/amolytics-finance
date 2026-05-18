import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { type DesignTone, toneRowSurface } from "./tone-styles"

export type FocusPanelItem = {
  title: string
  subtitle?: string
  value?: string | number
  tone?: DesignTone
  icon?: ReactNode
}

export type FocusPanelProps = {
  title?: string
  subtitle?: string
  items: FocusPanelItem[]
  className?: string
}

export function FocusPanel({
  title,
  subtitle,
  items,
  className,
}: FocusPanelProps) {
  return (
    <section
      className={cn(
        "rounded-af-card border border-af-border bg-af-surface p-5 shadow-af-card",
        className
      )}
    >
      {title || subtitle ? (
        <header className="mb-4 space-y-1">
          {title ? (
            <h3 className="text-af-section-title font-semibold leading-af-section text-af-text-primary">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="text-af-helper text-af-text-secondary">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}
      <ul className="space-y-2">
        {items.map((item, index) => {
          const tone = item.tone ?? "gray"
          const valueDisplay =
            item.value !== undefined && item.value !== null
              ? String(item.value)
              : null

          return (
            <li
              key={`${item.title}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                toneRowSurface[tone]
              )}
            >
              {item.icon ? (
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-af-surface/80 [&_svg]:size-4"
                  aria-hidden
                >
                  {item.icon}
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-af-text-primary">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="text-af-helper text-af-text-secondary">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
              {valueDisplay ? (
                <span className="shrink-0 text-sm font-semibold tabular-nums text-af-text-primary">
                  {valueDisplay}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
