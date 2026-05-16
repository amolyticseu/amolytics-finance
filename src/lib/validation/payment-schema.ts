import { z } from "zod"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))

const optionalUuid = z
  .union([z.literal(""), z.string().uuid()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

export const paymentFormSchema = z.object({
  id: z.string().uuid().optional(),
  payment_type: z.enum([
    "client_receipt",
    "salary",
    "expense",
    "transfer",
    "other",
  ]),
  direction: z.enum(["in", "out"]),
  invoice_id: optionalUuid,
  salary_payment_id: optionalUuid,
  expense_id: optionalUuid,
  bank_account_id: z.string().uuid("Select a bank account"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required")
    .max(8)
    .transform((v) => v.toUpperCase()),
  payment_date: z
    .string()
    .trim()
    .min(1, "Payment date is required")
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date (YYYY-MM-DD)"),
  reference: optionalText,
  payer_payee_name: optionalText,
  notes: optionalText,
})

export type PaymentFormValues = z.input<typeof paymentFormSchema>

export const paymentDeleteSchema = z.object({
  id: z.string().uuid("Invalid payment id"),
})
