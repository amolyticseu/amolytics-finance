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
import { MONTHLY_EMI_INR_TOTAL } from "@/data/mock/constants"
import { getSalaryPayments } from "@/lib/data/salaries"
import { formatEur, formatInr } from "@/lib/format"

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

export default async function SalariesPage() {
  const { rows, source } = await getSalaryPayments()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salaries"
        description={`India payroll batches · reference EMI load ₹${MONTHLY_EMI_INR_TOTAL.toLocaleString("en-IN")}/month (non-salary, shown on Expenses).`}
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Source:{" "}
          {source === "database"
            ? "salary_payments (+ team_members & bank_accounts joins)"
            : "built-in mock lines (seed-aligned names)"}
          .
        </span>
      </p>

      <SectionCard
        title="Payroll runs"
        description={
          source === "database"
            ? "Rows from Supabase (read-only). Amounts per row currency."
            : "Per-member mock lines for May 2026 · amounts in INR (local development)."
        }
      >
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
              <DataTableTh>Notes</DataTableTh>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
              >
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
