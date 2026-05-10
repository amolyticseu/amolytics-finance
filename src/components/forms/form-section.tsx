import type * as React from "react"

import { SectionCard } from "@/components/shell/section-card"

type FormSectionProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

/**
 * Full-page / section form grouping — same shell as read-only sections for visual consistency.
 */
export function FormSection(props: FormSectionProps) {
  return <SectionCard {...props} />
}
