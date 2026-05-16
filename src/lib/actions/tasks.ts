"use server"

import { redirect } from "next/navigation"

import { failure, isFailure, type ActionResult } from "@/lib/forms/action-result"
import { parseFormDataWithSchema } from "@/lib/forms/parse-form-data"
import {
  isFallbackEntityId,
  requireSupabaseForMutation,
} from "@/lib/server/require-supabase-mutation"
import { revalidateFinancePaths } from "@/lib/server/revalidate-paths"
import { createClient } from "@/lib/supabase/server"
import { taskFormSchema, taskIdSchema } from "@/lib/validation/task-schema"

const TASK_PATHS = ["/tasks", "/dashboard"] as const

function completedAtForStatus(
  status: string,
  completedAt: string | null
): string | null {
  if (status === "done") {
    return completedAt ?? new Date().toISOString()
  }
  return null
}

export async function saveTaskAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, taskFormSchema)
  if (isFailure(parsed)) return parsed

  const { id, ...fields } = parsed.data
  if (id && isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback tasks.")
  }

  const supabase = await createClient()
  const payload = {
    title: fields.title,
    description: fields.description ?? null,
    category: fields.category,
    status: fields.status,
    priority: fields.priority,
    due_date: fields.due_date,
    completed_at: completedAtForStatus(fields.status, fields.completed_at),
    related_entity_type: fields.related_entity_type,
    related_entity_id: fields.related_entity_id,
    notes: fields.notes ?? null,
  }

  if (id) {
    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return failure("Could not update task. Check related entity id if set.")
    }

    revalidateFinancePaths([...TASK_PATHS])
    redirect(`/tasks/${data.id}/edit?saved=1`)
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    return failure("Could not create task. Check related entity id if set.")
  }

  revalidateFinancePaths([...TASK_PATHS])
  redirect(`/tasks/${data.id}/edit?saved=1`)
}

export async function deleteTaskAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, taskIdSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot delete built-in fallback tasks.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    return failure("Could not delete task.")
  }

  revalidateFinancePaths([...TASK_PATHS])
  redirect("/tasks?deleted=1")
}

export async function markTaskDoneAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, taskIdSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback tasks.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return failure("Could not mark task as done.")
  }

  revalidateFinancePaths([...TASK_PATHS])
  redirect(`/tasks/${id}/edit?status=done`)
}

export async function markTaskBlockedAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, taskIdSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback tasks.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "blocked",
      completed_at: null,
    })
    .eq("id", id)

  if (error) {
    return failure("Could not mark task as blocked.")
  }

  revalidateFinancePaths([...TASK_PATHS])
  redirect(`/tasks/${id}/edit?status=blocked`)
}

export async function reopenTaskAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const envGuard = requireSupabaseForMutation()
  if (envGuard) return envGuard

  const parsed = parseFormDataWithSchema(formData, taskIdSchema)
  if (isFailure(parsed)) return parsed

  const { id } = parsed.data
  if (isFallbackEntityId(id)) {
    return failure("Cannot update built-in fallback tasks.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "todo",
      completed_at: null,
    })
    .eq("id", id)

  if (error) {
    return failure("Could not reopen task.")
  }

  revalidateFinancePaths([...TASK_PATHS])
  redirect(`/tasks/${id}/edit?status=reopened`)
}
