import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type PaymentsReconciliationFocusProps = {
  items: FocusPanelItem[]
}

export function PaymentsReconciliationFocus({
  items,
}: PaymentsReconciliationFocusProps) {
  return (
    <FocusPanel
      title="Reconciliation Focus"
      subtitle="Visual follow-up queue — no automation"
      items={items}
    />
  )
}
