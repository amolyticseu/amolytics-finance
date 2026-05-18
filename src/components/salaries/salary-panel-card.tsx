import * as React from "react"

import { cn } from "@/lib/utils"

type SalaryPanelCardProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function SalaryPanelCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SalaryPanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-af-card border border-af-border bg-af-surface p-5 shadow-af-card md:p-6",
        className
      )}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-af-section-title font-semibold leading-af-section text-af-text-primary">
            {title}
          </h2>
          {description ? (
            <p className="text-af-helper text-af-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  )
}
