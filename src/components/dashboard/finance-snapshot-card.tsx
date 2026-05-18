import { DashboardPanelCard } from "@/components/dashboard/dashboard-panel-card"
import { formatEur } from "@/lib/format"
import { cn } from "@/lib/utils"

type FinanceSnapshotCardProps = {
  activeClients: number
  activeTeam: number
  rebillablePendingEur: number
  cashHealth: string
}

export function FinanceSnapshotCard({
  activeClients,
  activeTeam,
  rebillablePendingEur,
  cashHealth,
}: FinanceSnapshotCardProps) {
  const rows = [
    { label: "Active Clients", value: String(activeClients) },
    { label: "Active Team", value: String(activeTeam) },
    {
      label: "Rebillable Pending",
      value: formatEur(rebillablePendingEur),
      highlight: "orange" as const,
    },
    {
      label: "Cash Health",
      value: cashHealth,
      highlight: "green" as const,
    },
  ]

  return (
    <DashboardPanelCard title="Finance Snapshot">
      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 border-b border-af-border/80 pb-3 last:border-0 last:pb-0"
          >
            <dt className="text-sm text-af-text-secondary">{row.label}</dt>
            <dd
              className={cn(
                "text-sm font-semibold tabular-nums text-af-text-primary",
                row.highlight === "orange" && "text-af-warning",
                row.highlight === "green" && "text-af-success"
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardPanelCard>
  )
}
