import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type ExpensesRebillableFocusProps = {
  items: FocusPanelItem[]
}

export function ExpensesRebillableFocus({ items }: ExpensesRebillableFocusProps) {
  return (
    <FocusPanel
      title="Rebillable Recovery"
      subtitle="Follow-up queue — visual only"
      items={items}
    />
  )
}
