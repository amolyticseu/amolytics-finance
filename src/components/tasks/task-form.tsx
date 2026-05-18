"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import type { z } from "zod"

import { ActionBanner } from "@/components/forms/action-banner"
import { ReadOnlyFallbackBanner } from "@/components/forms/read-only-fallback-banner"
import { PageAlert } from "@/components/shell/page-alert"
import { FormActions } from "@/components/forms/form-actions"
import { LabeledField } from "@/components/forms/labeled-field"
import { TasksPanelCard } from "@/components/tasks/tasks-panel-card"
import { SubmitButton } from "@/components/forms/submit-button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deleteTaskAction,
  markTaskBlockedAction,
  markTaskDoneAction,
  reopenTaskAction,
  saveTaskAction,
} from "@/lib/actions/tasks"
import type { ActionResult } from "@/lib/forms/action-result"
import { useZodForm } from "@/lib/forms/use-zod-form"
import { cn } from "@/lib/utils"
import type { TaskCategoryDb, TaskDbStatus, TaskPriorityDb } from "@/types"
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validation/task-schema"

const selectClassName =
  "flex h-9 w-full rounded-lg border border-af-border bg-af-surface px-2.5 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"

const textareaClassName =
  "flex w-full min-w-0 rounded-lg border border-af-border bg-af-surface px-2.5 py-2 text-sm text-af-text-primary shadow-none outline-none focus-visible:border-af-primary-blue focus-visible:ring-2 focus-visible:ring-af-primary-blue/20 disabled:opacity-50"

const CATEGORY_LABEL: Record<TaskCategoryDb, string> = {
  invoice: "Invoice",
  payment: "Payment",
  salary: "Salary",
  compliance: "Compliance",
  tax: "Tax",
  company: "Company",
  bank: "Bank",
  other: "Other",
}

const STATUS_LABEL: Record<TaskDbStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
}

const PRIORITY_LABEL: Record<TaskPriorityDb, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

const RELATED_TYPE_OPTIONS = [
  "",
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
] as const

type TaskFormProps = {
  mode: "create" | "edit"
  defaultValues: TaskFormValues
  canMutate: boolean
  statusMessage?: string | null
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): Partial<Record<keyof TaskFormValues, string>> {
  if (!fieldErrors) return {}
  const out: Partial<Record<keyof TaskFormValues, string>> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      out[key as keyof TaskFormValues] = messages[0]
    }
  }
  return out
}

