import type * as React from "react"

import { FieldError } from "@/components/forms/field-error"
import { cn } from "@/lib/utils"

type LabeledFieldProps = {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function LabeledField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: LabeledFieldProps) {
  const errorId = `${htmlFor}-error`
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      <FieldError id={errorId} message={error} />
    </div>
  )
}
