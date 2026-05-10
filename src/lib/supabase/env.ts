/**
 * Supabase public env helpers. Safe at import time — no throws here.
 */

function trimEnv(value: string | undefined): string | undefined {
  const v = value?.trim()
  return v && v.length > 0 ? v : undefined
}

export function hasSupabaseEnv(): boolean {
  const url = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return Boolean(url && anonKey)
}

/**
 * Call only when creating a Supabase client. Throws if URL or anon key is missing.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example)."
    )
  }
  return { url, anonKey }
}
