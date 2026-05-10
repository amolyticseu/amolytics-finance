import * as React from "react"

import { cn } from "@/lib/utils"

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border/70 bg-card/40 shadow-none",
        className
      )}
    >
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        {children}
      </table>
    </div>
  )
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border/80 bg-muted/25">{children}</thead>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/60">{children}</tbody>
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-muted/20 [&>td]:py-3 [&>th]:py-3",
        className
      )}
    >
      {children}
    </tr>
  )
}

type Align = "left" | "right"

const alignClass: Record<Align, string> = {
  left: "text-left",
  right: "text-right tabular-nums",
}

export function DataTableTh({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode
  align?: Align
  className?: string
}) {
  return (
    <th
      className={cn(
        "px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase",
        alignClass[align],
        className
      )}
    >
      {children}
    </th>
  )
}

export function DataTableTd({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode
  align?: Align
  className?: string
}) {
  return (
    <td
      className={cn(
        "px-4 text-foreground/90",
        alignClass[align],
        className
      )}
    >
      {children}
    </td>
  )
}
