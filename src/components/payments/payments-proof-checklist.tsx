import { ProgressMetric } from "@/components/design-system"
import type { PaymentProofChecklistItem } from "@/lib/payments/presentation"

import { PaymentPanelCard } from "./payment-panel-card"

type PaymentsProofChecklistProps = {
  items: PaymentProofChecklistItem[]
}

export function PaymentsProofChecklist({ items }: PaymentsProofChecklistProps) {
  return (
    <PaymentPanelCard
      title="Payment Proof Overview"
      description="Readiness signals only — no uploads or document storage."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <ProgressMetric
            key={item.label}
            label={item.label}
            value={item.percent}
            helper="Across active payments"
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
    </PaymentPanelCard>
  )
}
