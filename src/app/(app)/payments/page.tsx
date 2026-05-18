import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileWarning,
  Link2,
  ShieldCheck,
  Wallet,
} from "lucide-react"

import { BankDistributionChart } from "@/components/payments/bank-distribution-chart"
import { CashMovementChart } from "@/components/payments/cash-movement-chart"
import { PaymentPanelCard } from "@/components/payments/payment-panel-card"
import { PaymentProofCompact } from "@/components/payments/payment-proof-compact"
import { PaymentsLifecycle } from "@/components/payments/payments-lifecycle"
import { PaymentsProofChecklist } from "@/components/payments/payments-proof-checklist"
import { PaymentsReconciliationFocus } from "@/components/payments/payments-reconciliation-focus"
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
import { getPayments } from "@/lib/data/payments"
import { formatCompactEur, formatEur } from "@/lib/format"
import {
  buildBankDistribution,
  buildCashMovementSeries,
  buildPaymentKpis,
  buildPaymentLifecycleStages,
  buildPaymentProofChecklist,
  buildReconciliationFocusItems,
  directionSoftStatus,
  displayAccountLabel,
  displayPayerPayeeLabel,
  formatPaymentType,
  linkedRecordDisplay,
  paymentStatusSoftToken,
  proofPercent,
} from "@/lib/payments/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { PaymentListItem } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

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

  const kpis = buildPaymentKpis(rows)
  const cashSeries = buildCashMovementSeries(rows)
  const bankDistribution = buildBankDistribution(rows)
  const focusItems = buildReconciliationFocusItems(rows)
  const lifecycleStages = buildPaymentLifecycleStages(rows)
  const proofChecklist = buildPaymentProofChecklist(rows)

  const registerDescription = includeDeleted
    ? "Including soft-deleted payments."
    : source === "database"
      ? "Active payments from Supabase. Payer/payee and account columns use presentation labels."
      : "Mock register for local development. Presentation labels applied."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Track collections, payouts, bank movement, and proof status."
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

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
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
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Payment summary"
      >
        <PremiumKpiCard
          label="Total Inflow"
          value={formatCompactEur(kpis.totalInflowEur)}
          icon={<ArrowDownLeft aria-hidden />}
          badge="EUR"
          helper="Incoming movements"
          variant="green"
        />
        <PremiumKpiCard
          label="Total Outflow"
          value={formatCompactEur(kpis.totalOutflowEur)}
          icon={<ArrowUpRight aria-hidden />}
          badge="EUR"
          helper="Outgoing movements"
          variant="amber"
        />
        <PremiumKpiCard
          label="Net Movement"
          value={formatCompactEur(kpis.netMovementEur)}
          icon={<Wallet aria-hidden />}
          badge="Net"
          helper="Inflow minus outflow"
          variant="teal"
        />
        <PremiumKpiCard
          label="Unmapped Payments"
          value={String(kpis.unmappedCount)}
          icon={<Link2 aria-hidden />}
          badge="No link"
          helper="Missing linked record"
          variant="red"
        />
        <PremiumKpiCard
          label="Proof Completion"
          value={`${kpis.proofCompletionPercent}%`}
          icon={<ShieldCheck aria-hidden />}
          badge="Readiness"
          helper="Avg checklist score"
          variant="blue"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <PaymentPanelCard
          className="xl:col-span-2"
          title="Cash Movement"
          description="Inflow and outflow trend across the selected period"
        >
          <CashMovementChart data={cashSeries} />
        </PaymentPanelCard>

        <PaymentPanelCard
          title="Bank Distribution"
          description="EUR volume by generic account label"
        >
          <BankDistributionChart data={bankDistribution} />
        </PaymentPanelCard>
      </div>

      <PaymentsLifecycle stages={lifecycleStages} />

      <div className="grid gap-6 xl:grid-cols-3">
        <PaymentPanelCard
          className="xl:col-span-2"
          title="Payments Register"
          description="Monitor incoming and outgoing payments, references, and linked records."
          action={
            <Link
              href={includeDeleted ? "/payments" : "/payments?showDeleted=1"}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {includeDeleted ? "Hide removed" : "Show removed"}
            </Link>
          }
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {rows.length === 0 ? (
            <EmptyTableState message="No payments to show. Add one when Supabase is connected, or check Show removed." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-6xl border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Date</DataTableTh>
                    <DataTableTh>Direction</DataTableTh>
                    <DataTableTh>Type</DataTableTh>
                    <DataTableTh>Payer / Payee</DataTableTh>
                    <DataTableTh align="right">Amount</DataTableTh>
                    <DataTableTh>Account</DataTableTh>
                    <DataTableTh>Linked Record</DataTableTh>
                    <DataTableTh>Reference</DataTableTh>
                    <DataTableTh>Proof</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {rows.map((row) => (
                    <PaymentRegisterRow
                      key={row.id}
                      row={row}
                      canMutate={canMutate}
                    />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </PaymentPanelCard>

        <div className="space-y-6">
          <PaymentsReconciliationFocus items={focusItems} />
          <PaymentsProofChecklist items={proofChecklist} />
        </div>
      </div>

      <p className="flex items-center gap-2 text-af-helper text-af-text-muted">
        <FileWarning className="size-3.5 shrink-0" aria-hidden />
        Register payer/payee and bank columns use presentation-only labels. KPI totals
        use EUR rows from the current list. Forms still use real options when Supabase is
        connected.
      </p>
    </div>
  )
}

function PaymentRegisterRow({
  row,
  canMutate,
}: {
  row: PaymentListItem
  canMutate: boolean
}) {
  const dir = directionSoftStatus(row.direction)
  const linked = linkedRecordDisplay(row)

  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd className="tabular-nums text-af-text-secondary">
        {row.payment_date || "—"}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={dir.token} label={dir.label} />
      </DataTableTd>
      <DataTableTd className="font-medium text-af-text-primary">
        {formatPaymentType(row.payment_type)}
      </DataTableTd>
      <DataTableTd className="max-w-40 truncate text-af-text-primary">
        {displayPayerPayeeLabel(row)}
      </DataTableTd>
      <DataTableTd align="right" className="font-medium tabular-nums text-af-text-primary">
        {formatMoney(row.amount, row.currency)}
      </DataTableTd>
      <DataTableTd className="text-af-text-secondary">
        {displayAccountLabel(row)}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={linked.token} label={linked.label} />
      </DataTableTd>
      <DataTableTd className="max-w-40 truncate font-mono text-xs text-af-text-secondary">
        {row.reference?.trim() ? row.reference.trim().slice(0, 24) : "—"}
      </DataTableTd>
      <DataTableTd>
        <PaymentProofCompact percent={proofPercent(row)} />
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={paymentStatusSoftToken(row)} />
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
  )
}
