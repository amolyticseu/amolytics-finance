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
import { CLIENT_LABEL } from "@/data/mock/constants"
import { getInvoices } from "@/lib/data/invoices"
import { formatEur } from "@/lib/format"
import type { InvoiceListItem } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

function formatMoney(amount: number, currency: string): string {
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IE", { maximumFractionDigits: 2 })} ${currency}`
}

function formatPeriodLabel(row: InvoiceListItem): string {
  if (row.year != null && row.month != null && row.period_code) {
    const mm = String(row.month).padStart(2, "0")
    return `${row.year}-${mm} · ${row.period_code}`
  }
  if (row.period_code) return row.period_code
  return "—"
}

function formatMonthYear(row: InvoiceListItem): string {
  if (row.year != null && row.month != null) {
    const mm = String(row.month).padStart(2, "0")
    return `${row.year}-${mm}`
  }
  return "—"
}

function clientLabel(row: InvoiceListItem): string {
  const name = row.client_name?.trim()
  const code = row.client_code?.trim()
  if (name && code) return `${name} (${code})`
  if (name) return name
  if (code) return code
  return row.client_id
}

function invoiceNumberDisplay(row: InvoiceListItem): string {
  return row.invoice_number?.trim() || row.id
}

function paymentRefDisplay(row: InvoiceListItem): string {
  if (row.payment_reference?.trim()) return row.payment_reference.trim()
  if (row.bank_account_id) return "Bank account on file"
  return "—"
}

export default async function InvoicesPage() {
  const { rows, source } = await getInvoices()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        description={`BMF client (${CLIENT_LABEL}) · third-of-month periods T01–T03 · €15/hr reference.`}
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Source:{" "}
          {source === "database"
            ? "invoices (+ clients join)"
            : "built-in mock register"}
          .
        </span>
      </p>

      <SectionCard
        title="Invoice register"
        description={
          source === "database"
            ? "Rows from Supabase (read-only). Amounts use each row’s currency."
            : "Mock line items for local development. Amounts in EUR."
        }
      >
        <DataTable className="min-w-[64rem]">
          <DataTableHeader>
            <tr>
              <DataTableTh>Invoice #</DataTableTh>
              <DataTableTh>Client</DataTableTh>
              <DataTableTh>Period</DataTableTh>
              <DataTableTh>Month / year</DataTableTh>
              <DataTableTh align="right">Hours</DataTableTh>
              <DataTableTh align="right">Rate</DataTableTh>
              <DataTableTh align="right">Amount</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Sent</DataTableTh>
              <DataTableTh>Paid</DataTableTh>
              <DataTableTh>Payment ref</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="font-mono text-xs text-muted-foreground">
                  {invoiceNumberDisplay(row)}
                </DataTableTd>
                <DataTableTd className="font-medium">{clientLabel(row)}</DataTableTd>
                <DataTableTd>{formatPeriodLabel(row)}</DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {formatMonthYear(row)}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {row.hours != null
                    ? row.hours.toLocaleString("en-IE", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {row.hourly_rate != null
                    ? formatMoney(row.hourly_rate, row.currency)
                    : "—"}
                </DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatMoney(row.amount, row.currency)}
                </DataTableTd>
                <DataTableTd>
                  <StatusBadge status={row.status} />
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.sent_date ?? "—"}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.paid_date ? (
                    row.paid_date
                  ) : (
                    <span className="italic text-muted-foreground/80">
                      Pending
                    </span>
                  )}
                </DataTableTd>
                <DataTableTd className="max-w-[10rem] truncate text-muted-foreground">
                  {paymentRefDisplay(row)}
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
