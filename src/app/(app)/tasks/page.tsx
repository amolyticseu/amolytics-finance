import type { ReactNode } from "react"
import Link from "next/link"

import { DataSourceNote } from "@/components/shell/data-source-note"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { EmptyTableState } from "@/components/shell/empty-table-state"
import { dataTableRowClassName } from "@/components/shell/data-table"
import { SectionCard } from "@/components/shell/section-card"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { StatusBadge } from "@/components/shell/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { getTasks } from "@/lib/data/tasks"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"
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

type TasksPageProps = {
  searchParams: Promise<{ deleted?: string }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const { rows, source, canMutate } = await getTasks()
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tasks"
        description="Compliance, payroll registers, and client admin checkpoints."
        actions={
          canMutate ? (
            <Link
              href="/tasks/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add task
            </Link>
          ) : null
        }
      />

      {params.deleted === "1" ? (
        <PageAlert>Task deleted.</PageAlert>
      ) : null}

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database" ? "tasks table" : "built-in compliance examples"
        }
        canMutate={canMutate}
      />

      <SectionCard
        title="Checklist"
        description={
          source === "database"
            ? "Rows from Supabase — create, edit, and update status when connected."
            : "Illustrative tasks for local development — seed `tasks` for live data."
        }
      >
        {rows.length === 0 ? (
          <EmptyTableState message="No tasks to show. Add one when Supabase is connected." />
        ) : (
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
              <DataTableTh align="right">Actions</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr key={row.id} className={dataTableRowClassName}>
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
                <DataTableTd align="right">
                  <Link
                    href={`/tasks/${row.id}/edit`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    {canMutate ? "Edit" : "View"}
                  </Link>
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
        )}
      </SectionCard>
    </div>
  )
}
