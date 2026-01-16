export interface OpenSkyToolParams {
  operation: string
  username?: string
  password?: string
  icao24?: string
  airport?: string
  begin?: number
  end?: number
  bbox?: string
}

export interface OpenSkyToolResponse {
  success: boolean
  output: {
    states?: any[]
    flights?: any[]
    time?: number
    error?: string
  }
}
