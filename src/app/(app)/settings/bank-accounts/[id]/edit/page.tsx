import Link from "next/link"
import { notFound } from "next/navigation"

import { BankAccountForm } from "@/components/bank-accounts/bank-account-form"
import { PageHeader } from "@/components/shell/page-header"
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
        description={`${row.institution_name} · ${row.account_name}`}
      />

      {query.saved === "1" ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-foreground">
          Changes saved.
        </p>
      ) : null}

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
