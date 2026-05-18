/**
 * Applies supabase/seed.sql data when tables are empty (local dev helper).
 * Requires NEXT_PUBLIC_* in .env.local. Does not print secrets.
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const env = loadEnvFile(resolve(root, ".env.local"))
const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const anonKey = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  process.exit(1)
}

const supabase = createClient(url, anonKey)

const { count: clientCount } = await supabase
  .from("clients")
  .select("*", { count: "exact", head: true })

if ((clientCount ?? 0) > 0) {
  console.log(`Seed skipped: clients table already has ${clientCount} row(s).`)
  process.exit(0)
}

console.log("Applying starter seed (empty database)...")

const bankRows = [
  {
    account_name: "Wise EUR — personal",
    institution_name: "Wise",
    account_type: "personal",
    currency: "EUR",
    is_business_account: false,
    active: true,
    notes: "Primary EUR personal wallet",
  },
  {
    account_name: "Revolut",
    institution_name: "Revolut",
    account_type: "personal",
    currency: "EUR",
    country: "MT",
    is_business_account: false,
    active: true,
  },
  {
    account_name: "HSBC Malta",
    institution_name: "HSBC",
    account_type: "current",
    currency: "EUR",
    country: "MT",
    is_business_account: false,
    active: true,
    notes: "Malta business / ops",
  },
  {
    account_name: "ICICI India",
    institution_name: "ICICI Bank",
    account_type: "current",
    currency: "INR",
    country: "IN",
    is_business_account: false,
    active: true,
  },
  {
    account_name: "Amolytics OPC — current (placeholder)",
    institution_name: "TBD",
    account_type: "business_current",
    currency: "EUR",
    country: "MT",
    is_business_account: true,
    active: true,
    notes: "Future Amolytics OPC current account — placeholder row",
  },
]

const { error: bankErr } = await supabase.from("bank_accounts").insert(bankRows)
if (bankErr) {
  console.error("bank_accounts insert failed:", bankErr.message)
  process.exit(1)
}
console.log(`  bank_accounts: ${bankRows.length} rows`)

const { data: client, error: clientErr } = await supabase
  .from("clients")
  .insert({
    name: "8BMF8 / BMF",
    code: "8BMF8",
    contact_name: "Mariusz",
    email: null,
    hourly_rate: 15,
    currency: "EUR",
    billing_cycle_notes:
      "Three invoices per month: T01 (days 1–10), T02 (11–20), T03 (21–end).",
    active: true,
  })
  .select("id")
  .single()

if (clientErr) {
  console.error("clients insert failed:", clientErr.message)
  process.exit(1)
}
console.log("  clients: 1 row")

const teamRows = [
  { name: "Ganpat", role: "Engineer", currency: "INR", active: true },
  { name: "Kamal", role: "Engineer", currency: "INR", active: true },
  { name: "Vinod", role: "Engineer", currency: "INR", active: true },
  { name: "Vasudev", role: "Engineer", currency: "INR", active: true },
  { name: "Siddhatta", role: "Engineer", currency: "INR", active: true },
]
const { error: teamErr } = await supabase.from("team_members").insert(teamRows)
if (teamErr) {
  console.error("team_members insert failed:", teamErr.message)
  process.exit(1)
}
console.log(`  team_members: ${teamRows.length} rows`)

const { error: fxErr } = await supabase.from("exchange_rates").insert({
  base_currency: "EUR",
  target_currency: "INR",
  rate: 90,
  rate_date: "2026-05-10",
  source: "manual_seed",
  notes: "Planning default until automated rates; Phase 1 mock used ₹90/€.",
})
if (fxErr) {
  console.error("exchange_rates insert failed:", fxErr.message)
  process.exit(1)
}
console.log("  exchange_rates: 1 row")

const clientId = client.id
const emis = [
  {
    category: "emi",
    name: "Kotak EMI",
    amount: 16352,
    currency: "INR",
    expense_date: "2026-05-01",
    status: "pending",
    recurring: true,
    rebillable: false,
    linked_client_id: clientId,
    notes: "Loan EMI — Kotak",
  },
  {
    category: "emi",
    name: "IDFC EMI",
    amount: 20528,
    currency: "INR",
    expense_date: "2026-05-01",
    status: "pending",
    recurring: true,
    rebillable: false,
    linked_client_id: clientId,
    notes: "Loan EMI — IDFC",
  },
  {
    category: "emi",
    name: "Axis EMI — facility 1",
    amount: 26619,
    currency: "INR",
    expense_date: "2026-05-01",
    status: "pending",
    recurring: true,
    rebillable: false,
    linked_client_id: clientId,
    notes: "Loan EMI — Axis 1",
  },
  {
    category: "emi",
    name: "Axis EMI — facility 2",
    amount: 6099,
    currency: "INR",
    expense_date: "2026-05-01",
    status: "pending",
    recurring: true,
    rebillable: false,
    linked_client_id: clientId,
    notes: "Loan EMI — Axis 2",
  },
  {
    category: "rent",
    name: "Malta rent",
    amount: 500,
    currency: "EUR",
    expense_date: "2026-05-01",
    status: "pending",
    recurring: true,
    rebillable: false,
    notes: "Fixed Malta rent component",
  },
  {
    category: "utilities",
    name: "Malta utilities",
    amount: 125,
    currency: "EUR",
    expense_date: "2026-05-01",
    status: "pending",
    recurring: true,
    rebillable: false,
    notes: "Fixed Malta utilities component",
  },
  {
    category: "workspace",
    name: "Workspace recovery (pending recharge)",
    amount: 163.08,
    currency: "EUR",
    expense_date: "2026-05-10",
    status: "pending",
    recurring: false,
    rebillable: true,
    linked_client_id: clientId,
    notes:
      "Pending €163.08 recovery; link to invoice line when billed.",
  },
]

const { error: expErr } = await supabase.from("expenses").insert(emis)
if (expErr) {
  console.error("expenses insert failed:", expErr.message)
  process.exit(1)
}
console.log(`  expenses: ${emis.length} rows`)

const { error: taskErr } = await supabase.from("tasks").insert({
  title: "Recharge workspace recovery to BMF",
  description:
    "Align €163.08 workspace recovery with next BMF invoice or separate line item.",
  category: "company",
  status: "todo",
  priority: "medium",
  due_date: "2026-05-31",
  notes:
    "Seed task — replace related_entity_* when expense/invoice IDs are stable in app.",
})
if (taskErr) {
  console.error("tasks insert failed:", taskErr.message)
  process.exit(1)
}
console.log("  tasks: 1 row")

const { error: snapErr } = await supabase.from("monthly_snapshots").insert({
  month: 5,
  year: 2026,
  revenue_eur: 2985,
  expenses_eur: 1517,
  emi_total_inr: 69598,
  notes:
    "Illustrative seed — replace with computed aggregates once CRUD is live.",
})
if (snapErr) {
  console.error("monthly_snapshots insert failed:", snapErr.message)
  process.exit(1)
}
console.log("  monthly_snapshots: 1 row")

console.log("\nSeed applied successfully.")
