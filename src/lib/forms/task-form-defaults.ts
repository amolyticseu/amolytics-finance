import type { TaskRow } from "@/lib/supabase/types"
import type { TaskFormValues } from "@/lib/validation/task-schema"

function completedAtToFormValue(completedAt: string | null): string {
  if (!completedAt) return ""
  if (completedAt.length >= 10) return completedAt.slice(0, 10)
  return completedAt
}

export function taskToFormDefaults(row: TaskRow): TaskFormValues {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    status: row.status,
    priority: row.priority,
    due_date: row.due_date ?? "",
    completed_at: completedAtToFormValue(row.completed_at),
    related_entity_type: (row.related_entity_type ?? "") as TaskFormValues["related_entity_type"],
    related_entity_id: row.related_entity_id ?? "",
    notes: row.notes ?? "",
  }
}

export function emptyTaskFormDefaults(
  overrides?: Partial<TaskFormValues>
): TaskFormValues {
  return {
    title: "",
    description: "",
    category: "compliance",
    status: "todo",
    priority: "medium",
    due_date: "",
    completed_at: "",
    related_entity_type: "",
    related_entity_id: "",
    notes: "",
    ...overrides,
  }
}
