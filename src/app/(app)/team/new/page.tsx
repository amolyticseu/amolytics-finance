import Link from "next/link"

import { TeamMemberForm } from "@/components/team/team-member-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getTeamMembersForManage } from "@/lib/data/team"
import { emptyTeamMemberFormDefaults } from "@/lib/forms/team-member-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewTeamMemberPage() {
  const { canMutate } = await getTeamMembersForManage()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add team member"
        description="Add a member to the India delivery bench roster."
      />
      <TeamMemberForm
        mode="create"
        canMutate={canMutate}
        defaultValues={emptyTeamMemberFormDefaults()}
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
