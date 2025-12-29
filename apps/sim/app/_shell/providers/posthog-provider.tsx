'use client'

/**
 * PostHog Analytics Provider
 * Disabled by default - analytics are removed for privacy
 * This provider now simply passes through children without any tracking
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
