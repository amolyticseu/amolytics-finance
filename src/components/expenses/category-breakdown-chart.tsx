"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { CategoryBreakdownSlice } from "@/lib/expenses/presentation"
import { formatEur } from "@/lib/format"

type CategoryBreakdownChartProps = {
  data: CategoryBreakdownSlice[]
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const chartData = data.filter((d) => d.value > 0)

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-af-text-secondary">
        No active expenses to chart in the current register.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="mx-auto h-[200px] w-[200px] shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value)
                return formatEur(Number.isFinite(n) ? n : 0)
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((slice) => (
          <li
            key={slice.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-af-text-secondary">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.fill }}
                aria-hidden
              />
              {slice.name}
            </span>
            <span className="shrink-0 font-medium tabular-nums text-af-text-primary">
              {formatEur(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
