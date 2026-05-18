# UI Phase 12 — Settings

Date: 2026-05-17  
Status: Complete (settings module UI only)

## Files changed

| File | Change |
|------|--------|
| `src/app/(app)/settings/page.tsx` | Full settings hub redesign |
| `src/app/(app)/settings/clients/page.tsx` | Premium register + presentation labels |
| `src/app/(app)/settings/clients/new/page.tsx` | Unchanged routing; inherits form styling |
| `src/app/(app)/settings/clients/[id]/edit/page.tsx` | `PageAlert`; dummy-safe header |
| `src/app/(app)/settings/bank-accounts/page.tsx` | Premium register + presentation labels |
| `src/app/(app)/settings/bank-accounts/new/page.tsx` | Unchanged routing; inherits form styling |
| `src/app/(app)/settings/bank-accounts/[id]/edit/page.tsx` | `PageAlert`; dummy-safe header |
| `src/lib/settings/presentation.ts` | **New** — KPIs, masking, defaults helpers |
| `src/components/settings/settings-panel-card.tsx` | **New** — premium section shell |
| `src/components/settings/settings-detail-list.tsx` | **New** — key/value rows |
| `src/components/settings/settings-safety-checklist.tsx` | **New** — privacy checklist |
| `src/components/clients/client-form.tsx` | `SettingsPanelCard` + AF token textarea |
| `src/components/bank-accounts/bank-account-form.tsx` | `SettingsPanelCard` + AF tokens; removed unused import |

**Not changed:** `src/lib/data/settings.ts`, `src/lib/data/clients.ts`, `src/lib/data/bank-accounts.ts`, server actions, validation, other app routes.

## Settings sections updated

1. **Page header** — Finance defaults, clients, bank accounts, preferences.
2. **Data source** — `DataSourceNote` in bordered card.
3. **KPI row (5)** — Data Source, Active Clients, Active Accounts, Exchange Rate, Primary Invoice Account.
4. **Data Connection** — Source, database, mode, mutations, last check (no secrets).
5. **Business Defaults** — Currency, FX, billing, dummy-safe emails.
6. **Clients** — Overview table with Manage / Add actions.
7. **Bank Accounts** — Overview table with masked IDs and primary flag.
8. **Invoice & Payment Defaults** — Collection account, proof/rebillable indicators (visual only).
9. **App Preferences** — Visual placeholders (not persisted).
10. **Safety & Privacy** — Green-check checklist.

## Client / bank settings styling updates

- List pages use `SettingsPanelCard`, `SoftStatusBadge`, `dataTableRowClassName`, bordered `DataSourceNote`.
- Forms use `SettingsPanelCard` instead of `FormSection`; select/textarea AF tokens.
- Edit pages use `PageAlert` and presentation-only header descriptions.

## Design-system components used

| Component | Usage |
|-----------|--------|
| `PremiumKpiCard` | Five summary metrics |
| `SoftStatusBadge` | Client/bank status, primary account |
| `DataTable` shell | Clients and bank overview tables |

## Privacy / dummy display approach

- **Clients overview:** Client Alpha/Beta/Gamma, CL-### codes, generic contacts.
- **Banks overview:** Collection/Operations/Payroll/Reserve accounts, Payment Institution A–D, masked IDs only.
- **Emails in defaults:** finance@example.com, founder@example.com.
- **Data Connection:** No Supabase URL, API keys, or project IDs.
- **Edit forms:** Still bind to stored values for real CRUD when connected.

## What was intentionally not changed

- Backend, Supabase, CRUD, validation, server actions
- Dashboard, Invoices, Payments, Expenses, Salaries, Team, Tasks, Reports
- No subscriptions, documents, monthly closing, uploads, CSV/PDF, or automation routes
- `getLatestExchangeRate`, `getActiveClients`, `getActiveBankAccounts` data logic

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | **Passed** (exit 0) |
| `npm run build` | **Passed** (exit 0) |

## Next recommended phase

**Final UI polish and regression** — Cross-page visual QA, any remaining `SectionCard`/`StatCard` cleanup outside settings, and full lint/build pass on all modules.
