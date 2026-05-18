import { ProgressMetric } from "@/components/design-system"
import type { ExpenseProofChecklistItem } from "@/lib/expenses/presentation"

import { ExpensePanelCard } from "./expense-panel-card"

type ExpensesProofChecklistProps = {
  items: ExpenseProofChecklistItem[]
}

export function ExpensesProofChecklist({ items }: ExpensesProofChecklistProps) {
  return (
    <ExpensePanelCard
      title="Expense Proof Overview"
      description="Readiness signals only — no uploads or document storage."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ProgressMetric
            key={item.label}
            label={item.label}
            value={item.percent}
            helper="Across active expenses"
            tone={
              item.percent >= 80
                ? "green"
                : item.percent >= 50
                  ? "blue"
                  : "amber"
            }
            className="border-0 bg-transparent p-0 shadow-none"
          />
        ))}
      </div>
    </ExpensePanelCard>
  )
}
