import { cn } from "@/lib/utils"

import {
  type DesignTone,
  tonePipelineConnector,
  tonePipelineDot,
} from "./tone-styles"

export type LifecyclePipelineStage = {
  label: string
  count: number
  tone?: DesignTone
}

export type LifecyclePipelineProps = {
  stages: LifecyclePipelineStage[]
  layout?: "horizontal" | "vertical"
  className?: string
}

export function LifecyclePipeline({
  stages,
  layout = "horizontal",
  className,
}: LifecyclePipelineProps) {
  const isHorizontal = layout === "horizontal"

  return (
    <div
      className={cn(
        "rounded-af-card border border-af-border bg-af-surface p-5 shadow-af-card",
        className
      )}
    >
      <ol
        className={cn(
          "flex list-none flex-wrap p-0",
          isHorizontal ? "flex-row items-start" : "flex-col gap-1"
        )}
      >
        {stages.map((stage, index) => {
          const tone = stage.tone ?? "blue"
          const isLast = index === stages.length - 1

          return (
            <li
              key={`${stage.label}-${index}`}
              className={cn(
                "flex min-w-0 items-center",
                isHorizontal ? "flex-1 basis-0" : "w-full py-1"
              )}
            >
              <div
                className={cn(
                  "flex shrink-0 flex-col items-center",
                  isHorizontal ? "mx-auto w-full max-w-32" : "w-14"
                )}
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums",
                    tonePipelineDot[tone]
                  )}
                >
                  {stage.count}
                </div>
                <p className="mt-2 text-center text-af-table-body font-medium leading-snug text-af-text-primary">
                  {stage.label}
                </p>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "shrink-0",
                    isHorizontal
                      ? cn(
                          "mx-1 mt-[-1.75rem] h-0.5 flex-1",
                          tonePipelineConnector[tone]
                        )
                      : cn("ml-5 h-6 w-0.5", tonePipelineConnector[tone])
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
