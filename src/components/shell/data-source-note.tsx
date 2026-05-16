type DataSourceNoteProps = {
  supabaseConfigured: boolean
  source: "database" | "fallback"
  sourceLabel: string
  canMutate?: boolean
  /** Full intro sentence on list pages; compact on settings sub-pages. */
  variant?: "full" | "compact"
}

export function DataSourceNote({
  supabaseConfigured,
  source,
  sourceLabel,
  canMutate = false,
  variant = "full",
}: DataSourceNoteProps) {
  const sourceText = source === "database" ? sourceLabel : "built-in fallback data"

  return (
    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
      {variant === "full" ? (
        <>
          Using database values when Supabase is configured; local fallback data
          is shown when the database is unavailable or empty.{" "}
        </>
      ) : null}
      <span className="text-foreground/80">
        Supabase: {supabaseConfigured ? "connected" : "not configured"} · Source:{" "}
        {sourceText}
        {!canMutate ? " · CRUD requires a Supabase connection" : ""}.
      </span>
    </p>
  )
}
