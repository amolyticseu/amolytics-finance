import Link from "next/link"
import { Database, Landmark, RefreshCw, Users, Wallet } from "lucide-react"

import { PremiumKpiCard, SoftStatusBadge } from "@/components/design-system"
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableTd,
  DataTableTh,
  dataTableRowClassName,
} from "@/components/shell/data-table"
import { DataSourceNote } from "@/components/shell/data-source-note"
import { EmptyTableState } from "@/components/shell/empty-table-state"
import { PageHeader } from "@/components/shell/page-header"
import { SettingsDetailList } from "@/components/settings/settings-detail-list"
import { SettingsPanelCard } from "@/components/settings/settings-panel-card"
import { SettingsSafetyChecklist } from "@/components/settings/settings-safety-checklist"
import { buttonVariants } from "@/components/ui/button"
import { getActiveBankAccounts } from "@/lib/data/bank-accounts"
import { getActiveClients } from "@/lib/data/clients"
import { getLatestExchangeRate } from "@/lib/data/settings"
import {
  bankStatusToken,
  buildAppPreferences,
  buildBusinessDefaults,
  buildDataConnection,
  buildInvoicePaymentDefaults,
  buildSafetyChecklist,
  buildSettingsKpis,
  clientStatusToken,
  displayAccountLabel,
  displayAccountPurpose,
  displayClientCode,
  displayClientLabel,
  displayContactLabel,
  displayInstitutionLabel,
  displayMaskedId,
  isPrimaryAccount,
} from "@/lib/settings/presentation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { BankAccountRow } from "@/lib/supabase/types"
import type { ClientRow } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function clientActions(canMutate: boolean) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/settings/clients"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Manage clients
      </Link>
      {canMutate ? (
        <Link
          href="/settings/clients/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Add client
        </Link>
      ) : null}
    </div>
  )
}

