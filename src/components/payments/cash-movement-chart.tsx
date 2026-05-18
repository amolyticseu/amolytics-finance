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

import type { CashMovementPoint } from "@/lib/payments/presentation"

type CashMovementChartProps = {
  data: CashMovementPoint[]
}

export function CashMovementChart({ data }: CashMovementChartProps) {
  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-success)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--af-success)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-danger)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--af-danger)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--af-secondary-teal)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--af-secondary-teal)" stopOpacity={0.02} />
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
                name === "inflow"
                  ? "Inflow"
                  : name === "outflow"
                    ? "Outflow"
                    : "Net"
              return [`€${Number.isFinite(n) ? n.toLocaleString("en-IE") : 0}`, label]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="inflow"
            name="Inflow"
            stroke="var(--af-success)"
            fill="url(#inflowFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="outflow"
            name="Outflow"
            stroke="var(--af-danger)"
            fill="url(#outflowFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="var(--af-secondary-teal)"
            fill="url(#netFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
