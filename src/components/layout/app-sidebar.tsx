"use client"

import Link from "next/link"

import { appNavItems } from "@/lib/navigation"
import { cn } from "@/lib/utils"

import { SidebarNavLink } from "./sidebar-nav-link"

type AppSidebarProps = {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          className="font-heading text-sm font-semibold tracking-tight text-sidebar-foreground transition-opacity hover:opacity-80"
        >
          Amolytics Finance
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Main">
        {appNavItems.map((item) => (
          <SidebarNavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <p className="px-2 text-xs text-muted-foreground">
          BMF · €15/hr · T01–T03
        </p>
      </div>
    </aside>
  )
}
