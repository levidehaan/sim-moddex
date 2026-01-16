/**
 * USGS Earthquake API Tool Types
 */

export type USGSEarthquakeOperation = 'query' | 'significant' | 'get_event' | 'count'

export interface USGSEarthquakeToolParams {
  operation: USGSEarthquakeOperation
  eventId?: string
  startTime?: string
  endTime?: string
  minMagnitude?: number
  maxMagnitude?: number
  latitude?: number
  longitude?: number
  maxRadiusKm?: number
  limit?: number
  orderBy?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc'
}

export interface USGSEarthquakeGeometry {
  type: 'Point'
  coordinates: [number, number, number] // [longitude, latitude, depth]
}

export interface USGSEarthquakeProperties {
  mag: number | null
  place: string | null
  time: number
  updated: number
  tz: number | null
  url: string
  detail: string
  felt: number | null
  cdi: number | null
  mmi: number | null
  alert: string | null
  status: string
  tsunami: number
  sig: number
  net: string
  code: string
  ids: string
  sources: string
  types: string
  nst: number | null
  dmin: number | null
  rms: number | null
  gap: number | null
  magType: string | null
  type: string
  title: string
}

export interface USGSEarthquakeFeature {
  type: 'Feature'
  properties: USGSEarthquakeProperties
  geometry: USGSEarthquakeGeometry
  id: string
}

export interface USGSEarthquakeMetadata {
  generated: number
  url: string
  title: string
  status: number
  api: string
  count: number
}

export interface USGSEarthquakeToolResponse {
  success: boolean
  output: {
    earthquakes?: USGSEarthquakeFeature[]
    count?: number
    event?: USGSEarthquakeFeature
    metadata?: USGSEarthquakeMetadata
    error?: string
  }
}
