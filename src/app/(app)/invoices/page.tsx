import Link from "next/link"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  Receipt,
  Wallet,
} from "lucide-react"

import { InvoicePanelCard } from "@/components/invoices/invoice-panel-card"
import { InvoiceProofCompact } from "@/components/invoices/invoice-proof-compact"
import { InvoicesCollectionFocus } from "@/components/invoices/invoices-collection-focus"
import { InvoicesLifecycle } from "@/components/invoices/invoices-lifecycle"
import { InvoicesProofChecklist } from "@/components/invoices/invoices-proof-checklist"
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
import { buttonVariants } from "@/components/ui/button"
import { getInvoices } from "@/lib/data/invoices"
import { formatCompactEur, formatEur } from "@/lib/format"
import {
  buildCollectionFocusItems,
  buildInvoiceKpis,
  buildLifecycleStages,
  buildProofChecklistOverview,
  displayClientLabel,
  formatPeriodLabel,
  invoiceNumberDisplay,
  invoiceStatusToSoftToken,
  paymentSoftStatus,
  proofPercent,
} from "@/lib/invoices/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { InvoiceListItem } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function formatMoney(amount: number, currency: string): string {
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IE", { maximumFractionDigits: 2 })} ${currency}`
}

type InvoicesPageProps = {
  searchParams: Promise<{ showCancelled?: string; cancelled?: string }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams
  const includeCancelled = params.showCancelled === "1"
  const { rows, source, canMutate } = await getInvoices({ includeCancelled })
  const supabaseConfigured = hasSupabaseEnv()

  const kpis = buildInvoiceKpis(rows)
  const focusItems = buildCollectionFocusItems(rows)
  const lifecycleStages = buildLifecycleStages(rows)
  const proofChecklist = buildProofChecklistOverview(rows)

  const registerDescription = includeCancelled
    ? "Including cancelled / soft-deleted rows."
    : source === "database"
      ? "Active invoices from Supabase. Client column uses presentation labels."
      : "Mock register for local development. Client column uses presentation labels."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        description="Track invoice status, collections, and proof readiness."
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

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
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
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Invoice summary"
      >
        <PremiumKpiCard
          label="Total Invoiced"
          value={formatCompactEur(kpis.totalInvoicedEur)}
          icon={<Receipt aria-hidden />}
          badge="Active"
          helper="Excludes cancelled"
          variant="blue"
        />
        <PremiumKpiCard
          label="Paid Invoices"
          value={String(kpis.paidCount)}
          icon={<CheckCircle2 aria-hidden />}
          badge="Collected"
          helper="Status paid"
          variant="green"
        />
        <PremiumKpiCard
          label="Pending Collection"
          value={formatCompactEur(kpis.pendingCollectionEur)}
          icon={<Clock aria-hidden />}
          badge="Outstanding"
          helper="Sent or overdue"
          variant="amber"
        />
        <PremiumKpiCard
          label="Overdue Amount"
          value={formatCompactEur(kpis.overdueAmountEur)}
          icon={<AlertCircle aria-hidden />}
          badge="Attention"
          helper="Past due"
          variant="red"
        />
        <PremiumKpiCard
          label="Proof Completion"
          value={`${kpis.proofCompletionPercent}%`}
          icon={<FileCheck aria-hidden />}
          badge="Readiness"
          helper="Avg checklist score"
          variant="teal"
        />
      </section>

      <InvoicesLifecycle stages={lifecycleStages} />

      <div className="grid gap-6 xl:grid-cols-3">
        <InvoicePanelCard
          className="xl:col-span-2"
          title="Invoices Register"
          description="Monitor invoice lifecycle, payment status, and proof readiness."
          action={
            <Link
              href={includeCancelled ? "/invoices" : "/invoices?showCancelled=1"}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {includeCancelled ? "Hide cancelled" : "Show cancelled"}
            </Link>
          }
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {rows.length === 0 ? (
            <EmptyTableState message="No invoices to show. Add one when Supabase is connected, or check Show cancelled." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-4xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Invoice ID</DataTableTh>
                    <DataTableTh>Client</DataTableTh>
                    <DataTableTh>Period</DataTableTh>
                    <DataTableTh>Issue / Sent</DataTableTh>
                    <DataTableTh>Due Date</DataTableTh>
                    <DataTableTh align="right">Amount</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                    <DataTableTh>Payment</DataTableTh>
                    <DataTableTh>Proof</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {rows.map((row) => (
                    <InvoiceRegisterRow
                      key={row.id}
                      row={row}
                      canMutate={canMutate}
                    />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </InvoicePanelCard>

        <div className="space-y-6">
          <InvoicesCollectionFocus items={focusItems} />
          <InvoicesProofChecklist items={proofChecklist} />
        </div>
      </div>

      <p className="flex items-center gap-2 text-af-helper text-af-text-muted">
        <Wallet className="size-3.5 shrink-0" aria-hidden />
        Register client names are presentation-only (Client Alpha–Delta). KPI totals and
        lifecycle counts are derived from the current list. Forms still use real client
        options when Supabase is connected.
      </p>
    </div>
  )
}

function InvoiceRegisterRow({
  row,
  canMutate,
}: {
  row: InvoiceListItem
  canMutate: boolean
}) {
  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd className="font-mono text-xs text-af-text-secondary">
        {invoiceNumberDisplay(row)}
      </DataTableTd>
      <DataTableTd className="font-medium text-af-text-primary">
        {displayClientLabel(row)}
      </DataTableTd>
      <DataTableTd className="text-af-text-primary">{formatPeriodLabel(row)}</DataTableTd>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {row.sent_date ?? "—"}
      </DataTableTd>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {row.due_date ?? "—"}
      </DataTableTd>
      <DataTableTd align="right" className="font-medium tabular-nums text-af-text-primary">
        {formatMoney(row.amount, row.currency)}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={invoiceStatusToSoftToken(row.status)} />
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={paymentSoftStatus(row)} />
      </DataTableTd>
      <DataTableTd>
        <InvoiceProofCompact percent={proofPercent(row)} />
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
  )
}
