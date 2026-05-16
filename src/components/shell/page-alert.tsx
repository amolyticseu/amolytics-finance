import { cn } from "@/lib/utils"

type PageAlertVariant = "neutral" | "success" | "warning"

const variantClass: Record<PageAlertVariant, string> = {
  neutral: "border-border/80 bg-muted/30 text-foreground",
  success: "border-border/80 bg-muted/30 text-foreground",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
}

type PageAlertProps = {
  children: React.ReactNode
  variant?: PageAlertVariant
  className?: string
}

export function PageAlert({
  children,
  variant = "neutral",
  className,
}: PageAlertProps) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        variantClass[variant],
        className
      )}
      role="status"
    >
      {children}
    </p>
  )
}
