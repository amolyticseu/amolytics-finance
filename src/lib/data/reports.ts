/**
 * Monthly P&L report (Phase 2 Task 11).
 *
 * Primary source: `monthly_snapshots`. Falls back to `mockMonthlyPl` when Supabase is
 * unavailable, the query fails, or there are no rows with revenue/expense/P&L data.
 */

import { MONTHLY_EMI_INR_TOTAL } from "@/data/mock/constants"
import { mockMonthlyPl } from "@/data/mock/tables"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { MonthlySnapshotRow } from "@/lib/supabase/types"

export type ReportsDataSource = "database" | "fallback"

export type MonthlyPlChartPoint = {
  month: string
  revenue: number
  expenses: number
}

export type MonthlyProfitLossReport = {
  source: ReportsDataSource
  series: MonthlyPlChartPoint[]
  /** Sum of monthly revenue (EUR) across the series. */
  totalRevenueEur: number
  /** Sum of monthly expenses (EUR) across the series. */
  totalExpensesEur: number
  /** Sum of monthly P&L (EUR); uses `profit_loss_eur` when set, else revenue − expenses per row. */
  totalProfitLossEur: number
  /** Sum of `salary_total_inr` across snapshot rows (0 in mock fallback). */
  totalSalaryInr: number
  /** Sum of `emi_total_inr` across snapshot rows; mock fallback uses EMI × month count. */
  totalEmiInr: number
  /** Label for the latest month in the sorted series (e.g. `May 2026`). */
  latestMonthLabel: string
}

const MOCK_SERIES_YEAR = 2026

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback monthly P&L report.`,
    err instanceof Error ? err.message : err
  )
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : NaN
  }
  return NaN
}

function nullableNumeric(raw: unknown): number | null {
  if (raw == null) return null
  const n = toNumber(raw)
  return Number.isFinite(n) ? n : null
}

function normalizeSnapshotRow(raw: Record<string, unknown>): MonthlySnapshotRow {
  return {
    id: String(raw.id),
    month: Math.trunc(Number(raw.month)) || 0,
    year: Math.trunc(Number(raw.year)) || 0,
    revenue_eur: nullableNumeric(raw.revenue_eur),
    revenue_inr: nullableNumeric(raw.revenue_inr),
    expenses_eur: nullableNumeric(raw.expenses_eur),
    expenses_inr: nullableNumeric(raw.expenses_inr),
    salary_total_inr: nullableNumeric(raw.salary_total_inr),
    emi_total_inr: nullableNumeric(raw.emi_total_inr),
    profit_loss_eur: nullableNumeric(raw.profit_loss_eur),
    profit_loss_inr: nullableNumeric(raw.profit_loss_inr),
    notes: raw.notes != null ? String(raw.notes) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function monthYearLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })
}

function snapshotRowHasPlFigures(row: MonthlySnapshotRow): boolean {
  for (const key of ["revenue_eur", "expenses_eur", "profit_loss_eur"] as const) {
    const v = row[key]
    if (v != null && Number.isFinite(v)) return true
  }
  return false
}

function compareSnapshotYearMonth(a: MonthlySnapshotRow, b: MonthlySnapshotRow) {
  if (a.year !== b.year) return a.year - b.year
  return a.month - b.month
}

function buildFromSnapshots(rows: MonthlySnapshotRow[]): MonthlyProfitLossReport {
  const sorted = [...rows].sort(compareSnapshotYearMonth)
  const series: MonthlyPlChartPoint[] = []
  let totalRevenueEur = 0
  let totalExpensesEur = 0
  let totalProfitLossEur = 0
  let totalSalaryInr = 0
  let totalEmiInr = 0

  for (const row of sorted) {
    const rev =
      row.revenue_eur != null && Number.isFinite(row.revenue_eur)
        ? row.revenue_eur
        : 0
    const exp =
      row.expenses_eur != null && Number.isFinite(row.expenses_eur)
        ? row.expenses_eur
        : 0
    const pl =
      row.profit_loss_eur != null && Number.isFinite(row.profit_loss_eur)
        ? row.profit_loss_eur
        : rev - exp

    totalRevenueEur += rev
    totalExpensesEur += exp
    totalProfitLossEur += pl

    if (row.salary_total_inr != null && Number.isFinite(row.salary_total_inr)) {
      totalSalaryInr += row.salary_total_inr
    }
    if (row.emi_total_inr != null && Number.isFinite(row.emi_total_inr)) {
      totalEmiInr += row.emi_total_inr
    }

    series.push({
      month: monthYearLabel(row.year, row.month),
      revenue: rev,
      expenses: exp,
    })
  }

  const last = sorted[sorted.length - 1]
  const latestMonthLabel = last
    ? monthYearLabel(last.year, last.month)
    : "—"

  return {
    source: "database",
    series,
    totalRevenueEur,
    totalExpensesEur,
    totalProfitLossEur,
    totalSalaryInr,
    totalEmiInr,
    latestMonthLabel,
  }
}

function buildFallbackReport(): MonthlyProfitLossReport {
  const series: MonthlyPlChartPoint[] = mockMonthlyPl.map((row) => ({
    month: `${row.month} ${MOCK_SERIES_YEAR}`,
    revenue: row.revenue,
    expenses: row.expenses,
  }))

  let totalRevenueEur = 0
  let totalExpensesEur = 0
  for (const p of series) {
    totalRevenueEur += p.revenue
    totalExpensesEur += p.expenses
  }
  const totalProfitLossEur = totalRevenueEur - totalExpensesEur
  const last = mockMonthlyPl[mockMonthlyPl.length - 1]

  return {
    source: "fallback",
    series,
    totalRevenueEur,
    totalExpensesEur,
    totalProfitLossEur,
    totalSalaryInr: 0,
    totalEmiInr: MONTHLY_EMI_INR_TOTAL * mockMonthlyPl.length,
    latestMonthLabel: last ? `${last.month} ${MOCK_SERIES_YEAR}` : "—",
  }
}

export async function getMonthlyProfitLossReport(): Promise<MonthlyProfitLossReport> {
  if (!hasSupabaseEnv()) {
    return buildFallbackReport()
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("monthly_snapshots")
      .select("*")
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (error) {
      warnFallback("monthly_snapshots query error", error)
      return buildFallbackReport()
    }

    const rawRows = (data ?? []) as Record<string, unknown>[]
    if (rawRows.length === 0) {
      return buildFallbackReport()
    }

    const rows = rawRows.map(normalizeSnapshotRow)
    const useful = rows.filter(snapshotRowHasPlFigures)
    if (useful.length === 0) {
      return buildFallbackReport()
    }

    return buildFromSnapshots(useful)
  } catch (err) {
    warnFallback("monthly_snapshots unexpected error", err)
    return buildFallbackReport()
  }
}
