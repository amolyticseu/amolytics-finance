import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type TasksComplianceFocusProps = {
  items: FocusPanelItem[]
}

export function TasksComplianceFocus({ items }: TasksComplianceFocusProps) {
  return (
    <FocusPanel
      title="Compliance Focus"
      subtitle="Follow-up queue — visual only"
      items={items}
    />
  )
}
