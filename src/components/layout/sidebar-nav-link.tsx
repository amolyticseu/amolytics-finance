"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { AppNavItem } from "@/lib/navigation"
import { cn } from "@/lib/utils"

type SidebarNavLinkProps = {
  item: AppNavItem
}

export function SidebarNavLink({ item }: SidebarNavLinkProps) {
  const pathname = usePathname()
  const Icon = item.icon

  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
      {item.title}
    </Link>
  )
}
