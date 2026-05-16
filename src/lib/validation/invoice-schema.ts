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
  .transform((v) => {
    if (v === "" || v == null) return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null
    return v
  })

const optionalBankAccountId = z
  .union([z.literal(""), z.string().uuid()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

export const invoiceFormSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid("Select a client"),
  invoice_number: optionalText,
  period_code: z.enum(["T01", "T02", "T03"]),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  hours: optionalNumber,
  hourly_rate: optionalNumber,
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required")
    .max(8)
    .transform((v) => v.toUpperCase()),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  sent_date: optionalDate,
  due_date: optionalDate,
  paid_date: optionalDate,
  bank_account_id: optionalBankAccountId,
  payment_reference: optionalText,
  workspace_recovery_amount: optionalNumber,
  notes: optionalText,
})

export type InvoiceFormValues = z.input<typeof invoiceFormSchema>

export const invoiceCancelSchema = z.object({
  id: z.string().uuid("Invalid invoice id"),
})
