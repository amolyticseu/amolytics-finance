import type { ClientRow } from "@/lib/supabase/types"
import type { ClientFormValues } from "@/lib/validation/client-schema"

export function clientToFormDefaults(row: ClientRow): ClientFormValues {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    contact_name: row.contact_name ?? "",
    email: row.email ?? "",
    hourly_rate: row.hourly_rate != null ? String(row.hourly_rate) : "",
    currency: row.currency,
    billing_cycle_notes: row.billing_cycle_notes ?? "",
  }
}
