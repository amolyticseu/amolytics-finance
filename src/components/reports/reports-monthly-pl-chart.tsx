"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MonthlyPlSeriesPoint } from "@/lib/reports/presentation"

type ReportsMonthlyPlChartProps = {
  data: MonthlyPlSeriesPoint[]
}

export function ReportsMonthlyPlChart({ data }: ReportsMonthlyPlChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-af-text-secondary">
        No monthly snapshot data to chart in the current period.
      </p>
    )
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--af-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--af-text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--af-text-secondary)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000 ? `€${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `€${v}`
            }
          />
          <Tooltip
            contentStyle={{
              background: "var(--af-surface)",
              border: "1px solid var(--af-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : Number(value)
              const label =
                name === "revenue"
                  ? "Revenue"
                  : name === "expenses"
                    ? "Expenses"
                    : "Profit"
              return [`€${Number.isFinite(n) ? n.toLocaleString("en-IE") : 0}`, label]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="var(--af-primary-blue)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="var(--af-warning)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="var(--af-success)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--af-success)" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
