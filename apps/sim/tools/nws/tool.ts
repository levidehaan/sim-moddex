import type { ToolConfig } from '@/tools/types'
import type {
  NWSToolParams,
  NWSToolResponse,
  NWSForecastPeriod,
  NWSAlert,
  NWSLocation,
} from './types'

const NWS_BASE_URL = 'https://api.weather.gov'
const USER_AGENT = 'SimStudio/1.0 (workflow automation)'

/**
 * Helper to make requests to NWS API
 */
async function nwsRequest(endpoint: string): Promise<Response> {
  const url = `${NWS_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/geo+json',
    },
  })
  return response
}

/**
 * Get point metadata (grid info) for coordinates
 */
async function getPointMetadata(
  latitude: number,
  longitude: number
): Promise<{ gridId: string; gridX: number; gridY: number; location: NWSLocation } | null> {
  const response = await nwsRequest(`/points/${latitude},${longitude}`)
  
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const props = data.properties

  return {
    gridId: props.gridId,
    gridX: props.gridX,
    gridY: props.gridY,
    location: {
      city: props.relativeLocation?.properties?.city || '',
      state: props.relativeLocation?.properties?.state || '',
      gridId: props.gridId,
      gridX: props.gridX,
      gridY: props.gridY,
      forecastOffice: props.forecastOffice,
      radarStation: props.radarStation,
      timeZone: props.timeZone,
    },
  }
}

/**
 * Get forecast for coordinates
 */
async function getForecast(
  latitude: number,
  longitude: number,
  hourly: boolean = false
): Promise<NWSToolResponse> {
  const metadata = await getPointMetadata(latitude, longitude)
  
  if (!metadata) {
    return {
      success: false,
      output: {
        error: 'Could not get location metadata. Ensure coordinates are within the US.',
      },
    }
  }

  const endpoint = hourly
    ? `/gridpoints/${metadata.gridId}/${metadata.gridX},${metadata.gridY}/forecast/hourly`
    : `/gridpoints/${metadata.gridId}/${metadata.gridX},${metadata.gridY}/forecast`

  const response = await nwsRequest(endpoint)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get forecast: ${response.status}`,
      },
    }
  }

  const data = await response.json()
  const props = data.properties

  const periods: NWSForecastPeriod[] = props.periods.map((p: Record<string, unknown>) => ({
    number: p.number,
    name: p.name,
    startTime: p.startTime,
    endTime: p.endTime,
    isDaytime: p.isDaytime,
    temperature: p.temperature,
    temperatureUnit: p.temperatureUnit,
    temperatureTrend: p.temperatureTrend,
    probabilityOfPrecipitation: p.probabilityOfPrecipitation || { unitCode: 'wmoUnit:percent', value: null },
    windSpeed: p.windSpeed,
    windDirection: p.windDirection,
    icon: p.icon,
    shortForecast: p.shortForecast,
    detailedForecast: p.detailedForecast,
  }))

  return {
    success: true,
    output: {
      forecast: {
        updated: props.updated,
        units: props.units,
        generatedAt: props.generatedAt,
        periods,
      },
      periods,
      location: metadata.location,
    },
  }
}

/**
 * Get current conditions (latest observation)
 */
async function getCurrentConditions(
  latitude: number,
  longitude: number
): Promise<NWSToolResponse> {
  const metadata = await getPointMetadata(latitude, longitude)
  
  if (!metadata) {
    return {
      success: false,
      output: {
        error: 'Could not get location metadata. Ensure coordinates are within the US.',
      },
    }
  }

  // Get observation stations for this grid
  const stationsResponse = await nwsRequest(
    `/gridpoints/${metadata.gridId}/${metadata.gridX},${metadata.gridY}/stations`
  )

  if (!stationsResponse.ok) {
    return {
      success: false,
      output: {
        error: 'Could not find observation stations for this location.',
      },
    }
  }

  const stationsData = await stationsResponse.json()
  const stations = stationsData.features

  if (!stations || stations.length === 0) {
    return {
      success: false,
      output: {
        error: 'No observation stations found for this location.',
      },
    }
  }

  // Get latest observation from nearest station
  const stationId = stations[0].properties.stationIdentifier
  const obsResponse = await nwsRequest(`/stations/${stationId}/observations/latest`)

  if (!obsResponse.ok) {
    return {
      success: false,
      output: {
        error: 'Could not get current observations.',
      },
    }
  }

  const obsData = await obsResponse.json()
  const obs = obsData.properties

  return {
    success: true,
    output: {
      forecast: {
        updated: obs.timestamp,
        units: 'us',
        generatedAt: obs.timestamp,
        periods: [
          {
            number: 0,
            name: 'Current',
            startTime: obs.timestamp,
            endTime: obs.timestamp,
            isDaytime: true,
            temperature: obs.temperature?.value
              ? Math.round((obs.temperature.value * 9) / 5 + 32)
              : 0,
            temperatureUnit: 'F',
            temperatureTrend: null,
            probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: null },
            windSpeed: obs.windSpeed?.value
              ? `${Math.round(obs.windSpeed.value * 0.621371)} mph`
              : 'Calm',
            windDirection: obs.windDirection?.value
              ? getWindDirection(obs.windDirection.value)
              : '',
            icon: obs.icon || '',
            shortForecast: obs.textDescription || '',
            detailedForecast: obs.textDescription || '',
          },
        ],
      },
      location: metadata.location,
    },
  }
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

/**
 * Get active alerts
 */
