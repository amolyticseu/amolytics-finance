import type { InvoiceRow } from "@/lib/supabase/types"
import type { InvoiceFormValues } from "@/lib/validation/invoice-schema"

export function invoiceToFormDefaults(row: InvoiceRow): InvoiceFormValues {
  return {
    id: row.id,
    client_id: row.client_id,
    invoice_number: row.invoice_number ?? "",
    period_code: (row.period_code ?? "T01") as "T01" | "T02" | "T03",
    month: row.month ?? new Date().getMonth() + 1,
    year: row.year ?? new Date().getFullYear(),
    hours: row.hours != null ? String(row.hours) : "",
    hourly_rate: row.hourly_rate != null ? String(row.hourly_rate) : "",
    amount: String(row.amount),
    currency: row.currency,
    status: row.status,
    sent_date: row.sent_date ?? "",
    due_date: row.due_date ?? "",
    paid_date: row.paid_date ?? "",
    bank_account_id: row.bank_account_id ?? "",
    payment_reference: row.payment_reference ?? "",
    workspace_recovery_amount:
      row.workspace_recovery_amount != null
        ? String(row.workspace_recovery_amount)
        : "",
    notes: row.notes ?? "",
  }
}

export function emptyInvoiceFormDefaults(
  overrides?: Partial<InvoiceFormValues>
): InvoiceFormValues {
  const now = new Date()
  return {
    client_id: "",
    invoice_number: "",
    period_code: "T01",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hours: "",
    hourly_rate: "",
    amount: "",
    currency: "EUR",
    status: "draft",
    sent_date: "",
    due_date: "",
    paid_date: "",
    bank_account_id: "",
    payment_reference: "",
    workspace_recovery_amount: "",
    notes: "",
    ...overrides,
  }
}
