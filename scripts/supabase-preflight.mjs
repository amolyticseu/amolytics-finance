/**
 * Local preflight: env, schema tables, seed markers.
 * Does not print secret values.
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const envPath = resolve(root, ".env.local")

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

function mask(s) {
  if (!s || s.length < 12) return "(too short or empty)"
  return `${s.slice(0, 8)}…${s.slice(-4)} (${s.length} chars)`
}

function isValidSupabaseUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === "https:" && u.hostname.endsWith(".supabase.co")
  } catch {
    return false
  }
}

const fileEnv = loadEnvFile(envPath)
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileEnv.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const anonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim()

const report = {
  envFileExists: existsSync(envPath),
  urlPresent: Boolean(url),
  urlValid: isValidSupabaseUrl(url),
  anonKeyPresent: Boolean(anonKey),
  anonKeyLooksJwt: anonKey.startsWith("eyJ") && anonKey.length > 100,
  schema: {},
  seed: {},
  settingsWouldUseDatabase: false,
}

console.log("=== Supabase preflight ===")
console.log(`.env.local exists: ${report.envFileExists}`)
console.log(`NEXT_PUBLIC_SUPABASE_URL present: ${report.urlPresent}`)
console.log(`NEXT_PUBLIC_SUPABASE_URL valid host: ${report.urlValid}`)
if (report.urlPresent) console.log(`URL (masked): ${mask(url)}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY present: ${report.anonKeyPresent}`)
console.log(`Anon key looks like JWT: ${report.anonKeyLooksJwt}`)
if (report.anonKeyPresent) console.log(`Anon key (masked): ${mask(anonKey)}`)

if (!report.urlPresent || !report.anonKeyPresent || !report.urlValid) {
  console.log("\nRESULT: BLOCKED — fix .env.local before Supabase QC")
  process.exit(1)
}

const supabase = createClient(url, anonKey)

const tables = [
  "clients",
  "bank_accounts",
  "exchange_rates",
  "team_members",
  "invoices",
  "payments",
  "expenses",
  "tasks",
]

for (const table of tables) {
  const { error, count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
  report.schema[table] = error
    ? { ok: false, message: error.message }
    : { ok: true, count: count ?? 0 }
}

const { data: fxRow, error: fxErr } = await supabase
  .from("exchange_rates")
  .select("id, base_currency, target_currency, rate_date, source")
  .eq("base_currency", "EUR")
  .eq("target_currency", "INR")
  .order("rate_date", { ascending: false })
  .limit(1)
  .maybeSingle()

const { data: seedClient, error: clientErr } = await supabase
  .from("clients")
  .select("id, code")
  .eq("code", "8BMF8")
  .limit(1)
  .maybeSingle()

const { count: bankCount, error: bankErr } = await supabase
  .from("bank_accounts")
  .select("*", { count: "exact", head: true })
  .eq("active", true)

report.seed = {
  exchangeRate: fxErr ? { ok: false, message: fxErr.message } : { ok: true, row: fxRow },
  client8BMF8: clientErr
    ? { ok: false, message: clientErr.message }
    : { ok: Boolean(seedClient), id: seedClient?.id ?? null },
  activeBankAccounts: bankErr
    ? { ok: false, message: bankErr.message }
    : { ok: true, count: bankCount ?? 0 },
}

report.settingsWouldUseDatabase =
  report.schema.clients?.ok &&
  report.schema.bank_accounts?.ok &&
  report.schema.exchange_rates?.ok &&
  report.seed.exchangeRate?.ok &&
  report.seed.client8BMF8?.ok &&
  (report.seed.activeBankAccounts?.count ?? 0) >= 1 &&
  !fxErr &&
  Boolean(fxRow)

console.log("\n--- Schema tables (row counts) ---")
for (const table of tables) {
  const s = report.schema[table]
  if (s.ok) console.log(`  ${table}: OK (${s.count} rows)`)
  else console.log(`  ${table}: FAIL — ${s.message}`)
}

console.log("\n--- Seed markers ---")
console.log(
  `  EUR/INR exchange_rates: ${report.seed.exchangeRate.ok ? "OK" : "FAIL"}`
)
if (report.seed.exchangeRate.ok && report.seed.exchangeRate.row) {
  console.log(
    `    rate_date=${report.seed.exchangeRate.row.rate_date} source=${report.seed.exchangeRate.row.source}`
  )
}
console.log(
  `  client code 8BMF8: ${report.seed.client8BMF8.ok ? "OK" : "FAIL"}`
)
console.log(
  `  active bank_accounts: ${report.seed.activeBankAccounts.ok ? report.seed.activeBankAccounts.count : "FAIL"}`
)

console.log(
  `\n/settings would show database (all sections): ${report.settingsWouldUseDatabase}`
)
console.log(
  report.settingsWouldUseDatabase
    ? "\nRESULT: READY for Supabase-mode QC"
    : "\nRESULT: Apply schema.sql and seed.sql in Supabase SQL Editor"
)

process.exit(report.settingsWouldUseDatabase ? 0 : 2)
