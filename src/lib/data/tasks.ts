import { isFallbackEntityId } from "@/lib/server/require-supabase-mutation"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { TaskRow } from "@/lib/supabase/types"
import type { TaskCategoryDb, TaskDbStatus, TaskPriorityDb } from "@/types"

export type TaskDataSource = "database" | "fallback"

function warnFallback(context: string, err: unknown) {
  console.warn(
    `[amolytics-finance] ${context} — using fallback tasks.`,
    err instanceof Error ? err.message : err
  )
}

const CATEGORIES: readonly TaskCategoryDb[] = [
  "invoice",
  "payment",
  "salary",
  "compliance",
  "tax",
  "company",
  "bank",
  "other",
]

const STATUSES: readonly TaskDbStatus[] = [
  "todo",
  "in_progress",
  "done",
  "blocked",
]

const PRIORITIES: readonly TaskPriorityDb[] = [
  "low",
  "medium",
  "high",
  "urgent",
]

function normalizeCategory(value: unknown): TaskCategoryDb {
  const s = typeof value === "string" ? value : ""
  if (CATEGORIES.includes(s as TaskCategoryDb)) return s as TaskCategoryDb
  return "other"
}

function normalizeTaskStatus(value: unknown): TaskDbStatus {
  const s = typeof value === "string" ? value : ""
  if (STATUSES.includes(s as TaskDbStatus)) return s as TaskDbStatus
  return "todo"
}

function normalizePriority(value: unknown): TaskPriorityDb {
  const s = typeof value === "string" ? value : ""
  if (PRIORITIES.includes(s as TaskPriorityDb)) return s as TaskPriorityDb
  return "medium"
}

