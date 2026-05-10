import { cn } from "@/lib/utils"

type FieldErrorProps = {
  id?: string
  message?: string | null | undefined
  className?: string
}

/**
 * Inline validation message; pair with `aria-describedby` on the control.
 */
export function FieldError({ id, message, className }: FieldErrorProps) {
  if (message == null || message === "") return null
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-sm text-destructive", className)}
    >
      {message}
    </p>
  )
}
