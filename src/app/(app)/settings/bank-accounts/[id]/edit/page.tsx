import Link from "next/link"
import { notFound } from "next/navigation"

import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { BankAccountForm } from "@/components/bank-accounts/bank-account-form"
import { displayAccountLabel } from "@/lib/settings/presentation"
import { buttonVariants } from "@/components/ui/button"
import { bankAccountToFormDefaults } from "@/lib/forms/bank-account-form-defaults"
import { getBankAccountById } from "@/lib/data/bank-accounts"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditBankAccountPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditBankAccountPage({
  params,
  searchParams,
}: EditBankAccountPageProps) {
  const { id } = await params
  const query = await searchParams
  const { row, canMutate } = await getBankAccountById(id)

  if (!row) notFound()

  const isActive = row.active && row.deleted_at == null

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit bank account" : "View bank account"}
        description={`${displayAccountLabel(row)} — payment account profile.`}
      />

      {query.saved === "1" ? <PageAlert>Changes saved.</PageAlert> : null}

      <BankAccountForm
        mode="edit"
        canMutate={canMutate}
        isActive={isActive}
        defaultValues={bankAccountToFormDefaults(row)}
      />

      <Link
        href="/settings/bank-accounts"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to bank accounts
      </Link>
    </div>
  )
}