export function TaskForm({
  mode,
  defaultValues,
  canMutate,
  statusMessage,
}: TaskFormProps) {
  const [saveState, saveAction] = useActionState(saveTaskAction, null)
  const [deleteState, deleteAction] = useActionState(deleteTaskAction, null)
  const [doneState, doneAction] = useActionState(markTaskDoneAction, null)
  const [blockedState, blockedAction] = useActionState(
    markTaskBlockedAction,
    null
  )
  const [reopenState, reopenAction] = useActionState(reopenTaskAction, null)

  const {
    register,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: taskFormSchema as z.ZodType<TaskFormValues>,
    defaultValues,
  })

  useEffect(() => {
    const state = saveState as ActionResult | null
    if (state?.ok === false && state.fieldErrors) {
      const mapped = mapServerFieldErrors(state.fieldErrors)
      for (const [key, message] of Object.entries(mapped)) {
        setError(key as keyof TaskFormValues, { message })
      }
    }
  }, [saveState, setError])

  const disabled = !canMutate
  const taskId = defaultValues.id
  const currentStatus = defaultValues.status

  return (
    <div className="space-y-6">
      {!canMutate ? <ReadOnlyFallbackBanner entityLabel="tasks" /> : null}

      {statusMessage ? <PageAlert>{statusMessage}</PageAlert> : null}

      <ActionBanner result={saveState} />
      <ActionBanner result={deleteState} />
      <ActionBanner result={doneState} />
      <ActionBanner result={blockedState} />
      <ActionBanner result={reopenState} />

      <form action={saveAction} className="space-y-6">
        {taskId ? <input type="hidden" name="id" value={taskId} /> : null}

        <TasksPanelCard
          title="Task details"
          description="Manual compliance or operations checkpoint."
          contentClassName="grid gap-4 sm:grid-cols-2"
        >
            <LabeledField
              label="Title"
              htmlFor="title"
              error={errors.title?.message}
              className="sm:col-span-2"
            >
              <Input
                id="title"
                {...register("title")}
                name="title"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Description"
              htmlFor="description"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <textarea
                id="description"
                {...register("description")}
                name="description"
                disabled={disabled}
                rows={3}
                className={textareaClassName}
              />
            </LabeledField>
            <LabeledField
              label="Category"
              htmlFor="category"
              error={errors.category?.message}
            >
              <select
                id="category"
                {...register("category")}
                name="category"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(CATEGORY_LABEL) as TaskCategoryDb[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {CATEGORY_LABEL[key]}
                    </option>
                  )
                )}
              </select>
            </LabeledField>
            <LabeledField
              label="Status"
              htmlFor="status"
              error={errors.status?.message}
            >
              <select
                id="status"
                {...register("status")}
                name="status"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(STATUS_LABEL) as TaskDbStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_LABEL[key]}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Priority"
              htmlFor="priority"
              error={errors.priority?.message}
            >
              <select
                id="priority"
                {...register("priority")}
                name="priority"
                disabled={disabled}
                className={selectClassName}
              >
                {(Object.keys(PRIORITY_LABEL) as TaskPriorityDb[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {PRIORITY_LABEL[key]}
                    </option>
                  )
                )}
              </select>
            </LabeledField>
            <LabeledField
              label="Due date"
              htmlFor="due_date"
              error={errors.due_date?.message}
            >
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                name="due_date"
                disabled={disabled}
              />
            </LabeledField>
            <LabeledField
              label="Completed date"
              htmlFor="completed_at"
              error={errors.completed_at?.message}
              hint="Used when status is done; quick actions set this automatically."
            >
              <Input
                id="completed_at"
                type="date"
                {...register("completed_at")}
                name="completed_at"
                disabled={disabled}
              />
            </LabeledField>
        </TasksPanelCard>

        <TasksPanelCard
          title="Related record"
          description="Optional link to an invoice, payment, or other entity (UUID when known)."
          contentClassName="grid gap-4 sm:grid-cols-2"
        >
            <LabeledField
              label="Entity type"
              htmlFor="related_entity_type"
              error={errors.related_entity_type?.message}
            >
              <select
                id="related_entity_type"
                {...register("related_entity_type")}
                name="related_entity_type"
                disabled={disabled}
                className={selectClassName}
              >
                {RELATED_TYPE_OPTIONS.map((opt) => (
                  <option key={opt || "none"} value={opt}>
                    {opt === "" ? "None" : opt}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField
              label="Entity id"
              htmlFor="related_entity_id"
              error={errors.related_entity_id?.message}
            >
              <Input
                id="related_entity_id"
                {...register("related_entity_id")}
                name="related_entity_id"
                disabled={disabled}
                placeholder="UUID (optional)"
              />
            </LabeledField>
            <LabeledField
              label="Notes"
              htmlFor="notes"
              error={errors.notes?.message}
              className="sm:col-span-2"
            >
              <textarea
                id="notes"
                {...register("notes")}
                name="notes"
                disabled={disabled}
                rows={3}
                className={textareaClassName}
              />
            </LabeledField>
        </TasksPanelCard>

        <FormActions>
          <Link
            href="/tasks"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <SubmitButton disabled={disabled}>
            {mode === "create" ? "Create task" : "Save changes"}
          </SubmitButton>
        </FormActions>
      </form>

      {mode === "edit" && canMutate && taskId ? (
        <TasksPanelCard
          title="Status actions"
          description="Quick updates without editing the full form."
          contentClassName="flex flex-wrap gap-2"
        >
            {currentStatus !== "done" ? (
              <form action={doneAction}>
                <input type="hidden" name="id" value={taskId} />
                <SubmitButton size="sm" pendingLabel="Updating…">
                  Mark done
                </SubmitButton>
              </form>
            ) : null}
            {currentStatus !== "blocked" ? (
              <form action={blockedAction}>
                <input type="hidden" name="id" value={taskId} />
                <SubmitButton
                  size="sm"
                  variant="outline"
                  pendingLabel="Updating…"
                >
                  Mark blocked
                </SubmitButton>
              </form>
            ) : null}
            {currentStatus === "done" || currentStatus === "blocked" ? (
              <form action={reopenAction}>
                <input type="hidden" name="id" value={taskId} />
                <SubmitButton
                  size="sm"
                  variant="secondary"
                  pendingLabel="Reopening…"
                >
                  Reopen
                </SubmitButton>
              </form>
            ) : null}
        </TasksPanelCard>
      ) : null}

      {mode === "edit" && canMutate && taskId ? (
        <TasksPanelCard
          title="Delete task"
          description="Permanently removes this row (schema has no soft-delete column)."
        >
          <form action={deleteAction}>
            <input type="hidden" name="id" value={taskId} />
            <SubmitButton variant="destructive" pendingLabel="Deleting…">
              Delete task
            </SubmitButton>
          </form>
        </TasksPanelCard>
      ) : null}
    </div>
  )
}
