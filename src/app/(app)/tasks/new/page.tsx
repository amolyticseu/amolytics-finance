import Link from "next/link"

import { TaskForm } from "@/components/tasks/task-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { emptyTaskFormDefaults } from "@/lib/forms/task-form-defaults"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function NewTaskPage() {
  const canMutate = hasSupabaseEnv()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add task"
        description="Manual compliance or operations checkpoint — no reminders or automation."
      />
      <TaskForm
        mode="create"
        canMutate={canMutate}
        defaultValues={emptyTaskFormDefaults()}
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
