import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { getPayments } from "@/lib/data/payments"
import { formatEur } from "@/lib/format"
import type { PaymentListItem, PaymentTypeDb } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

const PAYMENT_TYPE_LABEL: Record<PaymentTypeDb, string> = {
  client_receipt: "Client receipt",
  salary: "Salary",
  expense: "Expense",
  transfer: "Transfer",
  other: "Other",
}

function formatPaymentType(t: PaymentTypeDb): string {
  return PAYMENT_TYPE_LABEL[t] ?? t
}

function formatDirection(dir: PaymentListItem["direction"]): string {
  return dir === "in" ? "In" : "Out"
}

function formatMoney(amount: number, currency: string): string {
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IE", { maximumFractionDigits: 2 })} ${currency}`
}

export default async function PaymentsPage() {
  const { rows, source } = await getPayments()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Cash-in across Wise, Revolut, HSBC, and ICICI — reconciliation is mock-only for now."
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Source:{" "}
          {source === "database"
            ? "payments (+ invoices & bank_accounts joins)"
            : "built-in mock register"}
          .
        </span>
      </p>

      <SectionCard
        title="Received & in-flight"
        description={
          source === "database"
            ? "Rows from Supabase (read-only). Match to invoices in a later phase."
            : "Mock line items for local development. Match to invoices in a later phase."
        }
      >
        <DataTable className="min-w-[56rem]">
          <DataTableHeader>
            <tr>
              <DataTableTh>Date</DataTableTh>
              <DataTableTh>Direction</DataTableTh>
              <DataTableTh>Type</DataTableTh>
              <DataTableTh align="right">Amount</DataTableTh>
              <DataTableTh>Currency</DataTableTh>
              <DataTableTh>Invoice #</DataTableTh>
              <DataTableTh>Bank / account</DataTableTh>
              <DataTableTh>Reference</DataTableTh>
              <DataTableTh>Payer / payee</DataTableTh>
              <DataTableTh>Notes</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.payment_date || "—"}
                </DataTableTd>
                <DataTableTd>{formatDirection(row.direction)}</DataTableTd>
                <DataTableTd className="font-medium">
                  {formatPaymentType(row.payment_type)}
                </DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatMoney(row.amount, row.currency)}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.currency}
                </DataTableTd>
                <DataTableTd className="font-mono text-xs">
                  {row.invoice_number ?? "—"}
                </DataTableTd>
                <DataTableTd className="max-w-[12rem]">
                  {row.bank_display ?? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.bank_account_id}
                    </span>
                  )}
                </DataTableTd>
                <DataTableTd className="max-w-[10rem] truncate text-muted-foreground">
                  {row.reference ?? "—"}
                </DataTableTd>
                <DataTableTd className="max-w-[10rem] truncate">
                  {row.payer_payee_name ?? "—"}
                </DataTableTd>
                <DataTableTd className="max-w-[12rem] truncate text-muted-foreground">
                  {row.notes?.trim() ? row.notes : "—"}
                </DataTableTd>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </SectionCard>
    </div>
  )
}
