import Link from "next/link"
import { notFound } from "next/navigation"

import { ExpenseForm } from "@/components/expenses/expense-form"
import { PageAlert } from "@/components/shell/page-alert"
import { PageHeader } from "@/components/shell/page-header"
import { displayVendorLabel } from "@/lib/expenses/presentation"
import { buttonVariants } from "@/components/ui/button"
import { getExpenseById, getExpenseFormOptions } from "@/lib/data/expenses"
import { expenseToFormDefaults } from "@/lib/forms/expense-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditExpensePageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditExpensePage({
  params,
  searchParams,
}: EditExpensePageProps) {
  const { id } = await params
  const query = await searchParams
  const [{ row, canMutate }, options] = await Promise.all([
    getExpenseById(id),
    getExpenseFormOptions(),
  ])

  if (!row) notFound()

  const isRemoved =
    row.deleted_at != null || row.status === "cancelled"

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit expense" : "View expense"}
        description={`${displayVendorLabel(row)} — expense line item.`}
      />

      {query.saved === "1" ? <PageAlert>Changes saved.</PageAlert> : null}

      <ExpenseForm
        mode="edit"
        canMutate={canMutate}
        isRemoved={isRemoved}
        options={options}
        defaultValues={expenseToFormDefaults(row)}
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
