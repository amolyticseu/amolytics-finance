"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { SoftStatusBadge } from "@/components/design-system"
import type { TaskStatusSlice } from "@/lib/tasks/presentation"

type TaskStatusMixChartProps = {
  data: TaskStatusSlice[]
}

export function TaskStatusMixChart({ data }: TaskStatusMixChartProps) {
  const chartData = data.filter((d) => d.value > 0)

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-af-text-secondary">No tasks in the current roster.</p>
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
              innerRadius={48}
              outerRadius={78}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((slice) => (
          <li
            key={slice.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <SoftStatusBadge status={slice.token} label={slice.name} />
            <span className="shrink-0 font-medium tabular-nums text-af-text-primary">
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
