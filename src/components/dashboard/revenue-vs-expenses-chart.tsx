"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DashboardChartPoint } from "@/lib/dashboard/presentation"

type RevenueVsExpensesChartProps = {
  data: DashboardChartPoint[]
}

export function RevenueVsExpensesChart({ data }: RevenueVsExpensesChartProps) {
  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-primary-blue)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--af-primary-blue)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-warning)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--af-warning)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : Number(value)
              const label = name === "revenue" ? "Revenue" : "Expenses"
              return [
                `€${Number.isFinite(n) ? n.toLocaleString("en-IE") : "—"}`,
                label,
              ]
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--af-primary-blue)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="var(--af-warning)"
            strokeWidth={2}
            fill="url(#expenseFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
