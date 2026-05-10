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
import {
  MALTA_FIXED_MONTHLY_EUR,
  MONTHLY_EMI_INR_TOTAL,
  WORKSPACE_RECOVERY_PENDING_EUR,
  inrToEur,
} from "@/data/mock/constants"
import { mockExpenseLines } from "@/data/mock/tables"
import { formatEur } from "@/lib/format"

const emiEur = inrToEur(MONTHLY_EMI_INR_TOTAL)

export default function ExpensesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Expenses"
        description={`Malta fixed ~${formatEur(MALTA_FIXED_MONTHLY_EUR)}/mo · India EMI total ₹${MONTHLY_EMI_INR_TOTAL.toLocaleString("en-IN")} (~${formatEur(emiEur)}) · workspace recovery pending ${formatEur(WORKSPACE_RECOVERY_PENDING_EUR)}.`}
      />
      <SectionCard
        title="Monthly cost lines"
        description="Categorized mock rows — subscriptions, compliance, and recharge."
      >
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableTh>ID</DataTableTh>
              <DataTableTh>Category</DataTableTh>
              <DataTableTh>Vendor</DataTableTh>
              <DataTableTh>Month</DataTableTh>
              <DataTableTh align="right">Amount</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {mockExpenseLines.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="font-mono text-xs text-muted-foreground">
                  {row.id}
                </DataTableTd>
                <DataTableTd className="font-medium">{row.category}</DataTableTd>
                <DataTableTd className="max-w-[200px] text-muted-foreground">
                  {row.vendor}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.month}
                </DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatEur(row.amountEur)}
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
