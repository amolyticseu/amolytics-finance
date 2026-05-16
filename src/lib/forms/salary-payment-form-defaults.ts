import type { SalaryPaymentRow } from "@/lib/supabase/types"
import type { SalaryPaymentFormValues } from "@/lib/validation/salary-payment-schema"

export function salaryPaymentToFormDefaults(
  row: SalaryPaymentRow
): SalaryPaymentFormValues {
  return {
    id: row.id,
    team_member_id: row.team_member_id,
    month: row.month,
    year: row.year,
    base_amount: row.base_amount != null ? String(row.base_amount) : "",
    reimbursement: row.reimbursement != null ? String(row.reimbursement) : "",
    deduction: row.deduction != null ? String(row.deduction) : "",
    total_amount: String(row.total_amount),
    currency: row.currency,
    status: row.status,
    payment_date: row.payment_date ?? "",
    bank_account_id: row.bank_account_id ?? "",
    transaction_reference: row.transaction_reference ?? "",
    notes: row.notes ?? "",
  }
}

export function emptySalaryPaymentFormDefaults(
  overrides?: Partial<SalaryPaymentFormValues>
): SalaryPaymentFormValues {
  const now = new Date()
  return {
    team_member_id: "",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    base_amount: "",
    reimbursement: "",
    deduction: "",
    total_amount: "",
    currency: "INR",
    status: "pending",
    payment_date: "",
    bank_account_id: "",
    transaction_reference: "",
    notes: "",
    ...overrides,
  }
}
