import Link from "next/link"

import { cn } from "@/lib/utils"

type SidebarBrandProps = {
  className?: string
  onNavigate?: () => void
}

export function SidebarBrand({ className, onNavigate }: SidebarBrandProps) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-4", className)}>
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-af-primary-blue text-base font-bold text-white"
        aria-hidden
      >
        A
      </div>
      <div className="min-w-0">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="block font-heading text-base font-bold leading-tight tracking-tight text-af-text-primary transition-opacity hover:opacity-80"
        >
          Amolytics Finance
        </Link>
        <p className="text-xs text-af-text-muted">Founder OS</p>
      </div>
    </div>
  )
}
