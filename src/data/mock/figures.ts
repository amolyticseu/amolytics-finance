import {
  CLIENT_LABEL,
  HOURLY_RATE_EUR,
  inrToEur,
  MALTA_FIXED_MONTHLY_EUR,
  MONTHLY_EMI_INR_TOTAL,
  WORKSPACE_RECOVERY_PENDING_EUR,
} from "./constants"

/** Central mock figures for dashboard stats (Phase 1). */
export const mockMonthlyRevenueEur = 2_985

const emiEur = inrToEur(MONTHLY_EMI_INR_TOTAL)
const subscriptionsMiscEur = 118.5

export const mockMonthlyExpensesEur =
  emiEur + MALTA_FIXED_MONTHLY_EUR + subscriptionsMiscEur

export const mockEstimatedProfitEur =
  mockMonthlyRevenueEur - mockMonthlyExpensesEur

export const mockPendingInvoices = {
  count: 2,
  totalEur: 9_240,
  client: CLIENT_LABEL,
}

export const mockPendingSalaries = {
  runsPending: 3,
  totalInr: 482_400,
  periodLabel: "May 2026 · Batch B",
}

export const mockComplianceUpcoming = {
  dueWithinDays: 14,
  count: 4,
}

export const mockDashboardContext = {
  client: CLIENT_LABEL,
  hourlyRate: HOURLY_RATE_EUR,
  workspaceRecoveryPendingEur: WORKSPACE_RECOVERY_PENDING_EUR,
  emiBreakdownEur: emiEur,
  maltaFixedEur: MALTA_FIXED_MONTHLY_EUR,
  subscriptionsMiscEur,
}
