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
import { buttonVariants } from "@/components/ui/button"
import { getPayments } from "@/lib/data/payments"
import { formatEur } from "@/lib/format"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { PaymentListItem, PaymentTypeDb } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

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

type PaymentsPageProps = {
  searchParams: Promise<{ showDeleted?: string; deleted?: string }>
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams
  const includeDeleted = params.showDeleted === "1"
  const { rows, source, canMutate } = await getPayments({ includeDeleted })
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Cash in and out across HSBC, Revolut, ICICI, and Wise — optional links to invoices, salaries, or expenses. Client invoice receipts typically land in HSBC Malta."
        actions={
          canMutate ? (
            <Link
              href="/payments/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add payment
            </Link>
          ) : null
        }
      />

      {params.deleted === "1" ? (
        <PageAlert>Payment removed from the active register.</PageAlert>
      ) : null}

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database"
            ? "payments (+ invoices & bank_accounts joins)"
            : "built-in mock register"
        }
        canMutate={canMutate}
      />

      <SectionCard
        title="Received & in-flight"
        description={
          includeDeleted
            ? "Including soft-deleted payments."
            : source === "database"
              ? "Active payments from Supabase. Invoice links are optional."
              : "Mock line items for local development."
        }
        action={
          <Link
            href={
              includeDeleted ? "/payments" : "/payments?showDeleted=1"
            }
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {includeDeleted ? "Hide removed" : "Show removed"}
          </Link>
        }
      >
        {rows.length === 0 ? (
          <EmptyTableState message="No payments to show. Add one when Supabase is connected, or check Show removed." />
        ) : (
        <DataTable className="min-w-[60rem]">
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
              <DataTableTh align="right">Actions</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr key={row.id} className={dataTableRowClassName}>
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
                <DataTableTd align="right">
                  <Link
                    href={`/payments/${row.id}/edit`}
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
