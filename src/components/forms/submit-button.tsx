"use client"

import type { ComponentProps } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string
}

/**
 * Submit control for Server Actions / progressive enhancement. Must be rendered inside a **`form`**.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className={cn(className)}
      disabled={disabled ?? pending}
      {...props}
    >
      {pending ? pendingLabel : children}
    </Button>
  )
}
