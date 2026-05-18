import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { BankAccountRow } from "@/lib/supabase/types"
import type { ClientRow } from "@/lib/supabase/types"
import type { ExchangeRateRow } from "@/lib/supabase/types"

const CLIENT_LABELS = ["Client Alpha", "Client Beta", "Client Gamma", "Client Delta"] as const
const CONTACT_LABELS = ["Billing Contact", "Finance Contact", "Operations Contact"] as const
const ACCOUNT_LABELS = [
  "Collection Account",
  "Operations Account",
  "Payroll Account",
  "Reserve Account",
] as const
const INSTITUTION_LABELS = [
  "Payment Institution A",
  "Payment Institution B",
  "Payment Institution C",
  "Payment Institution D",
] as const
const PURPOSE_LABELS = [
  "Client collections",
  "Operating expenses",
  "Payroll payouts",
  "Reserve holding",
] as const

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export function displayClientLabel(row: ClientRow): string {
  return CLIENT_LABELS[hashId(row.id) % CLIENT_LABELS.length]
}

export function displayClientCode(row: ClientRow): string {
  const n = (hashId(row.id) % 900) + 100
  return `CL-${n}`
}

export function displayContactLabel(row: ClientRow): string {
  if (!row.contact_name?.trim() && !row.email?.trim()) return "—"
  return CONTACT_LABELS[hashId(row.id + "contact") % CONTACT_LABELS.length]
}

export function displayAccountLabel(row: BankAccountRow): string {
  return ACCOUNT_LABELS[hashId(row.id) % ACCOUNT_LABELS.length]
}

export function displayInstitutionLabel(_row: BankAccountRow): string {
  return INSTITUTION_LABELS[hashId(_row.id + "inst") % INSTITUTION_LABELS.length]
}

export function displayAccountPurpose(row: BankAccountRow): string {
  const type = (row.account_type ?? "").toLowerCase()
  if (type.includes("business") || row.is_business_account) return "Client collections"
  if (type.includes("current")) return "Operating expenses"
  if (row.currency === "INR") return "Payroll payouts"
  return PURPOSE_LABELS[hashId(row.id + "purpose") % PURPOSE_LABELS.length]
}

export function displayMaskedId(row: BankAccountRow): string {
  if (row.iban_masked?.trim()) {
    const raw = row.iban_masked.trim()
    if (raw.length <= 8) return raw
    return `****${raw.slice(-4)}`
  }
  return "Masked"
}

export function displayPrimaryInvoiceAccount(rows: BankAccountRow[]): string {
  const businessEur = rows.find(
    (r) => r.is_business_account && r.currency === "EUR" && r.active && !r.deleted_at
  )
  if (businessEur) return displayAccountLabel(businessEur)
  const eur = rows.find((r) => r.currency === "EUR" && r.active && !r.deleted_at)
  if (eur) return displayAccountLabel(eur)
  return "Collection Account"
}

export type SettingsKpiSummary = {
  dataSourceLabel: string
  dataSourceVariant: "blue" | "gray"
  activeClients: number
  activeAccounts: number
  exchangeRateLabel: string
  primaryInvoiceAccount: string
}

export function buildSettingsKpis(
  anyFallback: boolean,
  clientCount: number,
  accountCount: number,
  fx: ExchangeRateRow,
  banks: BankAccountRow[]
): SettingsKpiSummary {
  return {
    dataSourceLabel: anyFallback ? "Local Preview" : "Database",
    dataSourceVariant: anyFallback ? "gray" : "blue",
    activeClients: clientCount,
    activeAccounts: accountCount,
    exchangeRateLabel: `1 ${fx.base_currency} = ${fx.rate} ${fx.target_currency}`,
    primaryInvoiceAccount: displayPrimaryInvoiceAccount(banks),
  }
}

export type DataConnectionInfo = {
  currentSource: string
  databaseConnected: boolean
  mode: string
  mutationsEnabled: boolean
  lastCheck: string
}

export function buildDataConnection(
  supabaseConfigured: boolean,
  anyFallback: boolean,
  canMutate: boolean
): DataConnectionInfo {
  return {
    currentSource: anyFallback ? "Local Preview" : "Database",
    databaseConnected: supabaseConfigured,
    mode: canMutate ? "Editable records" : "Read-only demo records",
    mutationsEnabled: canMutate,
    lastCheck: "Just now",
  }
}

export type BusinessDefaultRow = {
  label: string
  value: string
}

export function buildBusinessDefaults(fx: ExchangeRateRow): BusinessDefaultRow[] {
  return [
    { label: "Default currency", value: "EUR" },
    { label: "Local currency", value: "INR" },
    {
      label: "Planning exchange rate",
      value: `1 ${fx.base_currency} = ${fx.rate} ${fx.target_currency}`,
    },
    { label: "Billing cycle", value: "T01 / T02 / T03 monthly windows" },
    { label: "Default invoice rate", value: "Standard hourly (configured per client)" },
    { label: "Finance email", value: "finance@example.com" },
    { label: "Founder email", value: "founder@example.com" },
  ]
}

export type InvoicePaymentDefaultRow = {
  label: string
  value: string
}

export function buildInvoicePaymentDefaults(
  primaryAccount: string
): InvoicePaymentDefaultRow[] {
  return [
    { label: "Primary invoice account", value: primaryAccount },
    { label: "Default payment currency", value: "EUR" },
    { label: "Payment reference required", value: "Yes" },
    { label: "Proof checklist", value: "Visual indicator — no uploads" },
    { label: "Rebillable tracking", value: "Visual indicator — no automation" },
  ]
}

export type AppPreferenceRow = {
  label: string
  value: string
}

export function buildAppPreferences(): AppPreferenceRow[] {
  return [
    { label: "Theme", value: "Light" },
    { label: "Compact tables", value: "Off" },
    { label: "Show cancelled records", value: "Off" },
    { label: "Show inactive records", value: "Off" },
    { label: "Date format", value: "DD MMM YYYY" },
    { label: "Number format", value: "EU style" },
    { label: "Reminder notifications", value: "Not enabled" },
  ]
}

export type SafetyCheckItem = {
  label: string
}

export function buildSafetyChecklist(canMutate: boolean): SafetyCheckItem[] {
  return [
    { label: "Bank details masked" },
    { label: "Demo data uses dummy names" },
    { label: "Sensitive values hidden" },
    {
      label: canMutate
        ? "Connected rows are editable when Supabase is configured"
        : "Local preview rows are read-only",
    },
    { label: "No secrets displayed in UI" },
  ]
}

export function clientStatusToken(active: boolean): SoftStatusToken {
  return active ? "active" : "inactive"
}

export function bankStatusToken(row: BankAccountRow): SoftStatusToken {
  return row.active && !row.deleted_at ? "active" : "inactive"
}

export function isPrimaryAccount(row: BankAccountRow, rows: BankAccountRow[]): boolean {
  const label = displayPrimaryInvoiceAccount(rows)
  return displayAccountLabel(row) === label
}
