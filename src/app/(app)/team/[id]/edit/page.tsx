import Link from "next/link"
import { notFound } from "next/navigation"

import { TeamMemberForm } from "@/components/team/team-member-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getTeamMemberById } from "@/lib/data/team"
import { teamMemberToFormDefaults } from "@/lib/forms/team-member-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditTeamMemberPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditTeamMemberPage({
  params,
  searchParams,
}: EditTeamMemberPageProps) {
  const { id } = await params
  const query = await searchParams
  const { row, canMutate } = await getTeamMemberById(id)

  if (!row) notFound()

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit team member" : "View team member"}
        description={row.name}
      />

      {query.saved === "1" ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground">
          Changes saved.
        </p>
      ) : null}

      <TeamMemberForm
        mode="edit"
        canMutate={canMutate}
        isActive={row.active}
        defaultValues={teamMemberToFormDefaults(row)}
      />

      <Link
        href="/team"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to team
      </Link>
    </div>
  )
}
