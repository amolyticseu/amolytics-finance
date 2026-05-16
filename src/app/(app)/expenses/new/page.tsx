import Link from "next/link"

import { ExpenseForm } from "@/components/expenses/expense-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getExpenseFormOptions } from "@/lib/data/expenses"
import { emptyExpenseFormDefaults } from "@/lib/forms/expense-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function NewExpensePage() {
  const options = await getExpenseFormOptions()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add expense"
        description="Manual cost line — categories, dates, and optional client or bank links."
      />
      <ExpenseForm
        mode="create"
        canMutate={options.canMutate}
        options={options}
        defaultValues={emptyExpenseFormDefaults()}
      />
      <Link
        href="/expenses"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to expenses
      </Link>
    </div>
  )
}
