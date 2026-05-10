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
import { mockComplianceTasks } from "@/data/mock/tables"

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tasks"
        description="Compliance, payroll registers, and client admin checkpoints (mock)."
      />
      <SectionCard
        title="Checklist"
        description="Due dates and owners — export or assign in a later phase."
      >
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableTh>ID</DataTableTh>
              <DataTableTh>Task</DataTableTh>
              <DataTableTh>Due</DataTableTh>
              <DataTableTh>Owner</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {mockComplianceTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="font-mono text-xs text-muted-foreground">
                  {task.id}
                </DataTableTd>
                <DataTableTd className="font-medium">{task.title}</DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {task.due}
                </DataTableTd>
                <DataTableTd>{task.owner}</DataTableTd>
                <DataTableTd>
                  <StatusBadge status={task.status} />
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
