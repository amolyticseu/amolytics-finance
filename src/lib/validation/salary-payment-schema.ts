import { z } from "zod"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))

const optionalNumber = z
  .union([z.literal(""), z.coerce.number()])
  .optional()
  .transform((v) => (v === "" || v == null || Number.isNaN(v) ? null : v))

const optionalDate = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

const optionalBankAccountId = z
  .union([z.literal(""), z.string().uuid()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

export const salaryPaymentFormSchema = z.object({
  id: z.string().uuid().optional(),
  team_member_id: z.string().uuid("Select a team member"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  base_amount: optionalNumber,
  reimbursement: optionalNumber,
  deduction: optionalNumber,
  total_amount: z.coerce.number().positive("Total amount must be greater than zero"),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required")
    .max(8)
    .transform((v) => v.toUpperCase()),
  status: z.enum(["pending", "partial", "paid"]),
  payment_date: optionalDate,
  bank_account_id: optionalBankAccountId,
  transaction_reference: optionalText,
  notes: optionalText,
})

export type SalaryPaymentFormValues = z.input<typeof salaryPaymentFormSchema>

export const salaryPaymentDeleteSchema = z.object({
  id: z.string().uuid("Invalid salary payment id"),
})
