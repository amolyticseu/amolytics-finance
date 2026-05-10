import type { FinanceStatus } from "@/types"

export const mockInvoices = [
  {
    id: "inv-104",
    period: "2026-05 · T03",
    issued: "2026-05-21",
    due: "2026-06-04",
    amountEur: 1_035,
    status: "sent" as FinanceStatus,
  },
  {
    id: "inv-103",
    period: "2026-05 · T02",
    issued: "2026-05-11",
    due: "2026-05-25",
    amountEur: 990,
    status: "paid" as FinanceStatus,
  },
  {
    id: "inv-102",
    period: "2026-05 · T01",
    issued: "2026-05-01",
    due: "2026-05-15",
    amountEur: 960,
    status: "paid" as FinanceStatus,
  },
  {
    id: "inv-101",
    period: "2026-04 · T03",
    issued: "2026-04-22",
    due: "2026-05-06",
    amountEur: 1_020,
    status: "overdue" as FinanceStatus,
  },
]

export const mockPayments = [
  {
    id: "pay-88",
    date: "2026-05-12",
    amountEur: 990,
    account: "Wise · EUR",
    reference: "BMF-T02-MAY",
    matchedInvoice: "inv-103",
    status: "completed" as FinanceStatus,
  },
  {
    id: "pay-87",
    date: "2026-05-03",
    amountEur: 960,
    account: "Revolut · EUR",
    reference: "INV-102",
    matchedInvoice: "inv-102",
    status: "completed" as FinanceStatus,
  },
  {
    id: "pay-86",
    date: "2026-05-18",
    amountEur: 4_200,
    account: "HSBC · EUR",
    reference: "POOL-Q2",
    matchedInvoice: "—",
    status: "pending" as FinanceStatus,
  },
]

export const mockTeam = [
  {
    id: "tm-01",
    name: "Arjun Mehta",
    role: "Senior engineer",
    location: "India",
    allocation: "BMF",
    status: "active" as FinanceStatus,
  },
  {
    id: "tm-02",
    name: "Neha Krishnan",
    role: "Engineer",
    location: "India",
    allocation: "BMF",
    status: "active" as FinanceStatus,
  },
  {
    id: "tm-03",
    name: "Vikram Singh",
    role: "Engineer",
    location: "India",
    allocation: "BMF + internal",
    status: "active" as FinanceStatus,
  },
  {
    id: "tm-04",
    name: "Elena Vassallo",
    role: "Ops & finance",
    location: "Malta",
    allocation: "Internal",
    status: "active" as FinanceStatus,
  },
]

/**
 * India bench fallback for Phase 2 read-only Team (aligned with `supabase/seed.sql`).
 * Used when Supabase is not configured, queries fail, or `team_members` has no active rows.
 */
export const mockTeamFallbackMembers = [
  { name: "Ganpat", role: "Engineer" },
  { name: "Kamal", role: "Engineer" },
  { name: "Vinod", role: "Engineer" },
  { name: "Vasudev", role: "Engineer" },
  { name: "Siddhatta", role: "Engineer" },
] as const

export const mockSalaryRuns = [
  {
    id: "sal-09",
    period: "May 2026 · B",
    payDate: "2026-05-28",
    headcount: 3,
    totalInr: 482_400,
    status: "scheduled" as FinanceStatus,
  },
  {
    id: "sal-08",
    period: "May 2026 · A",
    payDate: "2026-05-14",
    headcount: 3,
    totalInr: 478_900,
    status: "completed" as FinanceStatus,
  },
  {
    id: "sal-07",
    period: "Apr 2026 · B",
    payDate: "2026-04-28",
    headcount: 3,
    totalInr: 475_200,
    status: "completed" as FinanceStatus,
  },
]

export const mockExpenseLines = [
  {
    id: "exp-41",
    category: "Malta fixed",
    vendor: "Landlord / utilities bundle",
    month: "2026-05",
    amountEur: 625,
    status: "paid" as FinanceStatus,
  },
  {
    id: "exp-40",
    category: "EMI",
    vendor: "India loans (aggregate)",
    month: "2026-05",
    amountEur: 773.31,
    status: "scheduled" as FinanceStatus,
  },
  {
    id: "exp-39",
    category: "Subscription",
    vendor: "Cursor · GitHub · Cloud",
    month: "2026-05",
    amountEur: 118.5,
    status: "paid" as FinanceStatus,
  },
  {
    id: "exp-38",
    category: "Workspace recovery",
    vendor: "Client recharge pending",
    month: "2026-05",
    amountEur: 163.08,
    status: "pending" as FinanceStatus,
  },
  {
    id: "exp-37",
    category: "Compliance",
    vendor: "Registry / filings",
    month: "2026-05",
    amountEur: 190,
    status: "pending" as FinanceStatus,
  },
]

export const mockComplianceTasks = [
  {
    id: "tsk-12",
    title: "VAT return · MT",
    due: "2026-05-18",
    owner: "Elena",
    status: "in_progress" as FinanceStatus,
  },
  {
    id: "tsk-11",
    title: "Payroll register · IN",
    due: "2026-05-22",
    owner: "Elena",
    status: "open" as FinanceStatus,
  },
  {
    id: "tsk-10",
    title: "BMF timesheet sign-off",
    due: "2026-05-25",
    owner: "Arjun",
    status: "open" as FinanceStatus,
  },
  {
    id: "tsk-09",
    title: "Insurance renewal review",
    due: "2026-06-02",
    owner: "Elena",
    status: "open" as FinanceStatus,
  },
]

export const mockMonthlyPl = [
  { month: "Jan", revenue: 2920, expenses: 1460 },
  { month: "Feb", revenue: 3010, expenses: 1495 },
  { month: "Mar", revenue: 2880, expenses: 1510 },
  { month: "Apr", revenue: 3050, expenses: 1505 },
  { month: "May", revenue: 2985, expenses: 1517 },
]
