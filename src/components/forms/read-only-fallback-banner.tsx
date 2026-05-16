type ReadOnlyFallbackBannerProps = {
  /** Plural entity label, e.g. "invoices", "team members". */
  entityLabel: string
}

export function ReadOnlyFallbackBanner({
  entityLabel,
}: ReadOnlyFallbackBannerProps) {
  return (
    <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      Supabase is not configured or this session is in fallback mode. You can
      view built-in sample {entityLabel} only — create and edit require a
      Supabase connection. Fallback rows are read-only.
    </p>
  )
}
