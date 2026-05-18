import { LifecyclePipeline } from "@/components/design-system"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"

type ExpensesLifecycleProps = {
  stages: LifecyclePipelineStage[]
}

export function ExpensesLifecycle({ stages }: ExpensesLifecycleProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-heading text-af-section-title font-semibold text-af-text-primary">
          Expense Lifecycle
        </h2>
        <p className="text-af-helper text-af-text-secondary">
          Visual summary by stage — reporting only.
        </p>
      </div>
      <LifecyclePipeline stages={stages} layout="horizontal" />
    </section>
  )
}
