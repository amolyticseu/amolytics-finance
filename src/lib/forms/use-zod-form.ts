"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldValues, type UseFormProps } from "react-hook-form"
import type { z } from "zod"

type UseZodFormProps<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver"
> & {
  schema: z.ZodType<TFieldValues>
}

/**
 * React Hook Form + Zod resolver. Prefer **`z.object({...})`** so output matches **`FieldValues`**.
 */
export function useZodForm<TFieldValues extends FieldValues>(
  props: UseZodFormProps<TFieldValues>
) {
  const { schema, ...rest } = props
  return useForm<TFieldValues>({
    ...rest,
    // Zod 4 + @hookform/resolvers: inference expects input/output aligned with `FieldValues`.
    resolver: zodResolver(schema as never),
  })
}
