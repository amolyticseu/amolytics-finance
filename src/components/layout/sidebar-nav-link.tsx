"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { AppNavItem } from "@/lib/navigation"

import { shellNavLinkClass } from "./shell-nav-styles"

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
    <Link href={item.href} className={shellNavLinkClass(isActive)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {item.title}
    </Link>
  )
}
