import type { PaymentRow } from "@/lib/supabase/types"
import type { PaymentFormValues } from "@/lib/validation/payment-schema"

export function paymentToFormDefaults(row: PaymentRow): PaymentFormValues {
  return {
    id: row.id,
    payment_type: row.payment_type,
    direction: row.direction,
    invoice_id: row.invoice_id ?? "",
    salary_payment_id: row.salary_payment_id ?? "",
    expense_id: row.expense_id ?? "",
    bank_account_id: row.bank_account_id,
    amount: String(row.amount),
    currency: row.currency,
    payment_date: row.payment_date,
    reference: row.reference ?? "",
    payer_payee_name: row.payer_payee_name ?? "",
    notes: row.notes ?? "",
  }
}

export function emptyPaymentFormDefaults(
  overrides?: Partial<PaymentFormValues>
): PaymentFormValues {
  const today = new Date().toISOString().slice(0, 10)
  return {
    payment_type: "other",
    direction: "in",
    invoice_id: "",
    salary_payment_id: "",
    expense_id: "",
    bank_account_id: "",
    amount: "",
    currency: "EUR",
    payment_date: today,
    reference: "",
    payer_payee_name: "",
    notes: "",
    ...overrides,
  }
}
