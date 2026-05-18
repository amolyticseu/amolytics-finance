"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { CompositionSlice } from "@/lib/team/presentation"

type TeamCompositionChartProps = {
  data: CompositionSlice[]
}

export function TeamCompositionChart({ data }: TeamCompositionChartProps) {
  const chartData = data.filter((d) => d.value > 0)

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-af-text-secondary">
        No active team members to chart in the current roster.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="mx-auto h-[220px] w-[220px] shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} members`, "Count"]} />
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
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
