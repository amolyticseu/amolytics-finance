"use client"

import { format } from "date-fns"
import { Bell, Calendar, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  const today = new Date()

  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 md:text-base">
            Founder finance overview and action center
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[#E2E8F0] bg-white text-slate-700 shadow-sm"
          >
            <Calendar className="size-4" aria-hidden />
            Last 30 days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[#E2E8F0] bg-white text-slate-700 shadow-sm"
          >
            <Download className="size-4" aria-hidden />
            Export
          </Button>
          <time
            dateTime={format(today, "yyyy-MM-dd")}
            className="hidden text-sm tabular-nums text-slate-500 sm:inline"
          >
            {format(today, "MMM d, yyyy")}
          </time>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="border-[#E2E8F0] bg-white shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="size-4 text-slate-600" />
          </Button>
          <div
            className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
            aria-hidden
          >
            AF
          </div>
        </div>
      </div>
      <div className="relative max-w-3xl">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search invoices, payments, tasks…"
          className="h-10 border-[#E2E8F0] bg-white pl-9 shadow-sm"
          aria-label="Search invoices, payments, tasks"
        />
      </div>
    </header>
  )
}
