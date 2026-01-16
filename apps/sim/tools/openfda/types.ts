export type OpenFDAOperation =
  | 'drug_event'
  | 'drug_label'
  | 'drug_enforcement'
  | 'drug_ndc'
  | 'device_event'
  | 'device_recall'
  | 'device_510k'
  | 'food_enforcement'
  | 'food_event'

export interface OpenFDAToolParams {
  operation: OpenFDAOperation
  apiKey?: string
  search?: string
  drugName?: string
  manufacturer?: string
  reactionType?: string
  recallClass?: string
  limit?: number
  skip?: number
  count?: string
}

export interface OpenFDAMeta {
  disclaimer: string
  terms: string
  license: string
  last_updated: string
  results: {
    skip: number
    limit: number
    total: number
  }
}

export interface OpenFDACountResult {
  term: string
  count: number
}

export interface OpenFDAToolResponse {
  success: boolean
  output: {
    results?: unknown[]
    meta?: OpenFDAMeta
    total?: number
    counts?: OpenFDACountResult[]
    error?: string
  }
}
