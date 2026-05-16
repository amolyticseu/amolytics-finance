import Link from "next/link"
import { notFound } from "next/navigation"

import { TaskForm } from "@/components/tasks/task-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getTaskById } from "@/lib/data/tasks"
import { taskToFormDefaults } from "@/lib/forms/task-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditTaskPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; status?: string; deleted?: string }>
}

function statusBanner(status: string | undefined): string | null {
  if (status === "done") return "Task marked as done."
  if (status === "blocked") return "Task marked as blocked."
  if (status === "reopened") return "Task reopened."
  return null
}

export default async function EditTaskPage({
  params,
  searchParams,
}: EditTaskPageProps) {
  const { id } = await params
  const query = await searchParams
  const { row, canMutate } = await getTaskById(id)

  if (!row) notFound()

  const statusMessage =
    query.saved === "1"
      ? "Changes saved."
      : statusBanner(query.status)

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit task" : "View task"}
        description={row.title}
      />

      <TaskForm
        mode="edit"
        canMutate={canMutate}
        defaultValues={taskToFormDefaults(row)}
        statusMessage={statusMessage}
      />

      <Link
        href="/tasks"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to tasks
      </Link>
    </div>
  )
}
