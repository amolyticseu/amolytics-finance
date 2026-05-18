import { ProgressMetric } from "@/components/design-system"
import type { ProofChecklistItem } from "@/lib/invoices/presentation"

import { InvoicePanelCard } from "./invoice-panel-card"

type InvoicesProofChecklistProps = {
  items: ProofChecklistItem[]
}

export function InvoicesProofChecklist({ items }: InvoicesProofChecklistProps) {
  return (
    <InvoicePanelCard
      title="Proof Checklist Overview"
      description="Readiness signals only — no uploads or document storage."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ProgressMetric
            key={item.label}
            label={item.label}
            value={item.percent}
            helper="Across active invoices"
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
    </InvoicePanelCard>
  )
}