function bankActions(canMutate: boolean) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/settings/bank-accounts"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Manage accounts
      </Link>
      {canMutate ? (
        <Link
          href="/settings/bank-accounts/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Add account
        </Link>
      ) : null}
    </div>
  )
}

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
  const canMutate = supabaseConfigured

  const kpis = buildSettingsKpis(
    anyFallback,
    clients.rows.length,
    banks.rows.length,
    fx.row,
    banks.rows
  )
  const dataConnection = buildDataConnection(
    supabaseConfigured,
    anyFallback,
    canMutate
  )
  const businessDefaults = buildBusinessDefaults(fx.row)
  const invoiceDefaults = buildInvoicePaymentDefaults(kpis.primaryInvoiceAccount)
  const appPreferences = buildAppPreferences()
  const safetyItems = buildSafetyChecklist(canMutate)

  const connectionRows = [
    { label: "Current source", value: dataConnection.currentSource },
    {
      label: "Database",
      value: dataConnection.databaseConnected ? "Connected" : "Not connected",
    },
    { label: "Mode", value: dataConnection.mode },
    {
      label: "Mutations",
      value: dataConnection.mutationsEnabled ? "Enabled" : "Disabled",
    },
    { label: "Last check", value: dataConnection.lastCheck },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage finance defaults, clients, bank accounts, and app preferences."
      />

      <div className="rounded-af-card border border-af-border bg-af-surface/80 px-4 py-3 shadow-af-card">
        <DataSourceNote
          supabaseConfigured={supabaseConfigured}
          source={anyFallback ? "fallback" : "database"}
          sourceLabel={
            anyFallback
              ? "at least one section used fallbacks"
              : "settings reads (FX, clients, bank_accounts)"
          }
          canMutate={canMutate}
        />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        aria-label="Settings summary"
      >
        <PremiumKpiCard
          label="Data Source"
          value={kpis.dataSourceLabel}
          icon={<Database aria-hidden />}
          badge="Mode"
          helper={anyFallback ? "Local preview active" : "Live database"}
          variant={kpis.dataSourceVariant}
        />
        <PremiumKpiCard
          label="Active Clients"
          value={String(kpis.activeClients)}
          icon={<Users aria-hidden />}
          badge="Billing"
          helper="Invoice-ready clients"
          variant="blue"
        />
        <PremiumKpiCard
          label="Active Accounts"
          value={String(kpis.activeAccounts)}
          icon={<Landmark aria-hidden />}
          badge="Banking"
          helper="Payment accounts"
          variant="teal"
        />
        <PremiumKpiCard
          label="Exchange Rate"
          value={kpis.exchangeRateLabel}
          icon={<RefreshCw aria-hidden />}
          badge="Planning"
          helper="EUR → INR"
          variant="amber"
        />
        <PremiumKpiCard
          label="Primary Invoice Account"
          value={kpis.primaryInvoiceAccount}
          icon={<Wallet aria-hidden />}
          badge="Invoices"
          helper="Default collection account"
          variant="green"
        />
      </section>

      <SettingsPanelCard
        title="Data Connection"
        description="Current app data source and fallback behavior."
        className="w-full"
      >
        <SettingsDetailList items={connectionRows} />
      </SettingsPanelCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsPanelCard
          title="Business Defaults"
          description="Workspace planning values — presentation only."
        >
          <SettingsDetailList items={businessDefaults} />
        </SettingsPanelCard>

        <SettingsPanelCard
          title="Invoice & Payment Defaults"
          description="Collection and proof indicators — no uploads."
        >
          <SettingsDetailList items={invoiceDefaults} />
        </SettingsPanelCard>
      </div>

      <SettingsPanelCard
        title="Clients"
        description="Manage active clients used in invoices and reports."
        action={clientActions(canMutate)}
      >
        {clients.rows.length === 0 ? (
          <EmptyTableState message="No active clients. Add one when Supabase is connected." />
        ) : (
          <div className="overflow-x-auto">
            <DataTable className="min-w-4xl border-0 bg-transparent shadow-none">
              <DataTableHeader>
                <tr>
                  <DataTableTh>Client</DataTableTh>
                  <DataTableTh>Code</DataTableTh>
                  <DataTableTh>Contact</DataTableTh>
                  <DataTableTh>Currency</DataTableTh>
                  <DataTableTh align="right">Rate</DataTableTh>
                  <DataTableTh>Status</DataTableTh>
                  <DataTableTh align="right">Actions</DataTableTh>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {clients.rows.map((row) => (
                  <ClientOverviewRow
                    key={row.id}
                    row={row}
                    canMutate={canMutate}
                  />
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        )}
      </SettingsPanelCard>

      <SettingsPanelCard
        title="Bank Accounts"
        description="Manage payment accounts without exposing sensitive details."
        action={bankActions(canMutate)}
      >
        {banks.rows.length === 0 ? (
          <EmptyTableState message="No active bank accounts. Add one when Supabase is connected." />
        ) : (
          <div className="overflow-x-auto">
            <DataTable className="min-w-5xl border-0 bg-transparent shadow-none">
              <DataTableHeader>
                <tr>
                  <DataTableTh>Account</DataTableTh>
                  <DataTableTh>Institution</DataTableTh>
                  <DataTableTh>Currency</DataTableTh>
                  <DataTableTh>Purpose</DataTableTh>
                  <DataTableTh>Masked ID</DataTableTh>
                  <DataTableTh>Primary</DataTableTh>
                  <DataTableTh>Status</DataTableTh>
                  <DataTableTh align="right">Actions</DataTableTh>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {banks.rows.map((row) => (
                  <BankOverviewRow
                    key={row.id}
                    row={row}
                    allRows={banks.rows}
                    canMutate={canMutate}
                  />
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        )}
      </SettingsPanelCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsPanelCard
          title="App Preferences"
          description="Visual placeholders — not persisted in this phase."
        >
          <SettingsDetailList items={appPreferences} />
        </SettingsPanelCard>

        <SettingsSafetyChecklist items={safetyItems} />
      </div>

      <p className="text-af-helper text-af-text-muted">
        Overview tables use presentation-only client and account labels. Edit forms
        still show stored values when Supabase is connected for real editing.
      </p>
    </div>
  )
}

function ClientOverviewRow({
  row,
  canMutate,
}: {
  row: ClientRow
  canMutate: boolean
}) {
  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd className="font-medium text-af-text-primary">
        {displayClientLabel(row)}
      </DataTableTd>
      <DataTableTd className="font-mono text-xs text-af-text-secondary">
        {displayClientCode(row)}
      </DataTableTd>
      <DataTableTd className="text-af-text-secondary">
        {displayContactLabel(row)}
      </DataTableTd>
      <DataTableTd>{row.currency}</DataTableTd>
      <DataTableTd align="right" className="tabular-nums text-af-text-secondary">
        {row.hourly_rate != null ? `€${row.hourly_rate}` : "—"}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={clientStatusToken(row.active)} />
      </DataTableTd>
      <DataTableTd align="right">
        <Link
          href={`/settings/clients/${row.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {canMutate ? "Edit" : "View"}
        </Link>
      </DataTableTd>
    </tr>
  )
}

function BankOverviewRow({
  row,
  allRows,
  canMutate,
}: {
  row: BankAccountRow
  allRows: BankAccountRow[]
  canMutate: boolean
}) {
  const primary = isPrimaryAccount(row, allRows)

  return (
    <tr className={dataTableRowClassName}>
      <DataTableTd className="font-medium text-af-text-primary">
        {displayAccountLabel(row)}
      </DataTableTd>
      <DataTableTd className="text-af-text-secondary">
        {displayInstitutionLabel(row)}
      </DataTableTd>
      <DataTableTd>{row.currency}</DataTableTd>
      <DataTableTd className="text-af-text-secondary">
        {displayAccountPurpose(row)}
      </DataTableTd>
      <DataTableTd className="font-mono text-xs text-af-text-muted">
        {displayMaskedId(row)}
      </DataTableTd>
      <DataTableTd>
        {primary ? (
          <SoftStatusBadge status="primary" label="Primary" />
        ) : (
          <span className="text-af-text-muted">—</span>
        )}
      </DataTableTd>
      <DataTableTd>
        <SoftStatusBadge status={bankStatusToken(row)} />
      </DataTableTd>
      <DataTableTd align="right">
        <Link
          href={`/settings/bank-accounts/${row.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {canMutate ? "Edit" : "View"}
        </Link>
      </DataTableTd>
    </tr>
  )
}
