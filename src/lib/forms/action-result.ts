/**
 * Standard shapes for CRUD server actions (Phase 2 Task 12).
 * Keep return values JSON-serializable for client consumption + useFormState.
 */

export type FieldErrorMap = Record<string, string[] | undefined>

export type ActionSuccess<T = void> = {
  ok: true
  data: T
}

export type ActionFailure = {
  ok: false
  /** User-facing message (toast or banner). */
  message: string
  /** Optional per-field messages from Zod or domain validation. */
  fieldErrors?: FieldErrorMap
}

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure

export function success<T>(data: T): ActionSuccess<T> {
  return { ok: true, data }
}

export function failure(message: string, fieldErrors?: FieldErrorMap): ActionFailure {
  return { ok: false, message, ...(fieldErrors ? { fieldErrors } : {}) }
}

export function isSuccess<T>(r: ActionResult<T>): r is ActionSuccess<T> {
  return r.ok === true
}

export function isFailure<T>(r: ActionResult<T>): r is ActionFailure {
  return r.ok === false
}

/**
 * Flatten Zod issues into `fieldErrors` (first issue per path segment).
 */
export function fieldErrorsFromZodIssues(
  issues: readonly { path: PropertyKey[]; message: string }[]
): FieldErrorMap {
  const map: FieldErrorMap = {}
  for (const issue of issues) {
    const key =
      issue.path
        .map((p) =>
          typeof p === "string" || typeof p === "number" ? String(p) : "_"
        )
        .join(".") || "_root"
    const prev = map[key]
    if (prev) {
      prev.push(issue.message)
    } else {
      map[key] = [issue.message]
    }
  }
  return map
}
