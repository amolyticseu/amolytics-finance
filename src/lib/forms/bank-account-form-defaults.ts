import type { BankAccountRow } from "@/lib/supabase/types"
import type { BankAccountFormValues } from "@/lib/validation/bank-account-schema"

export function bankAccountToFormDefaults(row: BankAccountRow): BankAccountFormValues {
  return {
    id: row.id,
    account_name: row.account_name,
    account_holder_name: row.account_holder_name ?? "",
    institution_name: row.institution_name,
    account_type: row.account_type ?? "",
    currency: row.currency,
    country: row.country ?? "",
    iban_masked: row.iban_masked ?? "",
    swift_bic: row.swift_bic ?? "",
    bank_address: row.bank_address ?? "",
    is_business_account: row.is_business_account
      ? ("true" as const)
      : ("false" as const),
    notes: row.notes ?? "",
  }
}
