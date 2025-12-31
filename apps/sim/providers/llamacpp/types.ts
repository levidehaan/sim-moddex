/**
 * llama.cpp server model information
 */
export interface LlamaCppModelInfo {
  id: string
  object?: string
  created?: number
  owned_by?: string
}

/**
 * Response from llama.cpp /v1/models endpoint
 */
export interface LlamaCppModelsResponse {
  object: 'list'
  data: LlamaCppModelInfo[]
}
