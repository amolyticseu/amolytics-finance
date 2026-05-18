import { inrToEur } from "@/data/mock/constants"
import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"
import type { TeamMemberRow } from "@/lib/supabase/types"

const DUMMY_MEMBERS = [
  "Team Member 01",
  "Team Member 02",
  "Team Member 03",
  "Team Member 04",
  "Team Member 05",
] as const

const COMPOSITION_BUCKETS = [
  "Developers",
  "Design",
  "QA",
  "Operations",
  "Support",
] as const

const BUCKET_FILLS: Record<(typeof COMPOSITION_BUCKETS)[number], string> = {
  Developers: "var(--af-primary-blue)",
  Design: "var(--af-purple)",
  QA: "var(--af-secondary-teal)",
  Operations: "var(--af-warning)",
  Support: "var(--af-success)",
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

export function roleBucket(role: string | null): (typeof COMPOSITION_BUCKETS)[number] {
  const r = (role ?? "").toLowerCase()
  if (
    r.includes("dev") ||
    r.includes("engineer") ||
    r.includes("backend") ||
    r.includes("frontend")
  ) {
    return "Developers"
  }
  if (r.includes("design") || r.includes("ui")) return "Design"
  if (r.includes("qa") || r.includes("test")) return "QA"
  if (r.includes("support") || r.includes("success")) return "Support"
  return "Operations"
}

export function displayMemberLabel(row: TeamMemberRow): string {
  return DUMMY_MEMBERS[hashId(row.id) % DUMMY_MEMBERS.length]
}

export function memberInitials(row: TeamMemberRow): string {
  const n = (hashId(row.id) % 9) + 1
  return `T${n}`
}

export function displayRoleLabel(row: TeamMemberRow): string {
  return `${roleBucket(row.role)} Staff`
}

export function displayBankInfo(row: TeamMemberRow): {
  label: string
  token: SoftStatusToken
} {
  if (row.bank_account_masked?.trim()) {
    return { label: "Masked", token: "masked" }
  }
  if (row.bank_name?.trim()) {
    return { label: "Payroll Account", token: "secondary" }
  }
  return { label: "Missing", token: "missing" }
}

export function salaryToEur(row: TeamMemberRow): number {
  if (row.base_salary == null) return 0
  if (row.currency === "EUR") return row.base_salary
  if (row.currency === "INR") return inrToEur(row.base_salary)
  return row.base_salary
}

export function profileChecks(row: TeamMemberRow) {
  return {
    roleAssigned: Boolean(row.role?.trim()),
    bankInfoMasked: Boolean(row.bank_account_masked?.trim() || row.bank_name?.trim()),
    salaryConfigured: row.base_salary != null && row.base_salary > 0,
    notesComplete: Boolean(row.notes?.trim()),
    activeStatusReviewed: true,
  }
}

export function profilePercent(row: TeamMemberRow): number {
  const c = profileChecks(row)
  const done = [
    c.roleAssigned,
    c.bankInfoMasked,
    c.salaryConfigured,
    c.notesComplete,
    c.activeStatusReviewed,
  ].filter(Boolean).length
  return Math.round((done / 5) * 100)
}

export function isProfileComplete(row: TeamMemberRow): boolean {
  return profilePercent(row) === 100
}

export function isPayrollReady(row: TeamMemberRow): boolean {
  return (
    row.active &&
    isProfileComplete(row) &&
    Boolean(row.bank_account_masked?.trim() || row.bank_name?.trim()) &&
    row.base_salary != null
  )
}

export function displayLastPayout(row: TeamMemberRow): string {
  if (!row.active) return "—"
  if (row.base_salary == null) return "—"
  const h = hashId(row.id)
  if (h % 4 === 0) return "Pending"
  const day = String(8 + (h % 20)).padStart(2, "0")
  return `2026-05-${day}`
}

export type TeamKpiSummary = {
  activeCount: number
  inactiveCount: number
  monthlyPayrollEur: number
  missingDetailsCount: number
  profileCompletionPercent: number
}

export function buildTeamKpis(rows: TeamMemberRow[]): TeamKpiSummary {
  const active = rows.filter((r) => r.active)
  const inactive = rows.filter((r) => !r.active)
  const monthlyPayrollEur = active.reduce((s, r) => s + salaryToEur(r), 0)
  const missingDetailsCount = rows.filter(
    (r) =>
      !r.role?.trim() ||
      (!r.bank_account_masked?.trim() && !r.bank_name?.trim()) ||
      r.base_salary == null
  ).length
  const profileCompletionPercent =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + profilePercent(r), 0) / rows.length)

  return {
    activeCount: active.length,
    inactiveCount: inactive.length,
    monthlyPayrollEur,
    missingDetailsCount,
    profileCompletionPercent,
  }
}

export type CompositionSlice = {
  name: (typeof COMPOSITION_BUCKETS)[number]
  value: number
  fill: string
}

export function buildTeamComposition(rows: TeamMemberRow[]): CompositionSlice[] {
  const active = rows.filter((r) => r.active)
  const counts = new Map<(typeof COMPOSITION_BUCKETS)[number], number>()

  for (const bucket of COMPOSITION_BUCKETS) {
    counts.set(bucket, 0)
  }

  for (const row of active) {
    const bucket = roleBucket(row.role)
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
  }

  return COMPOSITION_BUCKETS.map((name) => ({
    name,
    value: counts.get(name) ?? 0,
    fill: BUCKET_FILLS[name],
  }))
}

export type ProfileHealthSlice = {
  name: string
  value: number
  fill: string
}

