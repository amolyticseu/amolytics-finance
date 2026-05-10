import { revalidatePath } from "next/cache"

/**
 * Paths to refresh after CRUD that affects summaries or lists.
 * Pass a narrower list from a specific action when only one area changes.
 */
export const DEFAULT_FINANCE_REVALIDATE_PATHS = [
  "/dashboard",
  "/settings",
  "/invoices",
  "/payments",
  "/salaries",
  "/expenses",
  "/tasks",
  "/reports",
] as const

export function revalidateFinancePaths(
  paths: readonly string[] = DEFAULT_FINANCE_REVALIDATE_PATHS
): void {
  for (const p of paths) {
    revalidatePath(p)
  }
}
