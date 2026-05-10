import type { z } from "zod"

import {
  failure,
  fieldErrorsFromZodIssues,
  success,
  type ActionResult,
} from "@/lib/forms/action-result"

/**
 * Convert `FormData` to a plain object (last value wins for duplicate keys).
 * File entries are skipped until CRUD needs uploads.
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue
    out[key] = value === "" ? undefined : value
  }
  return out
}

/**
 * Parse POST body with a Zod schema; map errors to `ActionResult` failure.
 */
export function parseFormDataWithSchema<T extends z.ZodType>(
  formData: FormData,
  schema: T
): ActionResult<z.infer<T>> {
  const raw = formDataToObject(formData)
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", fieldErrorsFromZodIssues(parsed.error.issues))
  }
  return success(parsed.data)
}
