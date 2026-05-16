import { z } from "zod"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))

export const clientFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(200),
  code: z.string().trim().min(1, "Code is required").max(32),
  contact_name: optionalText,
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email")])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
  hourly_rate: z
    .union([z.literal(""), z.coerce.number().positive("Rate must be positive")])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required")
    .max(8)
    .transform((v) => v.toUpperCase()),
  billing_cycle_notes: optionalText,
})

export type ClientFormValues = z.input<typeof clientFormSchema>

export const clientDeactivateSchema = z.object({
  id: z.string().uuid("Invalid client id"),
})
