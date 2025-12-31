'use client'

import { useAIProviderSettings } from '@/hooks/queries/ai-provider-settings'

/**
 * Component that loads AI provider settings into the store.
 * Should be rendered in the workspace layout to ensure settings are loaded.
 */
export function AIProviderSettingsLoader() {
  // This hook fetches settings and syncs them to the store
  useAIProviderSettings()
  return null
}
