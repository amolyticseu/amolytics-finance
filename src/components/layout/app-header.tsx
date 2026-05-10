import { format } from "date-fns"

import { MobileNav } from "@/components/layout/mobile-nav"
import { CLIENT_LABEL, INR_PER_EUR } from "@/data/mock/constants"

export function AppHeader() {
  const today = new Date()

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="lg:hidden">
          <MobileNav />
        </div>
        <div className="hidden h-6 w-px bg-border lg:block" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Operations
          </p>
          <p className="truncate font-heading text-sm font-semibold tracking-tight text-foreground">
            {CLIENT_LABEL} · ₹{INR_PER_EUR}/€
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <time
          dateTime={today.toISOString()}
          className="hidden text-sm tabular-nums text-muted-foreground sm:block"
        >
          {format(today, "EEE d MMM yyyy")}
        </time>
      </div>
    </header>
  )
}
