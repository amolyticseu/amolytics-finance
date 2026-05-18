import type { SoftStatusToken } from "@/components/design-system/soft-status-badge"
import type { FocusPanelItem } from "@/components/design-system/focus-panel"
import type { LifecyclePipelineStage } from "@/components/design-system/lifecycle-pipeline"
import type { TaskRow } from "@/lib/supabase/types"
import type { TaskCategoryDb, TaskDbStatus, TaskPriorityDb } from "@/types"

const DUMMY_TITLES = [
  "Review invoice set",
  "Follow up pending collection",
  "Update salary register",
  "Prepare compliance checklist",
  "Resolve bank mapping",
  "Reconcile payment proofs",
  "Verify expense receipts",
  "Complete monthly close pack",
] as const

const DUMMY_OWNERS = ["Finance", "Operations", "Founder", "Admin"] as const

const DUMMY_RECORDS = [
  "INV-ALPHA-001",
  "PAY-084",
  "SAL-052",
  "EXP-203",
  "COM-011",
  "BANK-002",
] as const

const CATEGORY_LABEL: Record<TaskCategoryDb, string> = {
  invoice: "Invoice",
  payment: "Payment",
  salary: "Salary",
  compliance: "Compliance",
  tax: "Tax",
  company: "Company",
  bank: "Bank",
  other: "Other",
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973
  }
  return h
}

function isOpen(status: TaskDbStatus): boolean {
  return status !== "done"
}

