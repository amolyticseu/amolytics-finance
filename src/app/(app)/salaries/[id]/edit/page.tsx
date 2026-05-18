import Link from "next/link"
import { notFound } from "next/navigation"

import { SalaryPaymentForm } from "@/components/salaries/salary-payment-form"
import { PageHeader } from "@/components/shell/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getSalaryFormOptions, getSalaryPaymentById } from "@/lib/data/salaries"
import { salaryPaymentToFormDefaults } from "@/lib/forms/salary-payment-form-defaults"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type EditSalaryPaymentPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function EditSalaryPaymentPage({
  params,
  searchParams,
}: EditSalaryPaymentPageProps) {
  const { id } = await params
  const query = await searchParams
  const [{ row, canMutate }, options] = await Promise.all([
    getSalaryPaymentById(id),
    getSalaryFormOptions(),
  ])

  if (!row) notFound()

  const isDeleted = row.deleted_at != null

  return (
    <div className="space-y-8">
      <PageHeader
        title={canMutate ? "Edit salary payment" : "View salary payment"}
        description={`Payroll line · ${row.year}-${String(row.month).padStart(2, "0")}`}
      />

      {query.saved === "1" ? (
        <p className="rounded-af-card border border-af-border bg-af-soft-green px-3 py-2 text-sm text-af-text-primary">
          Changes saved.
        </p>
      ) : null}

      <SalaryPaymentForm
        mode="edit"
        canMutate={canMutate}
        isDeleted={isDeleted}
        options={options}
        defaultValues={salaryPaymentToFormDefaults(row)}
      />

      <Link
        href="/salaries"
        className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
      >
        ← Back to salaries
      </Link>
    </div>
  )
}
