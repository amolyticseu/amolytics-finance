"use client"

import { appNavItems } from "@/lib/navigation"
import { cn } from "@/lib/utils"

import { InternalFinanceCard } from "./internal-finance-card"
import { SidebarBrand } from "./sidebar-brand"
import { SidebarNavLink } from "./sidebar-nav-link"

type AppSidebarProps = {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[var(--af-sidebar-width)] shrink-0 flex-col border-r border-af-border bg-af-surface text-af-text-primary",
        className
      )}
    >
      <SidebarBrand className="border-b border-af-border" />
      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
        aria-label="Main"
      >
        {appNavItems.map((item) => (
          <SidebarNavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="space-y-3 border-t border-af-border p-3">
        <InternalFinanceCard />
        <p className="px-2 text-[11px] text-af-text-muted">
          BMF · €15/hr · T01–T03
        </p>
      </div>
    </aside>
  )
}
