import { z } from "zod"

import {
  looksLikeFullAccountNumber,
  maskSensitiveAccountIdentifier,
} from "@/lib/bank/mask-account"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))

const businessFlag = z.enum(["true", "false"]).default("false")

export const bankAccountFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    account_name: z.string().trim().min(1, "Account name is required").max(200),
    account_holder_name: optionalText,
    institution_name: z
      .string()
      .trim()
      .min(1, "Institution is required")
      .max(200),
    account_type: optionalText,
    currency: z
      .string()
      .trim()
      .min(1, "Currency is required")
      .max(8)
      .transform((v) => v.toUpperCase()),
    country: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .length(2, "Use a 2-letter country code")
          .transform((v) => v.toUpperCase()),
      ])
      .optional()
      .transform((v) => (v === "" || v == null ? null : v)),
    iban_masked: z
      .union([z.literal(""), z.string().trim()])
      .optional()
      .transform((v) => {
        if (v === "" || v == null) return null
        if (looksLikeFullAccountNumber(v)) {
          return maskSensitiveAccountIdentifier(v)
        }
        return maskSensitiveAccountIdentifier(v) || null
      }),
    swift_bic: optionalText,
    bank_address: optionalText,
    is_business_account: businessFlag,
    notes: optionalText,
  })

export type BankAccountFormValues = z.input<typeof bankAccountFormSchema>

export const bankAccountDeactivateSchema = z.object({
  id: z.string().uuid("Invalid bank account id"),
})
