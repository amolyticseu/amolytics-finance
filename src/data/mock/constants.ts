/** Primary billing client */
export const CLIENT_LABEL = "8BMF8 / BMF"

export const HOURLY_RATE_EUR = 15

/** Spot reference for planning (mock). */
export const INR_PER_EUR = 90

export const MONTHLY_EMI_INR_TOTAL = 69_598

export const MALTA_FIXED_MONTHLY_EUR = 625

export const WORKSPACE_RECOVERY_PENDING_EUR = 163.08

export const REVENUE_TYPICAL_LOW_EUR = 2_850
export const REVENUE_TYPICAL_HIGH_EUR = 3_120

export function inrToEur(inr: number): number {
  return inr / INR_PER_EUR
}
