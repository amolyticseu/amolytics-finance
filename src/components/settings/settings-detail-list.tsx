import { cn } from "@/lib/utils"

export type SettingsDetailItem = {
  label: string
  value: string
}

type SettingsDetailListProps = {
  items: SettingsDetailItem[]
  className?: string
}

export function SettingsDetailList({ items, className }: SettingsDetailListProps) {
  return (
    <dl className={cn("space-y-2.5", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between gap-4 rounded-xl border border-af-border/60 bg-af-soft-gray/30 px-3 py-2.5 text-sm"
        >
          <dt className="text-af-text-secondary">{item.label}</dt>
          <dd className="max-w-[58%] text-right font-medium text-af-text-primary">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
