import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  description?: string
  value: string
  hint?: string
  icon: LucideIcon
  className?: string
}

export function StatCard({
  title,
  description,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card
      size="sm"
      className={cn("shadow-none ring-foreground/8", className)}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs">{description}</CardDescription>
          ) : null}
        </div>
        <div className="rounded-lg bg-muted/80 p-2 text-muted-foreground ring-1 ring-foreground/5">
          <Icon className="size-4" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
