import { FocusPanel } from "@/components/design-system"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"

type InvoicesCollectionFocusProps = {
  items: FocusPanelItem[]
}

export function InvoicesCollectionFocus({ items }: InvoicesCollectionFocusProps) {
  return (
    <FocusPanel
      title="Collection Focus"
      subtitle="Priority items for follow-up"
      items={items}
    />
  )
}
