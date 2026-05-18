import Link from "next/link"
import {
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Landmark,
  PieChart,
  Receipt,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SoftStatusBadge } from "@/components/design-system"
import type { AvailableReportCard } from "@/lib/reports/presentation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import { ReportsPanelCard } from "./reports-panel-card"

const ICONS: Record<string, LucideIcon> = {
  "monthly-pl": PieChart,
  "invoice-status": FileText,
  "payment-recon": Landmark,
  "salary-summary": Wallet,
  "expense-summary": Receipt,
  "missing-proof": ClipboardCheck,
}

type ReportsAvailableGridProps = {
  cards: AvailableReportCard[]
}

export function ReportsAvailableGrid({ cards }: ReportsAvailableGridProps) {
  return (
    <ReportsPanelCard
      title="Available Reports"
      description="In-page report cards — not separate sidebar routes."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = ICONS[card.id] ?? FileSpreadsheet
          return (
            <article
              key={card.id}
              className="flex flex-col rounded-xl border border-af-border/80 bg-af-soft-gray/30 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-af-soft-blue text-af-primary-blue">
                  <Icon className="size-4" aria-hidden />
                </span>
                <SoftStatusBadge
                  status={card.statusToken}
                  label={
                    card.status === "ready"
                      ? "Ready"
                      : card.status === "partial"
                        ? "Partial"
                        : "Pending"
                  }
                />
              </div>
              <h3 className="mt-3 font-medium text-af-text-primary">{card.title}</h3>
              <p className="mt-1 flex-1 text-af-helper text-af-text-secondary">
                {card.description}
              </p>
              <Link
                href={card.anchor}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-4 w-fit"
                )}
              >
                View
              </Link>
            </article>
          )
        })}
      </div>
    </ReportsPanelCard>
  )
}
