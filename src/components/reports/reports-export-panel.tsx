import { Download, FileSpreadsheet, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { ExportOption } from "@/lib/reports/presentation"

import { ReportsPanelCard } from "./reports-panel-card"

const ICONS: Record<string, LucideIcon> = {
  "csv-summary": FileSpreadsheet,
  "pdf-summary": FileText,
  "invoice-register": FileText,
  "expense-register": Download,
}

type ReportsExportPanelProps = {
  options: ExportOption[]
}

export function ReportsExportPanel({ options }: ReportsExportPanelProps) {
  return (
    <ReportsPanelCard
      title="Export Options"
      description="Exports are prepared from available report data."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const Icon = ICONS[opt.id] ?? FileSpreadsheet
          return (
            <li
              key={opt.id}
              className="flex items-start gap-3 rounded-xl border border-dashed border-af-border bg-af-soft-gray/30 px-3 py-3"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-af-surface text-af-text-muted">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-af-text-primary">{opt.label}</p>
                <p className="mt-0.5 text-af-helper text-af-text-muted">{opt.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-af-helper text-af-text-muted">
        Visual preview only — CSV import, PDF generation, and automated exports are not
        enabled in this phase.
      </p>
    </ReportsPanelCard>
  )
}
