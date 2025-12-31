export type ProviderName = 'llamacpp' | 'vllm' | 'openrouter' | 'base'

export interface OpenRouterModelInfo {
  id: string
  name?: string
  description?: string
  contextLength?: number
  modality?: string
  isModerated?: boolean
  supportsStructuredOutputs?: boolean
  supportsTools?: boolean
  pricing?: {
    input: number
    output: number
  }
}

export interface ProviderState {
  models: string[]
  isLoading: boolean
}

export interface ProvidersStore {
  providers: Record<ProviderName, ProviderState>
  openRouterModelInfo: Record<string, OpenRouterModelInfo>
  setProviderModels: (provider: ProviderName, models: string[]) => void
  setProviderLoading: (provider: ProviderName, isLoading: boolean) => void
  setOpenRouterModelInfo: (modelInfo: Record<string, OpenRouterModelInfo>) => void
  getProvider: (provider: ProviderName) => ProviderState
  getOpenRouterModelInfo: (modelId: string) => OpenRouterModelInfo | undefined
}
