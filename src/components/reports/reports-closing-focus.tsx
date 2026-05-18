import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type ReportsClosingFocusProps = {
  items: FocusPanelItem[]
}

export function ReportsClosingFocus({ items }: ReportsClosingFocusProps) {
  return (
    <div id="closing-readiness">
      <FocusPanel
        title="Closing Readiness"
        subtitle="Follow-up queue — visual only"
        items={items}
      />
    </div>
  )
}
