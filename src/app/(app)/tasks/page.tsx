import Link from "next/link"
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react"

import { PremiumKpiCard, SoftStatusBadge } from "@/components/design-system"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
  dataTableRowClassName,
} from "@/components/shell/data-table"
import { DataSourceNote } from "@/components/shell/data-source-note"
import { EmptyTableState } from "@/components/shell/empty-table-state"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { TaskStatusMixChart } from "@/components/tasks/task-status-mix-chart"
import { TaskWorkloadChart } from "@/components/tasks/task-workload-chart"
import { TasksComplianceFocus } from "@/components/tasks/tasks-compliance-focus"
import { TasksComplianceTimeline } from "@/components/tasks/tasks-compliance-timeline"
import { TasksLifecycle } from "@/components/tasks/tasks-lifecycle"
import { TasksMonthlyClose } from "@/components/tasks/tasks-monthly-close"
import { TasksPanelCard } from "@/components/tasks/tasks-panel-card"
import { TasksPriorityBoard } from "@/components/tasks/tasks-priority-board"
import { buttonVariants } from "@/components/ui/button"
import { getTasks } from "@/lib/data/tasks"
import {
  buildComplianceFocusItems,
  buildComplianceTimeline,
  buildMonthlyCloseWidget,
  buildPriorityBoard,
  buildTaskKpis,
  buildTaskLifecycleStages,
  buildTaskStatusMix,
  buildTaskWorkloadSeries,
  categorySoftToken,
  displayCategoryLabel,
  displayDueDate,
  displayNotesPreview,
  displayOwner,
  displayRelatedRecord,
  displayTaskTitle,
  prioritySoftToken,
  statusSoftToken,
} from "@/lib/tasks/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { TaskRow } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type TasksPageProps = {
  searchParams: Promise<{ deleted?: string }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const { rows, source, canMutate } = await getTasks()
  const supabaseConfigured = hasSupabaseEnv()

  const kpis = buildTaskKpis(rows)
  const workload = buildTaskWorkloadSeries(rows)
  const statusMix = buildTaskStatusMix(rows)
  const complianceFocus = buildComplianceFocusItems(rows)
  const monthlyClose = buildMonthlyCloseWidget()
  const priorityBoard = buildPriorityBoard(rows)
  const timeline = buildComplianceTimeline(rows)
  const lifecycleStages = buildTaskLifecycleStages(rows)

  const registerDescription =
    source === "database"
      ? "Rows from Supabase — presentation labels applied in the register."
      : "Illustrative compliance tasks for local development."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tasks"
        description="Track finance actions, compliance follow-ups, and monthly close readiness."
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

      {params.deleted === "1" ? <PageAlert>Task deleted.</PageAlert> : null}

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={source}
          sourceLabel={
            source === "database" ? "tasks table" : "built-in compliance examples"
          }
          canMutate={canMutate}
        />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Tasks summary"
      >
        <PremiumKpiCard
          label="Open Tasks"
          value={String(kpis.openCount)}
          icon={<ClipboardList aria-hidden />}
          badge="Active"
          helper="Not done"
          variant="blue"
        />
        <PremiumKpiCard
          label="Due This Week"
          value={String(kpis.dueThisWeekCount)}
          icon={<CalendarClock aria-hidden />}
          badge="Upcoming"
          helper="Next 7 days"
          variant="amber"
        />
        <PremiumKpiCard
          label="Blocked Items"
          value={String(kpis.blockedCount)}
          icon={<Ban aria-hidden />}
          badge="Attention"
          helper="Needs unblock"
          variant="red"
        />
        <PremiumKpiCard
          label="Completed This Month"
          value={String(kpis.completedThisMonthCount)}
          icon={<CheckCircle2 aria-hidden />}
          badge="Done"
          helper="Marked complete"
          variant="green"
        />
        <PremiumKpiCard
          label="Compliance Readiness"
          value={`${kpis.complianceReadinessPercent}%`}
          icon={<ShieldCheck aria-hidden />}
          badge="Readiness"
          helper="Compliance categories"
          variant="teal"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <TasksPanelCard
          className="xl:col-span-2"
          title="Task Workload"
          description="Open, completed, and blocked tasks across the selected period"
        >
          <TaskWorkloadChart data={workload} />
        </TasksPanelCard>

        <TasksPanelCard title="Task Status Mix" description="Todo through blocked">
          <TaskStatusMixChart data={statusMix} />
        </TasksPanelCard>
      </div>

      <TasksLifecycle stages={lifecycleStages} />

      <div className="grid gap-6 xl:grid-cols-3">
        <TasksPanelCard
          className="xl:col-span-2"
          title="Tasks Register"
          description="Monitor follow-ups, compliance actions, priorities, and completion status."
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {rows.length === 0 ? (
            <EmptyTableState message="No tasks to show. Add one when Supabase is connected." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-6xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Task</DataTableTh>
                    <DataTableTh>Category</DataTableTh>
                    <DataTableTh>Priority</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                    <DataTableTh>Due Date</DataTableTh>
                    <DataTableTh>Related Record</DataTableTh>
                    <DataTableTh>Owner</DataTableTh>
                    <DataTableTh>Notes</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {rows.map((row) => (
                    <TaskRegisterRow key={row.id} row={row} canMutate={canMutate} />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </TasksPanelCard>

        <div className="space-y-6">
          <TasksComplianceFocus items={complianceFocus} />
          <TasksMonthlyClose widget={monthlyClose} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TasksPriorityBoard buckets={priorityBoard} />
        <TasksComplianceTimeline items={timeline} />
      </div>

      <p className="text-af-helper text-af-text-muted">
        Register task titles, owners, and related records use presentation-only labels.
        Edit forms still show stored field values when Supabase is connected.
      </p>
    </div>
  )
}

function TaskRegisterRow({
  row,
  canMutate,
}: {
  row: TaskRow
  canMutate: boolean
}) {
  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd className="max-w-56 font-medium text-af-text-primary">
        {displayTaskTitle(row)}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge
          status={categorySoftToken(row)}
          label={displayCategoryLabel(row)}
        />
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge
          status={prioritySoftToken(row.priority)}
          label={row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
        />
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={statusSoftToken(row.status)} />
      </DataTableTd>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {displayDueDate(row)}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status="secondary" label={displayRelatedRecord(row)} />
      </DataTableTd>
      <DataTableTd className="text-af-text-secondary">{displayOwner(row)}</DataTableTd>
      <DataTableTd className="max-w-40 text-sm text-af-text-muted">
        {displayNotesPreview(row)}
      </DataTableTd>
      <DataTableTd align="right">
        <Link
          href={`/tasks/${row.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {canMutate ? "Edit" : "View"}
        </Link>
      </DataTableTd>
    </tr>
  )
}
