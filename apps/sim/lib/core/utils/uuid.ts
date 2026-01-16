/**
 * Generates a UUID v4.
 * Uses crypto.randomUUID if available (secure contexts),
 * otherwise falls back to a math-based implementation.
 */
export function generateUUID(): string {
  // Use native crypto API if available (only in secure contexts like HTTPS or localhost)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback for insecure contexts (HTTP over IP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
