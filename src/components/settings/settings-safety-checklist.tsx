import { Check } from "lucide-react"

import type { SafetyCheckItem } from "@/lib/settings/presentation"

import { SettingsPanelCard } from "./settings-panel-card"

type SettingsSafetyChecklistProps = {
  items: SafetyCheckItem[]
}

export function SettingsSafetyChecklist({ items }: SettingsSafetyChecklistProps) {
  return (
    <SettingsPanelCard
      title="Safety & Privacy"
      description="How sensitive data is handled in the UI."
    >
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2.5 rounded-xl border border-af-border/80 bg-af-soft-green/40 px-3 py-2.5 text-sm text-af-text-primary"
          >
            <span
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-af-success text-white"
              aria-hidden
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </SettingsPanelCard>
  )
}
