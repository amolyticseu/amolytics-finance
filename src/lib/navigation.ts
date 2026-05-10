import type { LucideIcon } from "lucide-react"
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  PieChart,
  Receipt,
  Settings,
  Users,
  IndianRupee,
  ListTodo,
} from "lucide-react"

export type AppNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const appNavItems: AppNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Invoices", href: "/invoices", icon: FileText },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Team", href: "/team", icon: Users },
  { title: "Salaries", href: "/salaries", icon: IndianRupee },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Tasks", href: "/tasks", icon: ListTodo },
  { title: "Reports", href: "/reports", icon: PieChart },
  { title: "Settings", href: "/settings", icon: Settings },
]
