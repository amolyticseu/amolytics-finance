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

import type { SalaryBurnTrendPoint } from "@/lib/salaries/presentation"

type SalaryBurnTrendChartProps = {
  data: SalaryBurnTrendPoint[]
}

export function SalaryBurnTrendChart({ data }: SalaryBurnTrendChartProps) {
  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salaryTotalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-primary-blue)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--af-primary-blue)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="salaryPaidFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-success)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--af-success)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="salaryPendingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-warning)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--af-warning)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--af-border)" vertical={false} />
          <XAxis
            dataKey="period"
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
                name === "total"
                  ? "Total"
                  : name === "paid"
                    ? "Paid"
                    : "Pending"
              return [`€${Number.isFinite(n) ? n.toLocaleString("en-IE") : 0}`, label]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="total"
            name="Total salary"
            stroke="var(--af-primary-blue)"
            fill="url(#salaryTotalFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="paid"
            name="Paid"
            stroke="var(--af-success)"
            fill="url(#salaryPaidFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="pending"
            name="Pending"
            stroke="var(--af-warning)"
            fill="url(#salaryPendingFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
