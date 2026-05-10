import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <AppSidebar className="hidden lg:flex" />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
