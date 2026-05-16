import type { ExpenseRow } from "@/lib/supabase/types"
import type { ExpenseFormValues } from "@/lib/validation/expense-schema"

export function expenseToFormDefaults(row: ExpenseRow): ExpenseFormValues {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    amount: String(row.amount),
    currency: row.currency,
    expense_date: row.expense_date,
    due_date: row.due_date ?? "",
    status: row.status,
    recurring: row.recurring ? "true" : "false",
    rebillable: row.rebillable ? "true" : "false",
    linked_client_id: row.linked_client_id ?? "",
    bank_account_id: row.bank_account_id ?? "",
    payment_reference: row.payment_reference ?? "",
    notes: row.notes ?? "",
  }
}

export function emptyExpenseFormDefaults(
  overrides?: Partial<ExpenseFormValues>
): ExpenseFormValues {
  const today = new Date().toISOString().slice(0, 10)
  return {
    category: "other",
    name: "",
    amount: "",
    currency: "EUR",
    expense_date: today,
    due_date: "",
    status: "pending",
    recurring: "false",
    rebillable: "false",
    linked_client_id: "",
    bank_account_id: "",
    payment_reference: "",
    notes: "",
    ...overrides,
  }
}
