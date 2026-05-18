import { cn } from "@/lib/utils"

/** Shared desktop + mobile shell navigation link styles (Phase 3). */
export function shellNavLinkClass(isActive: boolean, className?: string) {
  return cn(
    "flex items-center gap-2.5 rounded-af-sidebar-active px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-af-primary-blue text-white shadow-af-nav-active [&_svg]:text-white [&_svg]:opacity-100"
      : "text-af-text-secondary hover:bg-af-soft-blue hover:text-af-text-primary [&_svg]:opacity-70",
    className
  )
}
