import Link from "next/link"
import { notFound } from "next/navigation"

import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { TeamMemberForm } from "@/components/team/team-member-form"
import { displayMemberLabel } from "@/lib/team/presentation"
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
        description={`${displayMemberLabel(row)} — roster profile and payout details.`}
      />

      {query.saved === "1" ? <PageAlert>Changes saved.</PageAlert> : null}

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
