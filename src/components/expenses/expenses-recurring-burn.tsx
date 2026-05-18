import { SoftStatusBadge } from "@/components/design-system"
import { formatEur } from "@/lib/format"
import type { RecurringBurnRow } from "@/lib/expenses/presentation"

import { ExpensePanelCard } from "./expense-panel-card"

type ExpensesRecurringBurnProps = {
  rows: RecurringBurnRow[]
}

export function ExpensesRecurringBurn({ rows }: ExpensesRecurringBurnProps) {
  return (
    <ExpensePanelCard
      title="Recurring Burn"
      description="Monthly run-rate by cost bucket — widget only, not a subscriptions module."
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="rounded-xl border border-af-border/80 bg-af-soft-gray/40 px-3 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-af-text-primary">{row.label}</p>
                <p className="mt-1 text-af-helper text-af-text-secondary">
                  Next due {row.nextDue}
                </p>
              </div>
              <SoftStatusBadge
                status={row.status === "On track" ? "active" : "pending"}
                label={row.status}
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-af-text-secondary">Monthly</dt>
                <dd className="font-semibold tabular-nums text-af-text-primary">
                  {formatEur(row.monthlyEur)}
                </dd>
              </div>
              <div>
                <dt className="text-af-text-secondary">Annualized</dt>
                <dd className="font-semibold tabular-nums text-af-text-primary">
                  {formatEur(row.annualEur)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </ExpensePanelCard>
  )
}
