import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

/**
 * Browser Supabase client for Client Components.
 * Throws only when called without URL + anon key (use `hasSupabaseEnv()` first to avoid that).
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}
