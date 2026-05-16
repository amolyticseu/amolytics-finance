import { z } from "zod"

import { maskSensitiveAccountIdentifier } from "@/lib/bank/mask-account"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))

const optionalNumber = z
  .union([z.literal(""), z.coerce.number()])
  .optional()
  .transform((v) => (v === "" || v == null || Number.isNaN(v) ? null : v))

export const teamMemberFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(200),
  role: optionalText,
  base_salary: optionalNumber,
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required")
    .max(8)
    .transform((v) => v.toUpperCase()),
  bank_name: optionalText,
  bank_account_masked: z
    .union([z.literal(""), z.string().trim()])
    .optional()
    .transform((v) => {
      if (v === "" || v == null) return null
      return maskSensitiveAccountIdentifier(v) || null
    }),
  notes: optionalText,
})

export type TeamMemberFormValues = z.input<typeof teamMemberFormSchema>

export const teamMemberDeactivateSchema = z.object({
  id: z.string().uuid("Invalid team member id"),
})
