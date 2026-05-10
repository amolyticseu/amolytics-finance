import type { ReactNode } from "react"

import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { StatusBadge } from "@/components/shell/status-badge"
import { getTasks } from "@/lib/data/tasks"
import type { TaskCategoryDb, TaskPriorityDb } from "@/types"
import type { TaskRow } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

function formatCategory(cat: TaskCategoryDb): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function formatPriority(p: TaskPriorityDb): string {
  return p.charAt(0).toUpperCase() + p.slice(1)
}

function relatedCell(row: TaskRow): string {
  const t = row.related_entity_type?.trim()
  const id = row.related_entity_id?.trim()
  if (t && id) return `${t} · ${id.slice(0, 8)}…`
  if (t) return t
  if (id) return id.slice(0, 8) + "…"
  return "—"
}

function detailCell(row: TaskRow): ReactNode {
  const desc = row.description?.trim()
  const notes = row.notes?.trim()
  if (desc && notes) {
    return (
      <div className="max-w-[20rem] space-y-1 text-sm">
        <p className="text-muted-foreground">{desc}</p>
        <p className="text-xs text-muted-foreground/90">Note: {notes}</p>
      </div>
    )
  }
  if (desc) {
    return (
      <p className="max-w-[20rem] text-sm text-muted-foreground">{desc}</p>
    )
  }
  if (notes) {
    return (
      <p className="max-w-[20rem] text-sm text-muted-foreground">{notes}</p>
    )
  }
  return <span className="text-muted-foreground">—</span>
}

export default async function TasksPage() {
  const { rows, source } = await getTasks()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tasks"
        description="Compliance, payroll registers, and client admin checkpoints — read-only register."
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Source:{" "}
          {source === "database" ? "tasks table" : "built-in compliance examples"}
          .
        </span>
      </p>

      <SectionCard
        title="Checklist"
        description={
          source === "database"
            ? "Rows from Supabase (read-only). Assign and complete in a later phase."
            : "Illustrative tasks for local development — seed `tasks` for live data."
        }
      >
        <DataTable className="min-w-[56rem]">
          <DataTableHeader>
            <tr>
              <DataTableTh>Title</DataTableTh>
              <DataTableTh>Category</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Priority</DataTableTh>
              <DataTableTh>Due</DataTableTh>
              <DataTableTh>Completed</DataTableTh>
              <DataTableTh>Related</DataTableTh>
              <DataTableTh>Detail</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="max-w-[14rem] font-medium">
                  {row.title}
                </DataTableTd>
                <DataTableTd>{formatCategory(row.category)}</DataTableTd>
                <DataTableTd>
                  <StatusBadge status={row.status} />
                </DataTableTd>
                <DataTableTd className="text-muted-foreground">
                  {formatPriority(row.priority)}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.due_date ?? "—"}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.completed_at
                    ? row.completed_at.slice(0, 10)
                    : "—"}
                </DataTableTd>
                <DataTableTd className="font-mono text-xs text-muted-foreground">
                  {relatedCell(row)}
                </DataTableTd>
                <DataTableTd>{detailCell(row)}</DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
