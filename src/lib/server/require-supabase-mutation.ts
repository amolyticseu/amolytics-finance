import { failure, type ActionFailure } from "@/lib/forms/action-result"
import { hasSupabaseEnv } from "@/lib/supabase/env"

/**
 * Guard for write server actions. Read-only fallback layers stay unchanged.
 */
export function requireSupabaseForMutation(): ActionFailure | null {
  if (!hasSupabaseEnv()) {
    return failure(
      "Saving requires Supabase (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). Read-only fallback data is still shown elsewhere."
    )
  }
  return null
}

export function isFallbackEntityId(id: string): boolean {
  return id.startsWith("local-fallback-")
}
