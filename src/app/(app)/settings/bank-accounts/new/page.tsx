import Link from "next/link"

import { BankAccountForm } from "@/components/bank-accounts/bank-account-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getBankAccountsForManage } from "@/lib/data/bank-accounts"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewBankAccountPage() {
  const { canMutate } = await getBankAccountsForManage()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add bank account"
        description="Add a flexible bank account record. Use masked identifiers only."
      />
      <BankAccountForm
        mode="create"
        canMutate={canMutate}
        defaultValues={{
          account_name: "",
          account_holder_name: "",
          institution_name: "",
          account_type: "",
          currency: "EUR",
          country: "",
          iban_masked: "",
          swift_bic: "",
          bank_address: "",
          is_business_account: "false",
          notes: "",
        }}
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
