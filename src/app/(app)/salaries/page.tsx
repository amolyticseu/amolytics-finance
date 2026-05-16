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
import { StatusBadge } from "@/components/shell/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { MONTHLY_EMI_INR_TOTAL } from "@/data/mock/constants"
import { getSalaryPayments } from "@/lib/data/salaries"
import { formatEur, formatInr } from "@/lib/format"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function formatMoney(amount: number | null, currency: string): string {
  if (amount == null || !Number.isFinite(amount)) return "—"
  if (currency === "INR") return formatInr(amount)
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${currency}`
}

function monthYearLabel(month: number, year: number): string {
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString("en-IN", { month: "short", year: "numeric" })
}

function memberLabel(row: {
  member_name: string | null
  team_member_id: string
}): string {
  if (row.member_name?.trim()) return row.member_name.trim()
  return row.team_member_id
}

type SalariesPageProps = {
  searchParams: Promise<{ showDeleted?: string; deleted?: string }>
}

export default async function SalariesPage({ searchParams }: SalariesPageProps) {
  const params = await searchParams
  const includeDeleted = params.showDeleted === "1"
  const { rows, source, canMutate } = await getSalaryPayments({ includeDeleted })
  const supabaseConfigured = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salaries"
        description={`India payroll batches · reference EMI load ₹${MONTHLY_EMI_INR_TOTAL.toLocaleString("en-IN")}/month (non-salary, shown on Expenses).`}
        actions={
          canMutate ? (
            <Link
              href="/salaries/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Add salary payment
            </Link>
          ) : null
        }
      />

      {params.deleted === "1" ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground">
          Salary payment removed from the active register.
        </p>
      ) : null}

      <DataSourceNote
        supabaseConfigured={supabaseConfigured}
        source={source}
        sourceLabel={
          source === "database"
            ? "salary_payments (+ team_members & bank_accounts joins)"
            : "built-in mock lines"
        }
        canMutate={canMutate}
      />

      <SectionCard
        title="Payroll runs"
        description={
          includeDeleted
            ? "Including soft-deleted salary payments."
            : source === "database"
              ? "Active rows from Supabase. Manual entry only."
              : "Per-member mock lines for local development."
        }
        action={
          <Link
            href={
              includeDeleted ? "/salaries" : "/salaries?showDeleted=1"
            }
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {includeDeleted ? "Hide removed" : "Show removed"}
          </Link>
        }
      >
        {rows.length === 0 ? (
          <EmptyTableState message="No salary payments to show. Add one when Supabase is connected, or check Show removed." />
        ) : (
        <DataTable className="min-w-[56rem]">
          <DataTableHeader>
            <tr>
              <DataTableTh>Month / year</DataTableTh>
              <DataTableTh>Team member</DataTableTh>
              <DataTableTh>Role</DataTableTh>
              <DataTableTh align="right">Base</DataTableTh>
              <DataTableTh align="right">Reimbursement</DataTableTh>
              <DataTableTh align="right">Deduction</DataTableTh>
              <DataTableTh align="right">Total</DataTableTh>
              <DataTableTh>Currency</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Pay date</DataTableTh>
              <DataTableTh>Bank / account</DataTableTh>
              <DataTableTh>Reference</DataTableTh>
              <DataTableTh align="right">Actions</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr key={row.id} className={dataTableRowClassName}>
                <DataTableTd className="font-medium tabular-nums">
                  {monthYearLabel(row.month, row.year)}
                </DataTableTd>
                <DataTableTd className="font-medium">
                  {memberLabel(row)}
                </DataTableTd>
                <DataTableTd className="text-muted-foreground">
                  {row.member_role?.trim() || "—"}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {formatMoney(row.base_amount, row.currency)}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {formatMoney(row.reimbursement, row.currency)}
                </DataTableTd>
                <DataTableTd align="right" className="tabular-nums">
                  {formatMoney(row.deduction, row.currency)}
                </DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatMoney(row.total_amount, row.currency)}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.currency}
                </DataTableTd>
                <DataTableTd>
                  <StatusBadge status={row.status} />
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.payment_date ? (
                    row.payment_date
                  ) : (
                    <span className="italic text-muted-foreground/80">
                      Pending
                    </span>
                  )}
                </DataTableTd>
                <DataTableTd className="max-w-[12rem]">
                  {row.bank_display ?? (
                    <span className="text-muted-foreground">
                      {row.bank_account_id ?? "—"}
                    </span>
                  )}
                </DataTableTd>
                <DataTableTd className="max-w-[10rem] truncate font-mono text-xs text-muted-foreground">
                  {row.transaction_reference ?? "—"}
                </DataTableTd>
                <DataTableTd align="right">
                  <Link
                    href={`/salaries/${row.id}/edit`}
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
