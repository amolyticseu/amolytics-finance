import { cn } from "@/lib/utils"

/** Shared accent tones for design-system components (Phase 2). */
export type DesignTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "teal"
  | "gray"

export const toneIconShell: Record<DesignTone, string> = {
  blue: "bg-af-soft-blue text-af-primary-blue",
  green: "bg-af-soft-green text-af-success",
  amber: "bg-af-soft-amber text-af-warning",
  red: "bg-af-soft-red text-af-danger",
  purple: "bg-af-soft-purple text-af-purple",
  teal: "bg-af-soft-teal text-af-secondary-teal",
  gray: "bg-af-soft-gray text-af-text-secondary",
}

export const toneRowSurface: Record<DesignTone, string> = {
  blue: "border-af-border/80 bg-af-soft-blue",
  green: "border-af-border/80 bg-af-soft-green",
  amber: "border-af-border/80 bg-af-soft-amber",
  red: "border-af-border/80 bg-af-soft-red",
  purple: "border-af-border/80 bg-af-soft-purple",
  teal: "border-af-border/80 bg-af-soft-teal",
  gray: "border-af-border/80 bg-af-soft-gray",
}

export const toneProgressFill: Record<DesignTone, string> = {
  blue: "bg-af-primary-blue",
  green: "bg-af-success",
  amber: "bg-af-warning",
  red: "bg-af-danger",
  purple: "bg-af-purple",
  teal: "bg-af-secondary-teal",
  gray: "bg-af-text-muted",
}

export const tonePipelineDot: Record<DesignTone, string> = {
  blue: "border-af-primary-blue bg-af-soft-blue text-af-primary-blue",
  green: "border-af-success bg-af-soft-green text-af-success",
  amber: "border-af-warning bg-af-soft-amber text-af-warning",
  red: "border-af-danger bg-af-soft-red text-af-danger",
  purple: "border-af-purple bg-af-soft-purple text-af-purple",
  teal: "border-af-secondary-teal bg-af-soft-teal text-af-secondary-teal",
  gray: "border-af-border bg-af-soft-gray text-af-text-secondary",
}

export const tonePipelineConnector: Record<DesignTone, string> = {
  blue: "bg-af-primary-blue/30",
  green: "bg-af-success/30",
  amber: "bg-af-warning/30",
  red: "bg-af-danger/30",
  purple: "bg-af-purple/30",
  teal: "bg-af-secondary-teal/30",
  gray: "bg-af-border",
}

/** Map 0–100 progress to tone when `tone` prop is omitted. */
export function progressToneFromValue(percent: number): DesignTone {
  if (percent >= 80) return "green"
  if (percent >= 70) return "blue"
  if (percent >= 40) return "amber"
  return "red"
}

export function toneClasses(
  map: Record<DesignTone, string>,
  tone: DesignTone,
  className?: string
) {
  return cn(map[tone], className)
}
