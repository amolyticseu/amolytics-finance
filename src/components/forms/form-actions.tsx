import type * as React from "react"

import { cn } from "@/lib/utils"

type FormActionsProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Primary / secondary actions row (submit + cancel). Place **`SubmitButton`** inside a child **`form`** so `useFormStatus` works.
 */
export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4",
        className
      )}
    >
      {children}
    </div>
  )
}
