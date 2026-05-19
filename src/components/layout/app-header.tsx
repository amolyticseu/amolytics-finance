"use client"

import { format } from "date-fns"
import { Calendar, Download, Search } from "lucide-react"

import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const today = new Date()

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[var(--af-header-height)] shrink-0 items-center gap-3 border-b border-af-border bg-af-surface px-4 md:gap-4 md:px-6"
      )}
    >
      <div className="flex shrink-0 items-center lg:hidden">
        <MobileNav />
      </div>

      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-af-text-muted"
          aria-hidden
        />
        <Input
          type="search"
          name="shell-search"
          placeholder="Search invoices, payments, tasks…"
          className="h-10 border-af-border bg-af-soft-gray/50 pl-9 shadow-none"
          aria-label="Search invoices, payments, tasks"
          autoComplete="off"
          title="Search preview — filtering not connected yet"
        />
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-af-border bg-af-surface text-af-text-secondary shadow-none"
          aria-label="Last 30 days (preview)"
          title="Date range preview — not connected yet"
        >
          <Calendar className="size-4" aria-hidden />
          <span className="hidden md:inline">Last 30 days</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-af-border bg-af-surface text-af-text-secondary shadow-none"
          aria-label="Export (preview)"
          title="Export preview — not connected yet"
        >
          <Download className="size-4" aria-hidden />
          <span className="hidden md:inline">Export</span>
        </Button>
        <time
          dateTime={format(today, "yyyy-MM-dd")}
          className="hidden text-sm tabular-nums text-af-text-secondary lg:inline"
        >
          {format(today, "MMM d, yyyy")}
        </time>
        <div
          className="flex size-9 items-center justify-center rounded-full bg-af-primary-blue text-xs font-semibold text-white"
          aria-hidden
        >
          AF
        </div>
      </div>

      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-af-primary-blue text-xs font-semibold text-white sm:hidden"
        aria-hidden
      >
        AF
      </div>
    </header>
  )
}