function normalizeTaskFromUnknown(raw: Record<string, unknown>): TaskRow {
  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : "",
    description:
      raw.description != null ? String(raw.description) : null,
    category: normalizeCategory(raw.category),
    status: normalizeTaskStatus(raw.status),
    priority: normalizePriority(raw.priority),
    due_date: raw.due_date != null ? String(raw.due_date) : null,
    completed_at:
      raw.completed_at != null ? String(raw.completed_at) : null,
    related_entity_type:
      raw.related_entity_type != null
        ? String(raw.related_entity_type)
        : null,
    related_entity_id:
      raw.related_entity_id != null ? String(raw.related_entity_id) : null,
    notes: raw.notes != null ? String(raw.notes) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

const PRIORITY_SORT: Record<TaskPriorityDb, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function isDone(status: TaskDbStatus): boolean {
  return status === "done"
}

/** Incomplete first; due_date ascending (nulls last); priority urgent→low; created_at desc. */
export function sortTaskRows(rows: TaskRow[]): TaskRow[] {
  return [...rows].sort((a, b) => {
    const da = isDone(a.status) ? 1 : 0
    const db = isDone(b.status) ? 1 : 0
    if (da !== db) return da - db

    const aDue = a.due_date ?? "9999-12-31"
    const bDue = b.due_date ?? "9999-12-31"
    const dueCmp = aDue.localeCompare(bDue)
    if (dueCmp !== 0) return dueCmp

    const pCmp = PRIORITY_SORT[a.priority] - PRIORITY_SORT[b.priority]
    if (pCmp !== 0) return pCmp

    return (b.created_at ?? "").localeCompare(a.created_at ?? "")
  })
}

function fallbackTaskList(): TaskRow[] {
  const now = new Date().toISOString()
  const rows: TaskRow[] = [
    {
      id: "local-fallback-task-opc-bank",
      title: "India OPC — current account opening & KYC follow-up",
      description:
        "Confirm ICICI (or chosen bank) documentation pack; track reference numbers.",
      category: "bank",
      status: "in_progress",
      priority: "high",
      due_date: "2026-05-20",
      completed_at: null,
      related_entity_type: null,
      related_entity_id: null,
      notes: "Align with seed bank_accounts placeholder row when live IDs exist.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-pan-mca",
      title: "PAN / TAN / MCA communications inbox sweep",
      description:
        "Verify statutory emails and portal notices; file acknowledgements.",
      category: "compliance",
      status: "todo",
      priority: "urgent",
      due_date: "2026-05-18",
      completed_at: null,
      related_entity_type: "company",
      related_entity_id: null,
      notes: "CA handoff — attach latest correspondence.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-malta-vat",
      title: "Malta VAT registration — exploration & advisor checkpoint",
      description:
        "Book short call; list prerequisites vs current Malta cost base.",
      category: "tax",
      status: "todo",
      priority: "medium",
      due_date: "2026-05-28",
      completed_at: null,
      related_entity_type: null,
      related_entity_id: null,
      notes: "Tie to Malta rent/utilities context when reporting matures.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-invoice-followup",
      title: "BMF invoice follow-up — overdue period alignment",
      description:
        "Reconcile sent vs paid for latest T02/T03; nudge if past due window.",
      category: "invoice",
      status: "todo",
      priority: "high",
      due_date: "2026-05-25",
      completed_at: null,
      related_entity_type: "invoice",
      related_entity_id: null,
      notes: "Link concrete invoice UUIDs when register is fully seeded.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-workspace-recovery",
      title: "Workspace recovery €163.08 — recharge to BMF",
      description:
        "Match expense line to next invoice or separate line item.",
      category: "company",
      status: "in_progress",
      priority: "medium",
      due_date: "2026-05-31",
      completed_at: null,
      related_entity_type: "expense",
      related_entity_id: null,
      notes: "Same theme as seed task — replace related_entity_id when stable.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-ca",
      title: "Accountant / CA — monthly close checklist",
      description: "Share payroll + EMI summary; confirm filing calendar.",
      category: "compliance",
      status: "todo",
      priority: "medium",
      due_date: "2026-05-22",
      completed_at: null,
      related_entity_type: null,
      related_entity_id: null,
      notes: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-payment-reminder",
      title: "Payment reminder — pool transfer reference POOL-Q2",
      description:
        "Confirm HSBC receipt allocation vs internal pool ledger.",
      category: "payment",
      status: "blocked",
      priority: "urgent",
      due_date: "2026-05-15",
      completed_at: null,
      related_entity_type: "payment",
      related_entity_id: null,
      notes: "Blocked until bank narrative matches expected references.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "local-fallback-task-payroll-register",
      title: "India payroll register — May 2026 sign-off",
      description: "Cross-check salary_payments vs team roster.",
      category: "salary",
      status: "done",
      priority: "low",
      due_date: "2026-05-14",
      completed_at: "2026-05-14T16:00:00.000Z",
      related_entity_type: null,
      related_entity_id: null,
      notes: "Illustrative completed row for sort order testing.",
      created_at: now,
      updated_at: now,
    },
  ]
  return sortTaskRows(rows)
}

export async function getTaskById(id: string): Promise<{
  row: TaskRow | null
  source: TaskDataSource
  canMutate: boolean
}> {
  if (isFallbackEntityId(id) || !hasSupabaseEnv()) {
    const fallback = fallbackTaskList().find((t) => t.id === id) ?? null
    return { row: fallback, source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      if (error) warnFallback("getTaskById", error)
      return { row: null, source: "fallback", canMutate: false }
    }

    return {
      row: normalizeTaskFromUnknown(data as Record<string, unknown>),
      source: "database",
      canMutate: true,
    }
  } catch (e) {
    warnFallback("getTaskById", e)
    return { row: null, source: "fallback", canMutate: false }
  }
}

export async function getTasks(): Promise<{
  rows: TaskRow[]
  source: TaskDataSource
  canMutate: boolean
}> {
  const canMutate = hasSupabaseEnv()

  if (!hasSupabaseEnv()) {
    return { rows: fallbackTaskList(), source: "fallback", canMutate: false }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("tasks").select("*")

    if (error) {
      warnFallback("getTasks", error)
      return { rows: fallbackTaskList(), source: "fallback", canMutate: false }
    }

    const rawRows = (data ?? []) as Record<string, unknown>[]
    if (rawRows.length === 0) {
      return { rows: fallbackTaskList(), source: "fallback", canMutate }
    }

    return {
      rows: sortTaskRows(rawRows.map(normalizeTaskFromUnknown)),
      source: "database",
      canMutate,
    }
  } catch (e) {
    warnFallback("getTasks", e)
    return { rows: fallbackTaskList(), source: "fallback", canMutate: false }
  }
}