export function buildProfileHealth(rows: TeamMemberRow[]): ProfileHealthSlice[] {
  const complete = rows.filter(isProfileComplete).length
  const missingBank = rows.filter(
    (r) => !r.bank_account_masked?.trim() && !r.bank_name?.trim()
  ).length
  const missingRole = rows.filter((r) => !r.role?.trim()).length
  const inactiveReview = rows.filter((r) => !r.active).length

  return [
    { name: "Complete", value: complete, fill: "var(--af-success)" },
    { name: "Missing Bank Info", value: missingBank, fill: "var(--af-warning)" },
    { name: "Missing Role", value: missingRole, fill: "var(--af-danger)" },
    { name: "Inactive Review", value: inactiveReview, fill: "var(--af-text-muted)" },
  ].filter((s) => s.value > 0 || s.name === "Complete")
}

export function buildTeamReadinessItems(rows: TeamMemberRow[]): FocusPanelItem[] {
  const missingBank = rows.filter(
    (r) => r.active && !r.bank_account_masked?.trim() && !r.bank_name?.trim()
  ).length
  const inactiveReview = rows.filter((r) => !r.active).length
  const pendingRole = rows.filter((r) => !r.role?.trim()).length
  const salaryReview = rows.filter(
    (r) => r.active && (r.base_salary == null || r.base_salary <= 0)
  ).length

  return [
    {
      title: "Missing Bank Info",
      subtitle: "Active without bank details",
      value: missingBank,
      tone: "red",
    },
    {
      title: "Inactive Review",
      subtitle: "Deactivated members",
      value: inactiveReview,
      tone: "gray",
    },
    {
      title: "Pending Role Update",
      subtitle: "Role not assigned",
      value: pendingRole,
      tone: "amber",
    },
    {
      title: "Salary Review Needed",
      subtitle: "Missing base salary",
      value: salaryReview,
      tone: "amber",
    },
  ]
}

export type ProfileChecklistItem = {
  label: string
  percent: number
}

export function buildProfileChecklist(rows: TeamMemberRow[]): ProfileChecklistItem[] {
  if (rows.length === 0) {
    return [
      { label: "Role Assigned", percent: 0 },
      { label: "Bank Info Masked", percent: 0 },
      { label: "Salary Configured", percent: 0 },
      { label: "Notes Complete", percent: 0 },
      { label: "Active Status Reviewed", percent: 0 },
    ]
  }

  const totals = rows.reduce(
    (acc, row) => {
      const c = profileChecks(row)
      if (c.roleAssigned) acc.roleAssigned += 1
      if (c.bankInfoMasked) acc.bankInfoMasked += 1
      if (c.salaryConfigured) acc.salaryConfigured += 1
      if (c.notesComplete) acc.notesComplete += 1
      if (c.activeStatusReviewed) acc.activeStatusReviewed += 1
      return acc
    },
    {
      roleAssigned: 0,
      bankInfoMasked: 0,
      salaryConfigured: 0,
      notesComplete: 0,
      activeStatusReviewed: 0,
    }
  )

  const pct = (n: number) => Math.round((n / rows.length) * 100)

  return [
    { label: "Role Assigned", percent: pct(totals.roleAssigned) },
    { label: "Bank Info Masked", percent: pct(totals.bankInfoMasked) },
    { label: "Salary Configured", percent: pct(totals.salaryConfigured) },
    { label: "Notes Complete", percent: pct(totals.notesComplete) },
    { label: "Active Status Reviewed", percent: pct(totals.activeStatusReviewed) },
  ]
}

export type PayrollReadinessRow = {
  label: string
  count: number
  tone: "green" | "amber" | "red" | "gray"
}

export function buildPayrollReadiness(rows: TeamMemberRow[]): PayrollReadinessRow[] {
  const ready = rows.filter(isPayrollReady).length
  const needsReview = rows.filter(
    (r) => r.active && !isPayrollReady(r) && profilePercent(r) >= 40
  ).length
  const missingBank = rows.filter(
    (r) => r.active && !r.bank_account_masked?.trim() && !r.bank_name?.trim()
  ).length
  const inactive = rows.filter((r) => !r.active).length

  return [
    { label: "Ready for Payroll", count: ready, tone: "green" },
    { label: "Needs Review", count: needsReview, tone: "amber" },
    { label: "Missing Bank Info", count: missingBank, tone: "red" },
    { label: "Inactive Members", count: inactive, tone: "gray" },
  ]
}

export function buildTeamLifecycleStages(rows: TeamMemberRow[]): LifecyclePipelineStage[] {
  const added = rows.length
  const profileComplete = rows.filter(isProfileComplete).length
  const payrollReady = rows.filter(isPayrollReady).length
  const active = rows.filter((r) => r.active).length
  const inactive = rows.filter((r) => !r.active).length

  return [
    { label: "Added", count: added, tone: "gray" },
    { label: "Profile Complete", count: profileComplete, tone: "blue" },
    { label: "Payroll Ready", count: payrollReady, tone: "teal" },
    { label: "Active", count: active, tone: "green" },
    { label: "Inactive", count: inactive, tone: "purple" },
  ]
}

export function roleSoftToken(row: TeamMemberRow): SoftStatusToken {
  const bucket = roleBucket(row.role)
  const map: Record<(typeof COMPOSITION_BUCKETS)[number], SoftStatusToken> = {
    Developers: "primary",
    Design: "recurring",
    QA: "database",
    Operations: "pending",
    Support: "active",
  }
  return map[bucket]
}
