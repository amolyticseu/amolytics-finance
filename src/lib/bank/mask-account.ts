/**
 * Normalize user input into a display-safe masked account / IBAN fragment.
 * Never persist full account numbers from this helper's output when input was unmasked.
 */
export function maskSensitiveAccountIdentifier(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""

  if (/[*xX•]/.test(trimmed)) {
    return trimmed.replace(/\s+/g, " ")
  }

  const compact = trimmed.replace(/\s/g, "")
  if (compact.length <= 4) return compact

  const last4 = compact.slice(-4)
  return `****${last4}`
}

/** True when value looks like a full unmasked identifier (reject or mask before save). */
export function looksLikeFullAccountNumber(value: string): boolean {
  const compact = value.replace(/\s/g, "")
  if (compact.length < 12) return false
  if (/[*xX•]/.test(value)) return false
  return /^[A-Za-z0-9]+$/.test(compact)
}
