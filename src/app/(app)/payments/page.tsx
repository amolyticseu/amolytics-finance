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
import { mockPayments } from "@/data/mock/tables"
import { formatEur } from "@/lib/format"

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Cash-in across Wise, Revolut, HSBC, and ICICI — reconciliation is mock-only for now."
      />
      <SectionCard
        title="Received & in-flight"
        description="Match payments to invoices in a later phase."
      >
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableTh>ID</DataTableTh>
              <DataTableTh>Date</DataTableTh>
              <DataTableTh>Account</DataTableTh>
              <DataTableTh>Reference</DataTableTh>
              <DataTableTh>Invoice</DataTableTh>
              <DataTableTh align="right">Amount</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {mockPayments.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="font-mono text-xs text-muted-foreground">
                  {p.id}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {p.date}
                </DataTableTd>
                <DataTableTd className="font-medium">{p.account}</DataTableTd>
                <DataTableTd className="max-w-[140px] truncate text-muted-foreground">
                  {p.reference}
                </DataTableTd>
                <DataTableTd className="font-mono text-xs">{p.matchedInvoice}</DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatEur(p.amountEur)}
                </DataTableTd>
                <DataTableTd>
                  <StatusBadge status={p.status} />
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