async function getAlerts(
  urgency?: string,
  severity?: string
): Promise<NWSToolResponse> {
  let endpoint = '/alerts/active'
  const params: string[] = []

  if (urgency) params.push(`urgency=${urgency}`)
  if (severity) params.push(`severity=${severity}`)

  if (params.length > 0) {
    endpoint += `?${params.join('&')}`
  }

  const response = await nwsRequest(endpoint)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get alerts: ${response.status}`,
      },
    }
  }

  const data = await response.json()
  const alerts: NWSAlert[] = data.features.map((f: Record<string, unknown>) => {
    const p = f.properties as Record<string, unknown>
    return {
      id: p.id,
      areaDesc: p.areaDesc,
      geocode: p.geocode,
      affectedZones: p.affectedZones,
      sent: p.sent,
      effective: p.effective,
      onset: p.onset,
      expires: p.expires,
      ends: p.ends,
      status: p.status,
      messageType: p.messageType,
      category: p.category,
      severity: p.severity,
      certainty: p.certainty,
      urgency: p.urgency,
      event: p.event,
      sender: p.sender,
      senderName: p.senderName,
      headline: p.headline,
      description: p.description,
      instruction: p.instruction,
      response: p.response,
    }
  })

  return {
    success: true,
    output: {
      alerts,
    },
  }
}

/**
 * Get alerts by area (state)
 */
async function getAlertsByArea(state: string): Promise<NWSToolResponse> {
  const response = await nwsRequest(`/alerts/active/area/${state.toUpperCase()}`)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get alerts for ${state}: ${response.status}`,
      },
    }
  }

  const data = await response.json()
  const alerts: NWSAlert[] = data.features.map((f: Record<string, unknown>) => {
    const p = f.properties as Record<string, unknown>
    return {
      id: p.id,
      areaDesc: p.areaDesc,
      geocode: p.geocode,
      affectedZones: p.affectedZones,
      sent: p.sent,
      effective: p.effective,
      onset: p.onset,
      expires: p.expires,
      ends: p.ends,
      status: p.status,
      messageType: p.messageType,
      category: p.category,
      severity: p.severity,
      certainty: p.certainty,
      urgency: p.urgency,
      event: p.event,
      sender: p.sender,
      senderName: p.senderName,
      headline: p.headline,
      description: p.description,
      instruction: p.instruction,
      response: p.response,
    }
  })

  return {
    success: true,
    output: {
      alerts,
    },
  }
}

/**
 * Get raw grid data
 */
async function getGridData(
  latitude: number,
  longitude: number
): Promise<NWSToolResponse> {
  const metadata = await getPointMetadata(latitude, longitude)
  
  if (!metadata) {
    return {
      success: false,
      output: {
        error: 'Could not get location metadata. Ensure coordinates are within the US.',
      },
    }
  }

  const response = await nwsRequest(
    `/gridpoints/${metadata.gridId}/${metadata.gridX},${metadata.gridY}`
  )

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get grid data: ${response.status}`,
      },
    }
  }

  const data = await response.json()

  return {
    success: true,
    output: {
      gridData: data.properties,
      location: metadata.location,
    },
  }
}

export const nwsWeatherTool: ToolConfig<NWSToolParams, NWSToolResponse> = {
  id: 'nws_weather',
  name: 'National Weather Service',
  description:
    'Get weather forecasts, current conditions, and alerts from the National Weather Service API. Free, no API key required.',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description:
        'Operation: forecast, forecast_hourly, current, alerts, alerts_area, gridpoints',
    },
    latitude: {
      type: 'number',
      required: false,
      description: 'Latitude coordinate (required for forecast operations)',
    },
    longitude: {
      type: 'number',
      required: false,
      description: 'Longitude coordinate (required for forecast operations)',
    },
    state: {
      type: 'string',
      required: false,
      description: 'Two-letter state code for alerts_area operation',
    },
    urgency: {
      type: 'string',
      required: false,
      description: 'Alert urgency filter: Immediate, Expected, Future',
    },
    severity: {
      type: 'string',
      required: false,
      description: 'Alert severity filter: Extreme, Severe, Moderate, Minor',
    },
  },

  directExecution: async (params: NWSToolParams): Promise<NWSToolResponse> => {
    const { operation, latitude, longitude, state, urgency, severity } = params

    try {
      switch (operation) {
        case 'forecast':
          if (latitude === undefined || longitude === undefined) {
            return {
              success: false,
              output: {
                error: 'Latitude and longitude are required for forecast operation',
              },
            }
          }
          return await getForecast(latitude, longitude, false)

        case 'forecast_hourly':
          if (latitude === undefined || longitude === undefined) {
            return {
              success: false,
              output: {
                error: 'Latitude and longitude are required for hourly forecast operation',
              },
            }
          }
          return await getForecast(latitude, longitude, true)

        case 'current':
          if (latitude === undefined || longitude === undefined) {
            return {
              success: false,
              output: {
                error: 'Latitude and longitude are required for current conditions operation',
              },
            }
          }
          return await getCurrentConditions(latitude, longitude)

        case 'alerts':
          return await getAlerts(urgency, severity)

        case 'alerts_area':
          if (!state) {
            return {
              success: false,
              output: {
                error: 'State code is required for alerts_area operation',
              },
            }
          }
          return await getAlertsByArea(state)

        case 'gridpoints':
          if (latitude === undefined || longitude === undefined) {
            return {
              success: false,
              output: {
                error: 'Latitude and longitude are required for gridpoints operation',
              },
            }
          }
          return await getGridData(latitude, longitude)

        default:
          return {
            success: false,
            output: {
              error: `Unknown operation: ${operation}`,
            },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    forecast: { type: 'json', description: 'Weather forecast data' },
    periods: { type: 'array', description: 'Forecast periods with conditions' },
    alerts: { type: 'array', description: 'Active weather alerts' },
    location: { type: 'json', description: 'Location information' },
    gridData: { type: 'json', description: 'Raw grid data from NWS' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
