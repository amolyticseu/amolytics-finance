import Link from "next/link"
import {
  AlertCircle,
  FileWarning,
  Flame,
  RefreshCw,
  Repeat,
  ShieldCheck,
} from "lucide-react"

import { CategoryBreakdownChart } from "@/components/expenses/category-breakdown-chart"
import { ExpensePanelCard } from "@/components/expenses/expense-panel-card"
import { ExpenseProofCompact } from "@/components/expenses/expense-proof-compact"
import { ExpenseTrendChart } from "@/components/expenses/expense-trend-chart"
import { ExpensesLifecycle } from "@/components/expenses/expenses-lifecycle"
import { ExpensesProofChecklist } from "@/components/expenses/expenses-proof-checklist"
import { ExpensesRebillableFocus } from "@/components/expenses/expenses-rebillable-focus"
import { ExpensesRecurringBurn } from "@/components/expenses/expenses-recurring-burn"
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
import { getExpenses } from "@/lib/data/expenses"
import {
  buildCategoryBreakdown,
  buildExpenseKpis,
  buildExpenseLifecycleStages,
  buildExpenseProofChecklist,
  buildExpenseTrendSeries,
  buildRebillableFocusItems,
  buildRecurringBurn,
  categorySoftToken,
  displayClientLabel,
  displayPaymentRef,
  displayVendorLabel,
  expenseStatusSoftToken,
  formatCategoryLabel,
  proofPercent,
} from "@/lib/expenses/presentation"
import { formatEur, formatInr } from "@/lib/format"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { ExpenseListItem } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function formatMoney(amount: number, currency: string): string {
  if (currency === "INR") return formatInr(amount)
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${currency}`
}

type ExpensesPageProps = {
  searchParams: Promise<{ showRemoved?: string; cancelled?: string }>
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams
  const includeRemoved = params.showRemoved === "1"
  const { rows, source, canMutate } = await getExpenses({ includeRemoved })
  const supabaseConfigured = hasSupabaseEnv()

  const kpis = buildExpenseKpis(rows)
  const trendSeries = buildExpenseTrendSeries(rows)
  const categoryBreakdown = buildCategoryBreakdown(rows)
  const focusItems = buildRebillableFocusItems(rows)
  const recurringBurn = buildRecurringBurn(rows)
  const lifecycleStages = buildExpenseLifecycleStages(rows)
  const proofChecklist = buildExpenseProofChecklist(rows)

  const registerDescription = includeRemoved
    ? "Including cancelled / soft-deleted rows."
    : source === "database"
      ? "Active expenses from Supabase. Vendor and client columns use presentation labels."
      : "Mock rows for local development. Presentation labels applied."

  return (
    <div className="space-y-8">
      <PageHeader
        title="Expenses"
        description="Track operating costs, recurring burn, rebillables, and proof readiness."
        actions={
          canMutate ? (
            <Link
              href="/expenses/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add expense
            </Link>
          ) : null
        }
      />

      {params.cancelled === "1" ? (
        <PageAlert>Expense cancelled.</PageAlert>
      ) : null}

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={source}
          sourceLabel={
            source === "database"
              ? "expenses (+ clients & bank_accounts joins)"
              : "built-in seed-aligned mock lines"
          }
          canMutate={canMutate}
        />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Expense summary"
      >
        <PremiumKpiCard
          label="Total Expenses"
          value={formatEur(kpis.totalExpensesEur)}
          icon={<Flame aria-hidden />}
          badge="EUR equiv."
          helper="Active lines"
          variant="amber"
        />
        <PremiumKpiCard
          label="Recurring Burn"
          value={formatEur(kpis.recurringBurnEur)}
          icon={<Repeat aria-hidden />}
          badge="Monthly"
          helper="Recurring lines"
          variant="blue"
        />
        <PremiumKpiCard
          label="Rebillable Pending"
          value={formatEur(kpis.rebillablePendingEur)}
          icon={<RefreshCw aria-hidden />}
          badge="Recovery"
          helper="Pending rebillable"
          variant="teal"
        />
        <PremiumKpiCard
          label="Overdue Expenses"
          value={formatEur(kpis.overdueExpensesEur)}
          icon={<AlertCircle aria-hidden />}
          badge="Attention"
          helper="Past due status"
          variant="red"
        />
        <PremiumKpiCard
          label="Proof Completion"
          value={`${kpis.proofCompletionPercent}%`}
          icon={<ShieldCheck aria-hidden />}
          badge="Readiness"
          helper="Avg checklist score"
          variant="green"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <ExpensePanelCard
          className="xl:col-span-2"
          title="Expense Trend"
          description="Monthly operating cost movement"
        >
          <ExpenseTrendChart data={trendSeries} />
        </ExpensePanelCard>

        <ExpensePanelCard title="Category Breakdown" description="EUR-equivalent mix">
          <CategoryBreakdownChart data={categoryBreakdown} />
        </ExpensePanelCard>
      </div>

      <ExpensesLifecycle stages={lifecycleStages} />

      <div className="grid gap-6 xl:grid-cols-3">
        <ExpensePanelCard
          className="xl:col-span-2"
          title="Expenses Register"
          description="Monitor operating costs, proof status, and rebillable recovery."
          action={
            <Link
              href={includeRemoved ? "/expenses" : "/expenses?showRemoved=1"}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {includeRemoved ? "Hide removed" : "Show removed"}
            </Link>
          }
        >
          <p className="mb-4 text-af-helper text-af-text-secondary">
            {registerDescription}
          </p>
          {rows.length === 0 ? (
            <EmptyTableState message="No expenses to show. Add one when Supabase is connected, or check Show removed." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable className="min-w-272 border-0 bg-transparent shadow-none">
                <DataTableHeader>
                  <tr>
                    <DataTableTh>Date</DataTableTh>
                    <DataTableTh>Category</DataTableTh>
                    <DataTableTh>Vendor / Name</DataTableTh>
                    <DataTableTh align="right">Amount</DataTableTh>
                    <DataTableTh>Type</DataTableTh>
                    <DataTableTh>Linked Client</DataTableTh>
                    <DataTableTh>Payment Ref</DataTableTh>
                    <DataTableTh>Proof</DataTableTh>
                    <DataTableTh>Status</DataTableTh>
                    <DataTableTh align="right">Actions</DataTableTh>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {rows.map((row) => (
                    <ExpenseRegisterRow
                      key={row.id}
                      row={row}
                      canMutate={canMutate}
                    />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}
        </ExpensePanelCard>

        <div className="space-y-6">
          <ExpensesRebillableFocus items={focusItems} />
          <ExpensesRecurringBurn rows={recurringBurn} />
          <ExpensesProofChecklist items={proofChecklist} />
        </div>
      </div>

      <p className="flex items-center gap-2 text-af-helper text-af-text-muted">
        <FileWarning className="size-3.5 shrink-0" aria-hidden />
        Register vendor and client columns use presentation-only labels. KPI totals use
        EUR equivalents from the current list. Forms still use real options when Supabase
        is connected.
      </p>
    </div>
  )
}

function ExpenseRegisterRow({
  row,
  canMutate,
}: {
  row: ExpenseListItem
  canMutate: boolean
}) {
  const datePrimary = row.expense_date || "—"
  const dateCell =
    row.due_date && row.due_date !== row.expense_date ? (
      <div className="space-y-0.5 tabular-nums">
        <div className="text-af-text-primary">{datePrimary}</div>
        <div className="text-xs text-af-text-secondary">Due {row.due_date}</div>
      </div>
    ) : (
      <span className="tabular-nums text-af-text-secondary">{datePrimary}</span>
    )

  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd>{dateCell}</DataTableTd>
      <DataTableTd>
        <SoftStatusBadge
          status={categorySoftToken(row.category)}
          label={formatCategoryLabel(row.category)}
        />
      </DataTableTd>
      <DataTableTd className="max-w-48 truncate font-medium text-af-text-primary">
        {displayVendorLabel(row)}
      </DataTableTd>
      <DataTableTd align="right" className="font-medium tabular-nums text-af-text-primary">
        {formatMoney(row.amount, row.currency)}
      </DataTableTd>
      <DataTableTd>
        <div className="flex flex-wrap gap-1">
          {row.recurring ? (
            <SoftStatusBadge status="recurring" label="Recurring" />
          ) : null}
          {row.rebillable ? (
            <SoftStatusBadge status="rebillable" label="Rebillable" />
          ) : null}
          {!row.recurring && !row.rebillable ? (
            <span className="text-xs text-af-text-muted">—</span>
          ) : null}
        </div>
      </DataTableTd>
      <DataTableTd>
        {row.linked_client_id ? (
          <SoftStatusBadge status="primary" label={displayClientLabel(row)} />
        ) : (
          <span className="text-af-text-muted">—</span>
        )}
      </DataTableTd>
      <DataTableTd className="max-w-32 truncate font-mono text-xs text-af-text-secondary">
        {displayPaymentRef(row)}
      </DataTableTd>
      <DataTableTd>
        <ExpenseProofCompact percent={proofPercent(row)} />
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={expenseStatusSoftToken(row.status)} />
      </DataTableTd>
      <DataTableTd align="right">
        <Link
          href={`/expenses/${row.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {canMutate ? "Edit" : "View"}
        </Link>
      </DataTableTd>
    </tr>
  )
}
