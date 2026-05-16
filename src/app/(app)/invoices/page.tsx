import Link from "next/link"

import { DataSourceNote } from "@/components/shell/data-source-note"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import { EmptyTableState } from "@/components/shell/empty-table-state"
import { dataTableRowClassName } from "@/components/shell/data-table"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { StatusBadge } from "@/components/shell/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { CLIENT_LABEL } from "@/data/mock/constants"
import { getInvoices } from "@/lib/data/invoices"
import { formatEur } from "@/lib/format"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { InvoiceListItem } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

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

type InvoicesPageProps = {
  searchParams: Promise<{ showCancelled?: string; cancelled?: string }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams
  const includeCancelled = params.showCancelled === "1"
  const { rows, source, canMutate } = await getInvoices({ includeCancelled })
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        description={`BMF client (${CLIENT_LABEL}) · third-of-month periods T01–T03 · €15/hr reference.`}
        actions={
          canMutate ? (
            <Link
              href="/invoices/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add invoice
            </Link>
          ) : null
        }
      />

      {params.cancelled === "1" ? (
        <PageAlert>Invoice cancelled.</PageAlert>
      ) : null}

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database"
            ? "invoices (+ clients join)"
            : "built-in mock register"
        }
        canMutate={canMutate}
      />

      <SectionCard
        title="Invoice register"
        description={
          includeCancelled
            ? "Including cancelled / soft-deleted rows."
            : source === "database"
              ? "Active invoices from Supabase. Amounts use each row’s currency."
              : "Mock line items for local development. Amounts in EUR."
        }
        action={
          <Link
            href={
              includeCancelled
                ? "/invoices"
                : "/invoices?showCancelled=1"
            }
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {includeCancelled ? "Hide cancelled" : "Show cancelled"}
          </Link>
        }
      >
        {rows.length === 0 ? (
          <EmptyTableState message="No invoices to show. Add one when Supabase is connected, or check Show cancelled." />
        ) : (
        <DataTable className="min-w-[68rem]">
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
              <DataTableTh align="right">Actions</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr key={row.id} className={dataTableRowClassName}>
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
                <DataTableTd align="right">
                  <Link
                    href={`/invoices/${row.id}/edit`}
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
