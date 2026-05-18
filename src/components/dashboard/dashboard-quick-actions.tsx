import Link from "next/link"
import { CreditCard, FileText, ListTodo, Plus, Receipt } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { DashboardPanelCard } from "./dashboard-panel-card"

const actions = [
  { label: "Add Invoice", href: "/invoices/new", icon: FileText },
  { label: "Add Payment", href: "/payments/new", icon: CreditCard },
  { label: "Add Expense", href: "/expenses/new", icon: Receipt },
  { label: "Add Task", href: "/tasks/new", icon: ListTodo },
] as const

export function DashboardQuickActions() {
  return (
    <DashboardPanelCard title="Quick Actions">
      <ul className="grid gap-2">
        {actions.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 w-full justify-start gap-2 border-af-border bg-af-soft-gray/60 text-af-text-primary hover:bg-af-surface"
              )}
            >
              <Plus className="size-4 text-af-primary-blue" aria-hidden />
              <Icon className="size-4 opacity-60" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </DashboardPanelCard>
  )
}
