export interface OpenMeteoToolParams {
  operation: string
  latitude: number
  longitude: number
  startDate?: string
  endDate?: string
  hourly?: string
  daily?: string
  timezone?: string
  temperatureUnit?: string
  windspeedUnit?: string
  precipitationUnit?: string
}

export interface OpenMeteoToolResponse {
  success: boolean
  output: {
    current?: any
    hourly?: any
    daily?: any
    latitude?: number
    longitude?: number
    timezone?: string
    error?: string
  }
}
