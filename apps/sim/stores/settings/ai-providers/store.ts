import { createLogger } from '@sim/logger'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const logger = createLogger('AIProviderSettingsStore')

export interface AIProviderConfig {
  apiKey?: string
  baseUrl?: string
  enabled?: boolean
}

export interface AIProviderSettingsState {
  openrouter: AIProviderConfig
  llamacpp: AIProviderConfig
  vllm: AIProviderConfig
  defaultModel: string
  isLoaded: boolean
  isLoading: boolean

  // Actions
  setSettings: (settings: Partial<AIProviderSettingsState>) => void
  setOpenRouter: (config: AIProviderConfig) => void
  setLlamaCpp: (config: AIProviderConfig) => void
  setVLLM: (config: AIProviderConfig) => void
  setDefaultModel: (model: string) => void
  setLoading: (isLoading: boolean) => void
  setLoaded: (isLoaded: boolean) => void

  // Getters
  getActiveProvider: () => 'openrouter' | 'llamacpp' | 'vllm' | null
  hasConfiguredProvider: () => boolean
  getApiKey: (provider: 'openrouter' | 'llamacpp' | 'vllm') => string | undefined
}

export const useAIProviderSettingsStore = create<AIProviderSettingsState>()(
  persist(
    (set, get) => ({
      openrouter: { enabled: true },
      llamacpp: { enabled: false },
      vllm: { enabled: false },
      defaultModel: '',
      isLoaded: false,
      isLoading: false,

      setSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
          isLoaded: true,
        }))
      },

      setOpenRouter: (config) => {
        set((state) => ({
          openrouter: { ...state.openrouter, ...config },
        }))
      },

      setLlamaCpp: (config) => {
        set((state) => ({
          llamacpp: { ...state.llamacpp, ...config },
        }))
      },

      setVLLM: (config) => {
        set((state) => ({
          vllm: { ...state.vllm, ...config },
        }))
      },

      setDefaultModel: (model) => {
        set({ defaultModel: model })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setLoaded: (isLoaded) => {
        set({ isLoaded })
      },

      getActiveProvider: () => {
        const state = get()
        if (state.openrouter.enabled && state.openrouter.apiKey) return 'openrouter'
        if (state.llamacpp.enabled && state.llamacpp.baseUrl) return 'llamacpp'
        if (state.vllm.enabled && state.vllm.baseUrl) return 'vllm'
        return null
      },

      hasConfiguredProvider: () => {
        const state = get()
        return !!(
          (state.openrouter.enabled && state.openrouter.apiKey) ||
          (state.llamacpp.enabled && state.llamacpp.baseUrl) ||
          (state.vllm.enabled && state.vllm.baseUrl)
        )
      },

      getApiKey: (provider) => {
        const state = get()
        return state[provider]?.apiKey
      },
    }),
    {
      name: 'ai-provider-settings',
      partialize: (state) => ({
        // Only persist non-sensitive data locally
        // API keys are fetched from server
        defaultModel: state.defaultModel,
      }),
    }
  )
)

/**
 * Gets the API key for a given model
 * Returns the appropriate API key based on the model prefix
 */
export function getApiKeyForModel(model: string): string | undefined {
  const state = useAIProviderSettingsStore.getState()

  if (model.startsWith('llamacpp/')) {
    return state.llamacpp.apiKey
  }
  if (model.startsWith('vllm/')) {
    return state.vllm.apiKey
  }
  // For OpenRouter models or any other model, use OpenRouter key
  return state.openrouter.apiKey
}

/**
 * Checks if a provider is configured for the given model
 */
export function isProviderConfiguredForModel(model: string): boolean {
  const state = useAIProviderSettingsStore.getState()

  if (model.startsWith('llamacpp/')) {
    return !!(state.llamacpp.enabled && state.llamacpp.baseUrl)
  }
  if (model.startsWith('vllm/')) {
    return !!(state.vllm.enabled && state.vllm.baseUrl)
  }
  // For OpenRouter models, check if OpenRouter is configured
  return !!(state.openrouter.enabled && state.openrouter.apiKey)
}

/**
 * Checks if any AI provider is configured
 */
export function hasAnyProviderConfigured(): boolean {
  return useAIProviderSettingsStore.getState().hasConfiguredProvider()
}
