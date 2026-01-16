export type FREDOperation =
  | 'observations'
  | 'series'
  | 'search'
  | 'category'
  | 'category_series'
  | 'releases'
  | 'release_dates'

export interface FREDToolParams {
  operation: FREDOperation
  apiKey: string
  seriesId?: string
  searchText?: string
  categoryId?: string
  releaseId?: string
  startDate?: string
  endDate?: string
  frequency?: string
  units?: string
  limit?: number
  sortOrder?: 'asc' | 'desc'
}

export interface FREDObservation {
  realtime_start: string
  realtime_end: string
  date: string
  value: string
}

export interface FREDSeries {
  id: string
  realtime_start: string
  realtime_end: string
  title: string
  observation_start: string
  observation_end: string
  frequency: string
  frequency_short: string
  units: string
  units_short: string
  seasonal_adjustment: string
  seasonal_adjustment_short: string
  last_updated: string
  popularity: number
  notes: string
}

export interface FREDCategory {
  id: number
  name: string
  parent_id: number
}

export interface FREDRelease {
  id: number
  realtime_start: string
  realtime_end: string
  name: string
  press_release: boolean
  link: string
  notes: string
}

export interface FREDReleaseDate {
  release_id: number
  release_name: string
  date: string
}

export interface FREDToolResponse {
  success: boolean
  output: {
    observations?: FREDObservation[]
    series?: FREDSeries
    searchResults?: FREDSeries[]
    category?: FREDCategory
    categorySeries?: FREDSeries[]
    releases?: FREDRelease[]
    releaseDates?: FREDReleaseDate[]
    count?: number
    error?: string
  }
}
