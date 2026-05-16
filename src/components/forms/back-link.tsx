import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BackLinkProps = {
  href: string
  label: string
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
    >
      ← {label}
    </Link>
  )
}
