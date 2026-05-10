"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export type MonthlyPlChartDataPoint = {
  month: string
  revenue: number
  expenses: number
}

type MonthlyPlChartProps = {
  data: MonthlyPlChartDataPoint[]
}

export function MonthlyPlChart({ data }: MonthlyPlChartProps) {
  return (
    <div className="h-[280px] w-full min-w-0 min-h-[280px]">
      <ResponsiveContainer width="100%" height={280} minHeight={280}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-border/60"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: "12px",
            }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : Number(value)
              return [`€${Number.isFinite(n) ? n.toLocaleString("en-IE") : "—"}`, ""]
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="var(--chart-3)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
