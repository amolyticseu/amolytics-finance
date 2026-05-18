import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-heading text-af-page-title font-semibold leading-af-page-title tracking-tight text-af-text-primary md:text-af-page-title-lg">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-af-table-body leading-relaxed text-af-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
