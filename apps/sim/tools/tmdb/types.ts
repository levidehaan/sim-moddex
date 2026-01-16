export interface TMDBToolParams {
  operation: string
  apiKey: string
  query?: string
  movieId?: string
  tvId?: string
  personId?: string
  mediaType?: string
  timeWindow?: string
  page?: number
}

export interface TMDBToolResponse {
  success: boolean
  output: {
    results?: any[]
    details?: any
    page?: number
    total_pages?: number
    total_results?: number
    error?: string
  }
}
