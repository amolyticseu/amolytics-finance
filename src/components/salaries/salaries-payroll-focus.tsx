import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type SalariesPayrollFocusProps = {
  items: FocusPanelItem[]
}

export function SalariesPayrollFocus({ items }: SalariesPayrollFocusProps) {
  return (
    <FocusPanel
      title="Payroll Focus"
      subtitle="Visual follow-up queue — no automation"
      items={items}
    />
  )
}
