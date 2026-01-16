export interface CongressToolParams {
  operation: string
  apiKey: string
  congress?: string
  billNumber?: string
  memberId?: string
  committeeCode?: string
  query?: string
  chamber?: string
  state?: string
  limit?: number
  offset?: number
}

export interface CongressToolResponse {
  success: boolean
  output: {
    results?: any[]
    bill?: any
    member?: any
    committee?: any
    pagination?: {
      count: number
      next?: string
    }
    error?: string
  }
}
