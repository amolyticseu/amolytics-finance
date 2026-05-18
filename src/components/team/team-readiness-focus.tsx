import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type TeamReadinessFocusProps = {
  items: FocusPanelItem[]
}

export function TeamReadinessFocus({ items }: TeamReadinessFocusProps) {
  return (
    <FocusPanel
      title="Team Readiness"
      subtitle="Follow-up queue — visual only"
      items={items}
    />
  )
}
