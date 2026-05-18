"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { InternalFinanceCard } from "@/components/layout/internal-finance-card"
import { SidebarBrand } from "@/components/layout/sidebar-brand"
import { shellNavLinkClass } from "@/components/layout/shell-nav-styles"
import { appNavItems } from "@/lib/navigation"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="border-af-border bg-af-surface shadow-none"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon className="size-4" aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[min(100vw,var(--af-sidebar-width))] max-w-[20rem] flex-col border-af-border bg-af-surface p-0 sm:w-[var(--af-sidebar-width)]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarBrand onNavigate={close} className="border-b border-af-border" />
        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
          aria-label="Mobile main"
        >
          {appNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={shellNavLinkClass(isActive)}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-af-border p-4">
          <InternalFinanceCard compact />
          <p className="text-xs text-af-text-muted">BMF · €15/hr · T01–T03</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