function parseDate(iso: string | null): Date | null {
  if (!iso?.trim()) return null
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  return Number.isNaN(d.getTime()) ? null : d
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function displayTaskTitle(row: TaskRow): string {
  return DUMMY_TITLES[hashId(row.id) % DUMMY_TITLES.length]
}

export function displayOwner(row: TaskRow): string {
  return DUMMY_OWNERS[hashId(row.id + "owner") % DUMMY_OWNERS.length]
}

export function displayCategoryLabel(row: TaskRow): string {
  return CATEGORY_LABEL[row.category] ?? "Other"
}

export function displayRelatedRecord(row: TaskRow): string {
  const t = row.related_entity_type?.toLowerCase() ?? row.category
  if (t.includes("invoice")) return "INV-ALPHA-001"
  if (t.includes("payment")) return "PAY-084"
  if (t.includes("salary")) return "SAL-052"
  if (t.includes("expense")) return "EXP-203"
  if (t.includes("bank")) return "BANK-002"
  if (t.includes("compliance") || t.includes("tax") || t.includes("company")) {
    return "COM-011"
  }
  return DUMMY_RECORDS[hashId(row.id + "rec") % DUMMY_RECORDS.length]
}

export function displayNotesPreview(row: TaskRow): string {
  if (row.notes?.trim() || row.description?.trim()) {
    return "Follow-up noted"
  }
  return "—"
}

export function displayDueDate(row: TaskRow): string {
  return row.due_date ?? "—"
}

export function categorySoftToken(row: TaskRow): SoftStatusToken {
  const map: Record<TaskCategoryDb, SoftStatusToken> = {
    invoice: "sent",
    payment: "paid",
    salary: "recurring",
    compliance: "database",
    tax: "pending",
    company: "secondary",
    bank: "masked",
    other: "draft",
  }
  return map[row.category] ?? "draft"
}

export function prioritySoftToken(priority: TaskPriorityDb): SoftStatusToken {
  const map: Record<TaskPriorityDb, SoftStatusToken> = {
    urgent: "urgent",
    high: "high",
    medium: "medium",
    low: "low",
  }
  return map[priority]
}

export function statusSoftToken(status: TaskDbStatus): SoftStatusToken {
  return status
}

export type TaskKpiSummary = {
  openCount: number
  dueThisWeekCount: number
  blockedCount: number
  completedThisMonthCount: number
  complianceReadinessPercent: number
}

export function buildTaskKpis(rows: TaskRow[]): TaskKpiSummary {
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const open = rows.filter((r) => isOpen(r.status))
  const dueThisWeek = open.filter((r) => {
    const due = parseDate(r.due_date)
    return due && due >= now && due <= weekEnd
  })
  const blocked = rows.filter((r) => r.status === "blocked")
  const completedThisMonth = rows.filter((r) => {
    if (r.status !== "done") return false
    const completed = parseDate(r.completed_at) ?? parseDate(r.due_date)
    return completed ? isSameMonth(completed, now) : false
  })

  const complianceRows = rows.filter((r) =>
    ["compliance", "tax", "company", "bank"].includes(r.category)
  )
  const complianceDone = complianceRows.filter((r) => r.status === "done").length
  const complianceReadinessPercent =
    complianceRows.length === 0
      ? 72
      : Math.round((complianceDone / complianceRows.length) * 100)

  return {
    openCount: open.length,
    dueThisWeekCount: dueThisWeek.length,
    blockedCount: blocked.length,
    completedThisMonthCount: completedThisMonth.length,
    complianceReadinessPercent,
  }
}

export type TaskWorkloadPoint = {
  period: string
  open: number
  completed: number
  blocked: number
}

export function buildTaskWorkloadSeries(rows: TaskRow[]): TaskWorkloadPoint[] {
  const now = new Date()
  const weeks: TaskWorkloadPoint[] = []

  for (let i = 4; i >= 0; i--) {
    const weekStart = startOfWeek(new Date(now))
    weekStart.setDate(weekStart.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const label = `W${5 - i}`
    let open = 0
    let completed = 0
    let blocked = 0

    for (const row of rows) {
      const created = parseDate(row.created_at)
      const due = parseDate(row.due_date)
      const anchor = created ?? due
      if (!anchor || anchor < weekStart || anchor > weekEnd) continue

      if (row.status === "done") completed += 1
      else if (row.status === "blocked") blocked += 1
      else open += 1
    }

    if (open + completed + blocked === 0 && i === 0) {
      const openRows = rows.filter((r) => isOpen(r.status))
      open = openRows.filter((r) => r.status !== "blocked").length
      blocked = rows.filter((r) => r.status === "blocked").length
      completed = rows.filter((r) => r.status === "done").length
    }

    weeks.push({ period: label, open, completed, blocked })
  }

  return weeks
}

export type TaskStatusSlice = {
  name: string
  value: number
  fill: string
  token: SoftStatusToken
}

export function buildTaskStatusMix(rows: TaskRow[]): TaskStatusSlice[] {
  const counts: Record<TaskDbStatus, number> = {
    todo: 0,
    in_progress: 0,
    done: 0,
    blocked: 0,
  }

  for (const row of rows) {
    counts[row.status] += 1
  }

  return [
    {
      name: "Todo",
      value: counts.todo,
      fill: "var(--af-text-muted)",
      token: "todo",
    },
    {
      name: "In Progress",
      value: counts.in_progress,
      fill: "var(--af-primary-blue)",
      token: "in_progress",
    },
    {
      name: "Done",
      value: counts.done,
      fill: "var(--af-success)",
      token: "done",
    },
    {
      name: "Blocked",
      value: counts.blocked,
      fill: "var(--af-danger)",
      token: "blocked",
    },
  ]
}

export function buildComplianceFocusItems(rows: TaskRow[]): FocusPanelItem[] {
  const tax = rows.filter(
    (r) => r.category === "tax" && isOpen(r.status)
  ).length
  const company = rows.filter(
    (r) => r.category === "company" && isOpen(r.status)
  ).length
  const bankKyc = rows.filter(
    (r) => r.category === "bank" && isOpen(r.status)
  ).length
  const proofGaps = rows.filter(
    (r) =>
      isOpen(r.status) &&
      (r.category === "invoice" || r.category === "payment") &&
      !r.related_entity_id?.trim()
  ).length

  return [
    {
      title: "Tax Follow-ups",
      subtitle: "Open tax-category tasks",
      value: tax,
      tone: "amber",
    },
    {
      title: "Company Records",
      subtitle: "Company filings and records",
      value: company,
      tone: "blue",
    },
    {
      title: "Bank/KYC Items",
      subtitle: "Banking and KYC checkpoints",
      value: bankKyc,
      tone: "red",
    },
    {
      title: "Proof Gaps",
      subtitle: "Invoice/payment without linked record",
      value: proofGaps,
      tone: "purple",
    },
  ]
}

export type MonthlyCloseItem = {
  label: string
  done: boolean
}

export type MonthlyCloseWidget = {
  completed: number
  total: number
  percent: number
  items: MonthlyCloseItem[]
}

export function buildMonthlyCloseWidget(): MonthlyCloseWidget {
  const items: MonthlyCloseItem[] = [
    { label: "Invoices reviewed", done: true },
    { label: "Payment proofs checked", done: true },
    { label: "Salary records verified", done: true },
    { label: "Expense receipts reviewed", done: true },
    { label: "Reports generated", done: true },
    { label: "Rebillables reviewed", done: true },
    { label: "Missing proofs resolved", done: false },
    { label: "Bank reconciliations reviewed", done: false },
    { label: "Compliance filings queued", done: false },
  ]
  const completed = items.filter((i) => i.done).length
  const total = items.length
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    items,
  }
}

export type PriorityBoardTask = {
  id: string
  title: string
  category: string
  categoryToken: SoftStatusToken
  dueDate: string
  status: TaskDbStatus
}

export function buildPriorityBoard(
  rows: TaskRow[],
  limitPerPriority = 2
): Record<TaskPriorityDb, PriorityBoardTask[]> {
  const buckets: Record<TaskPriorityDb, PriorityBoardTask[]> = {
    urgent: [],
    high: [],
    medium: [],
    low: [],
  }

  const open = rows.filter((r) => isOpen(r.status))
  const order: TaskPriorityDb[] = ["urgent", "high", "medium", "low"]

  for (const priority of order) {
    const matches = open
      .filter((r) => r.priority === priority)
      .slice(0, limitPerPriority)
    buckets[priority] = matches.map((r) => ({
      id: r.id,
      title: displayTaskTitle(r),
      category: displayCategoryLabel(r),
      categoryToken: categorySoftToken(r),
      dueDate: r.due_date ?? "—",
      status: r.status,
    }))
  }

  return buckets
}

export type ComplianceTimelineItem = {
  id: string
  label: string
  date: string
  tone: "done" | "upcoming"
}

export function buildComplianceTimeline(rows: TaskRow[]): ComplianceTimelineItem[] {
  const doneCount = rows.filter((r) => r.status === "done").length
  const base: ComplianceTimelineItem[] = [
    {
      id: "tl-1",
      label: "Monthly close pack drafted",
      date: "2026-05-10",
      tone: doneCount > 0 ? "done" : "upcoming",
    },
    {
      id: "tl-2",
      label: "Payment proof reconciliation",
      date: "2026-05-14",
      tone: doneCount > 2 ? "done" : "upcoming",
    },
    {
      id: "tl-3",
      label: "Payroll register sign-off",
      date: "2026-05-16",
      tone: doneCount > 3 ? "done" : "upcoming",
    },
    {
      id: "tl-4",
      label: "Compliance checklist review",
      date: "2026-05-20",
      tone: "upcoming",
    },
    {
      id: "tl-5",
      label: "Reports export checkpoint",
      date: "2026-05-24",
      tone: "upcoming",
    },
  ]
  return base
}

export function buildTaskLifecycleStages(rows: TaskRow[]): LifecyclePipelineStage[] {
  const created = rows.length
  const inProgress = rows.filter((r) => r.status === "in_progress").length
  const blocked = rows.filter((r) => r.status === "blocked").length
  const done = rows.filter((r) => r.status === "done").length
  const closed = rows.filter(
    (r) => r.status === "done" && Boolean(r.completed_at?.trim())
  ).length

  return [
    { label: "Created", count: created, tone: "gray" },
    { label: "In Progress", count: inProgress, tone: "blue" },
    { label: "Blocked", count: blocked, tone: "red" },
    { label: "Done", count: done, tone: "green" },
    { label: "Closed", count: closed, tone: "purple" },
  ]
}
