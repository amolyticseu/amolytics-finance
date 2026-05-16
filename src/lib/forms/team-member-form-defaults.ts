import type { TeamMemberRow } from "@/lib/supabase/types"
import type { TeamMemberFormValues } from "@/lib/validation/team-member-schema"

export function teamMemberToFormDefaults(row: TeamMemberRow): TeamMemberFormValues {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? "",
    base_salary: row.base_salary != null ? String(row.base_salary) : "",
    currency: row.currency,
    bank_name: row.bank_name ?? "",
    bank_account_masked: row.bank_account_masked ?? "",
    notes: row.notes ?? "",
  }
}

export function emptyTeamMemberFormDefaults(
  overrides?: Partial<TeamMemberFormValues>
): TeamMemberFormValues {
  return {
    name: "",
    role: "",
    base_salary: "",
    currency: "INR",
    bank_name: "",
    bank_account_masked: "",
    notes: "",
    ...overrides,
  }
}
