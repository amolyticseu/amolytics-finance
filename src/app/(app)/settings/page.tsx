import { PageHeader } from "@/components/shell/page-header"
import { SectionCard } from "@/components/shell/section-card"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
} from "@/components/shell/data-table"
import { Separator } from "@/components/ui/separator"
import {
  MALTA_FIXED_MONTHLY_EUR,
  MONTHLY_EMI_INR_TOTAL,
} from "@/data/mock/constants"
import { getActiveBankAccounts } from "@/lib/data/bank-accounts"
import { getActiveClients } from "@/lib/data/clients"
import { getLatestExchangeRate } from "@/lib/data/settings"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { formatEur } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const [fx, banks, clients] = await Promise.all([
    getLatestExchangeRate(),
    getActiveBankAccounts(),
    getActiveClients(),
  ])

  const supabaseConfigured = hasSupabaseEnv()
  const anyFallback =
    fx.source === "fallback" ||
    banks.source === "fallback" ||
    clients.source === "fallback"

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Workspace defaults, live Supabase reads when configured, and built-in fallbacks for local work without a database."
      />

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Using database values when configured; fallback defaults are shown in
        local mock mode.{" "}
        <span className="text-foreground/80">
          Supabase env: {supabaseConfigured ? "present" : "not set"} · Data
          rows:{" "}
          {anyFallback
            ? "at least one section used fallbacks"
            : "loaded from database"}
          .
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Planning FX (EUR → INR)"
          description={`Source: ${fx.source === "database" ? "exchange_rates table" : "built-in default (mock constants)"}.`}
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Rate</dt>
              <dd className="font-medium tabular-nums">
                1 {fx.row.base_currency} = {fx.row.rate} {fx.row.target_currency}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Rate date</dt>
              <dd className="tabular-nums text-muted-foreground">
                {fx.row.rate_date ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Row notes / origin</dt>
              <dd className="max-w-[60%] text-right text-muted-foreground">
                {fx.row.source ?? "—"}
                {fx.row.notes ? ` · ${fx.row.notes}` : null}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Active clients"
          description={`Source: ${clients.source === "database" ? "clients table" : "built-in default"}.`}
        >
          {clients.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active clients in the database yet. Add rows in Supabase or use
              seed.sql.
            </p>
          ) : (
            <DataTable>
              <DataTableHeader>
                <tr>
                  <DataTableTh>Code</DataTableTh>
                  <DataTableTh>Name</DataTableTh>
                  <DataTableTh>Contact</DataTableTh>
                  <DataTableTh align="right">Rate</DataTableTh>
                  <DataTableTh>CCY</DataTableTh>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {clients.rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
                  >
                    <DataTableTd className="font-mono text-xs">{c.code}</DataTableTd>
                    <DataTableTd className="font-medium">{c.name}</DataTableTd>
                    <DataTableTd className="text-muted-foreground">
                      {c.contact_name ?? "—"}
                    </DataTableTd>
                    <DataTableTd align="right" className="tabular-nums">
                      {c.hourly_rate != null ? `€${c.hourly_rate}` : "—"}
                    </DataTableTd>
                    <DataTableTd>{c.currency}</DataTableTd>
                  </tr>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Bank accounts"
        description={`Source: ${banks.source === "database" ? "bank_accounts table" : "built-in default list"}. Active, not soft-deleted.`}
      >
        {banks.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active bank accounts in the database. Run seed.sql or add rows in
            Supabase.
          </p>
        ) : (
          <DataTable>
            <DataTableHeader>
              <tr>
                <DataTableTh>Account</DataTableTh>
                <DataTableTh>Institution</DataTableTh>
                <DataTableTh>Type</DataTableTh>
                <DataTableTh>CCY</DataTableTh>
                <DataTableTh>Country</DataTableTh>
                <DataTableTh>Business</DataTableTh>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {banks.rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border/40 transition-colors hover:bg-muted/15 last:border-b-0"
                >
                  <DataTableTd className="font-medium">{b.account_name}</DataTableTd>
                  <DataTableTd>{b.institution_name}</DataTableTd>
                  <DataTableTd className="text-muted-foreground">
                    {b.account_type ?? "—"}
                  </DataTableTd>
                  <DataTableTd>{b.currency}</DataTableTd>
                  <DataTableTd className="text-muted-foreground">
                    {b.country ?? "—"}
                  </DataTableTd>
                  <DataTableTd className="text-muted-foreground">
                    {b.is_business_account ? "Yes" : "No"}
                  </DataTableTd>
                </tr>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Planning references (mock)"
          description="Static figures still used elsewhere in the app until those pages read from Supabase."
        >
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Malta fixed (mock)</dt>
              <dd className="font-medium tabular-nums">
                {formatEur(MALTA_FIXED_MONTHLY_EUR)}/mo
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">India EMI total (mock)</dt>
              <dd className="font-medium tabular-nums">
                ₹{MONTHLY_EMI_INR_TOTAL.toLocaleString("en-IN")}/mo
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Preferences"
          description="Placeholders for a later phase."
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>· Fiscal year: Jan–Dec</li>
            <li>· Base currency: EUR</li>
            <li>· Payroll currency: INR</li>
            <li>· Notifications: off</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
