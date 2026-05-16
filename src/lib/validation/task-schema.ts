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

const optionalEntityType = z
  .union([
    z.literal(""),
    z.enum([
      "invoice",
      "payment",
      "salary",
      "expense",
      "client",
      "company",
      "bank",
      "compliance",
      "tax",
      "other",
    ]),
  ])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v))

const optionalCompletedAt = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .transform((v) => {
    if (v === "" || v == null) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T12:00:00.000Z`
    return v
  })

export const taskFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required").max(300),
  description: optionalText,
  category: z.enum([
    "invoice",
    "payment",
    "salary",
    "compliance",
    "tax",
    "company",
    "bank",
    "other",
  ]),
  status: z.enum(["todo", "in_progress", "done", "blocked"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: optionalDate,
  completed_at: optionalCompletedAt,
  related_entity_type: optionalEntityType,
  related_entity_id: optionalUuid,
  notes: optionalText,
})

export type TaskFormValues = z.input<typeof taskFormSchema>

export const taskIdSchema = z.object({
  id: z.string().uuid("Invalid task id"),
})
