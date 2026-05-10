import type { ReactNode } from "react"

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
import { getExpenses } from "@/lib/data/expenses"
import { formatEur, formatInr } from "@/lib/format"
import type { ExpenseCategoryDb } from "@/types"
import type { ExpenseListItem } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

const emiEur = inrToEur(MONTHLY_EMI_INR_TOTAL)

function formatCategoryLabel(cat: ExpenseCategoryDb): string {
  if (cat === "emi") return "EMI"
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatMoney(amount: number, currency: string): string {
  if (currency === "INR") return formatInr(amount)
  if (currency === "EUR") return formatEur(amount)
  return `${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${currency}`
}

function clientLabel(row: ExpenseListItem): string {
  const name = row.client_name?.trim()
  const code = row.client_code?.trim()
  if (name && code) return `${name} (${code})`
  if (name) return name
  if (code) return code
  if (row.linked_client_id) return row.linked_client_id
  return "—"
}

function dateCell(row: ExpenseListItem): ReactNode {
  const primary = row.expense_date || "—"
  if (!row.due_date || row.due_date === row.expense_date) {
    return <span className="tabular-nums text-muted-foreground">{primary}</span>
  }
  return (
    <div className="space-y-0.5 tabular-nums">
      <div className="text-foreground">{primary}</div>
      <div className="text-xs text-muted-foreground">Due {row.due_date}</div>
    </div>
  )
}

function yesNo(v: boolean): string {
  return v ? "Yes" : "No"
}

export default async function ExpensesPage() {
  const { rows, source } = await getExpenses()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Expenses"
        description={`Malta fixed ~${formatEur(MALTA_FIXED_MONTHLY_EUR)}/mo · India EMI total ₹${MONTHLY_EMI_INR_TOTAL.toLocaleString("en-IN")} (~${formatEur(emiEur)}) · workspace recovery pending ${formatEur(WORKSPACE_RECOVERY_PENDING_EUR)}.`}
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Source:{" "}
          {source === "database"
            ? "expenses (+ clients & bank_accounts joins)"
            : "built-in seed-aligned mock lines"}
          .
        </span>
      </p>

      <SectionCard
        title="Monthly cost lines"
        description={
          source === "database"
            ? "Rows from Supabase (read-only). Amounts use each row’s currency."
            : "Categorized mock rows aligned with seed examples — subscriptions and compliance can be added in the database."
        }
      >
        <DataTable className="min-w-[56rem]">
          <DataTableHeader>
            <tr>
              <DataTableTh>Dates</DataTableTh>
              <DataTableTh>Category</DataTableTh>
              <DataTableTh>Name</DataTableTh>
              <DataTableTh align="right">Amount</DataTableTh>
              <DataTableTh>Currency</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Recurring</DataTableTh>
              <DataTableTh>Rebillable</DataTableTh>
              <DataTableTh>Linked client</DataTableTh>
              <DataTableTh>Bank / account</DataTableTh>
              <DataTableTh>Payment ref</DataTableTh>
              <DataTableTh>Notes</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
                <DataTableTd>{dateCell(row)}</DataTableTd>
                <DataTableTd className="font-medium">
                  {formatCategoryLabel(row.category)}
                </DataTableTd>
                <DataTableTd className="max-w-[14rem] text-muted-foreground">
                  {row.name}
                </DataTableTd>
                <DataTableTd align="right" className="font-medium tabular-nums">
                  {formatMoney(row.amount, row.currency)}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {row.currency}
                </DataTableTd>
                <DataTableTd>
                  <StatusBadge status={row.status} />
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {yesNo(row.recurring)}
                </DataTableTd>
                <DataTableTd className="tabular-nums text-muted-foreground">
                  {yesNo(row.rebillable)}
                </DataTableTd>
                <DataTableTd className="max-w-[12rem] truncate text-sm">
                  {clientLabel(row)}
                </DataTableTd>
                <DataTableTd className="max-w-[12rem]">
                  {row.bank_display ?? (
                    <span className="text-muted-foreground">
                      {row.bank_account_id ?? "—"}
                    </span>
                  )}
                </DataTableTd>
                <DataTableTd className="max-w-[10rem] truncate font-mono text-xs text-muted-foreground">
                  {row.payment_reference ?? "—"}
                </DataTableTd>
                <DataTableTd className="max-w-[14rem] truncate text-muted-foreground">
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
