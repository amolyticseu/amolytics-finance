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

import type { TaskWorkloadPoint } from "@/lib/tasks/presentation"

type TaskWorkloadChartProps = {
  data: TaskWorkloadPoint[]
}

export function TaskWorkloadChart({ data }: TaskWorkloadChartProps) {
  const hasData = data.some((d) => d.open + d.completed + d.blocked > 0)

  if (!hasData) {
    return (
      <p className="text-sm text-af-text-secondary">
        No task activity to chart in the current roster.
      </p>
    )
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--af-border)" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "var(--af-text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--af-text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--af-surface)",
              border: "1px solid var(--af-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="open"
            name="Open"
            fill="var(--af-primary-blue)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="completed"
            name="Completed"
            fill="var(--af-success)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="blocked"
            name="Blocked"
            fill="var(--af-danger)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
