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
import { MONTHLY_EMI_INR_TOTAL } from "@/data/mock/constants"
import { mockSalaryRuns } from "@/data/mock/tables"
import { formatInr } from "@/lib/format"

export default function SalariesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Salaries"
        description={`India payroll batches · reference EMI load ₹${MONTHLY_EMI_INR_TOTAL.toLocaleString("en-IN")}/month (non-salary, shown on Expenses).`}
      />
      <SectionCard
        title="Payroll runs"
        description="Batch A/B pattern (mock). Amounts in INR."
      >
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableTh>ID</DataTableTh>
              <DataTableTh>Period</DataTableTh>
              <DataTableTh>Pay date</DataTableTh>
              <DataTableTh align="right">Headcount</DataTableTh>
              <DataTableTh align="right">Total</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {mockSalaryRuns.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="font-mono text-xs text-muted-foreground">
                  {row.id}
                </DataTableTd>
                <DataTableTd className="font-medium">{row.period}</DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.payDate}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {row.headcount}
                </DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatInr(row.totalInr)}
                </DataTableTd>
                <DataTableTd>
                  <StatusBadge status={row.status} />
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
