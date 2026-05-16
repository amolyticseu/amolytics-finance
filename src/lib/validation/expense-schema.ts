import { z } from "zod"

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))

const optionalDate = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

const optionalUuid = z
  .union([z.literal(""), z.string().uuid()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

export const expenseFormSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.enum([
    "emi",
    "rent",
    "utilities",
    "subscription",
    "workspace",
    "tax",
    "compliance",
    "other",
  ]),
  name: z.string().trim().min(1, "Name is required").max(300),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required")
    .max(8)
    .transform((v) => v.toUpperCase()),
  expense_date: z
    .string()
    .trim()
    .min(1, "Expense date is required")
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Use YYYY-MM-DD"),
  due_date: optionalDate,
  status: z.enum(["pending", "paid", "overdue", "cancelled"]),
  recurring: z.enum(["true", "false"]).default("false"),
  rebillable: z.enum(["true", "false"]).default("false"),
  linked_client_id: optionalUuid,
  bank_account_id: optionalUuid,
  payment_reference: optionalText,
  notes: optionalText,
})

export type ExpenseFormValues = z.input<typeof expenseFormSchema>

export const expenseCancelSchema = z.object({
  id: z.string().uuid("Invalid expense id"),
})
