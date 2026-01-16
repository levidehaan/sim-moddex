/**
 * National Weather Service API Tool Types
 */

export type NWSOperation =
  | 'forecast'
  | 'forecast_hourly'
  | 'current'
  | 'alerts'
  | 'alerts_area'
  | 'gridpoints'

export interface NWSToolParams {
  operation: NWSOperation
  latitude?: number
  longitude?: number
  state?: string
  urgency?: 'Immediate' | 'Expected' | 'Future'
  severity?: 'Extreme' | 'Severe' | 'Moderate' | 'Minor'
}

export interface NWSForecastPeriod {
  number: number
  name: string
  startTime: string
  endTime: string
  isDaytime: boolean
  temperature: number
  temperatureUnit: string
  temperatureTrend: string | null
  probabilityOfPrecipitation: {
    unitCode: string
    value: number | null
  }
  windSpeed: string
  windDirection: string
  icon: string
  shortForecast: string
  detailedForecast: string
}

export interface NWSAlert {
  id: string
  areaDesc: string
  geocode: {
    SAME: string[]
    UGC: string[]
  }
  affectedZones: string[]
  sent: string
  effective: string
  onset: string | null
  expires: string
  ends: string | null
  status: string
  messageType: string
  category: string
  severity: string
  certainty: string
  urgency: string
  event: string
  sender: string
  senderName: string
  headline: string | null
  description: string
  instruction: string | null
  response: string
}

export interface NWSLocation {
  city: string
  state: string
  gridId: string
  gridX: number
  gridY: number
  forecastOffice: string
  radarStation: string
  timeZone: string
}

export interface NWSToolResponse {
  success: boolean
  output: {
    forecast?: {
      updated: string
      units: string
      generatedAt: string
      periods: NWSForecastPeriod[]
    }
    periods?: NWSForecastPeriod[]
    alerts?: NWSAlert[]
    location?: NWSLocation
    gridData?: Record<string, unknown>
    error?: string
  }
}
