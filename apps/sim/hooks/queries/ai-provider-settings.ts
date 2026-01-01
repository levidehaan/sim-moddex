import { useEffect } from 'react'
import { createLogger } from '@sim/logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAIProviderSettingsStore } from '@/stores/settings/ai-providers/store'

const logger = createLogger('AIProviderSettingsQuery')

export const aiProviderSettingsKeys = {
  all: ['ai-provider-settings'] as const,
  settings: () => [...aiProviderSettingsKeys.all, 'settings'] as const,
}

interface AIProviderSettings {
  openrouter?: {
    apiKey?: string
    enabled?: boolean
  }
  llamacpp?: {
    baseUrl?: string
    apiKey?: string
    enabled?: boolean
  }
  vllm?: {
    baseUrl?: string
    apiKey?: string
    enabled?: boolean
  }
  defaultModel?: string
}

async function fetchAIProviderSettings(): Promise<AIProviderSettings> {
  const response = await fetch('/api/users/me/ai-providers')
  if (!response.ok) {
    throw new Error('Failed to fetch AI provider settings')
  }
  const { data } = await response.json()
  return data
}

async function updateAIProviderSettings(settings: AIProviderSettings): Promise<AIProviderSettings> {
  const response = await fetch('/api/users/me/ai-providers', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  if (!response.ok) {
    throw new Error('Failed to update AI provider settings')
  }
  const { data } = await response.json()
  return data
}

/**
 * Hook to fetch and sync AI provider settings with the store
 */
export function useAIProviderSettings() {
  const setSettings = useAIProviderSettingsStore((state) => state.setSettings)
  const setLoading = useAIProviderSettingsStore((state) => state.setLoading)
  const setLoaded = useAIProviderSettingsStore((state) => state.setLoaded)

  const query = useQuery({
    queryKey: aiProviderSettingsKeys.settings(),
    queryFn: fetchAIProviderSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Sync with store when data changes
  useEffect(() => {
    setLoading(query.isLoading)
  }, [query.isLoading, setLoading])

  useEffect(() => {
    if (query.data) {
      setSettings({
        openrouter: query.data.openrouter || { enabled: true },
        llamacpp: query.data.llamacpp || { enabled: false },
        vllm: query.data.vllm || { enabled: false },
        defaultModel: query.data.defaultModel || '',
      })
      setLoaded(true)
    }
  }, [query.data, setSettings, setLoaded])

  return query
}

/**
 * Hook to update AI provider settings
 */
export function useUpdateAIProviderSettings() {
  const queryClient = useQueryClient()
  const setSettings = useAIProviderSettingsStore((state) => state.setSettings)

  return useMutation({
    mutationFn: updateAIProviderSettings,
    onSuccess: (data) => {
      // Update the store
      setSettings({
        openrouter: data.openrouter || { enabled: true },
        llamacpp: data.llamacpp || { enabled: false },
        vllm: data.vllm || { enabled: false },
        defaultModel: data.defaultModel || '',
      })
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: aiProviderSettingsKeys.all })
      // Also invalidate provider models to refresh with new settings
      queryClient.invalidateQueries({ queryKey: ['provider-models'] })
    },
    onError: (error) => {
      logger.error('Failed to update AI provider settings', { error })
    },
  })
}

/**
 * Gets the current API key for a model (from store, not async)
 */
export function useApiKeyForModel(model: string): string | undefined {
  const openrouterKey = useAIProviderSettingsStore((state) => state.openrouter.apiKey)
  const llamacppKey = useAIProviderSettingsStore((state) => state.llamacpp.apiKey)
  const vllmKey = useAIProviderSettingsStore((state) => state.vllm.apiKey)

  if (model.startsWith('llamacpp/')) {
    return llamacppKey
  }
  if (model.startsWith('vllm/')) {
    return vllmKey
  }
  return openrouterKey
}

/**
 * Checks if a provider is configured for the model
 */
export function useIsProviderConfigured(model: string): boolean {
  const openrouter = useAIProviderSettingsStore((state) => state.openrouter)
  const llamacpp = useAIProviderSettingsStore((state) => state.llamacpp)
  const vllm = useAIProviderSettingsStore((state) => state.vllm)

  if (model.startsWith('llamacpp/')) {
    return !!(llamacpp.enabled && llamacpp.baseUrl)
  }
  if (model.startsWith('vllm/')) {
    return !!(vllm.enabled && vllm.baseUrl)
  }
  return !!(openrouter.enabled && openrouter.apiKey)
}

/**
 * Checks if any AI provider is configured
 */
export function useHasAnyProviderConfigured(): boolean {
  const openrouter = useAIProviderSettingsStore((state) => state.openrouter)
  const llamacpp = useAIProviderSettingsStore((state) => state.llamacpp)
  const vllm = useAIProviderSettingsStore((state) => state.vllm)

  return !!(
    (openrouter.enabled && openrouter.apiKey) ||
    (llamacpp.enabled && llamacpp.baseUrl) ||
    (vllm.enabled && vllm.baseUrl)
  )
}
