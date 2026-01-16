import type { ToolConfig } from '@/tools/types'
import type { OpenMeteoToolParams, OpenMeteoToolResponse } from './types'

export const openmeteoTool: ToolConfig<OpenMeteoToolParams, OpenMeteoToolResponse> = {
  id: 'openmeteo_api',
  name: 'Open-Meteo API',
  description: 'Access global weather forecasts and data',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Operation to perform',
    },
    latitude: {
      type: 'number',
      required: true,
      visibility: 'user-only',
      description: 'Latitude',
    },
    longitude: {
      type: 'number',
      required: true,
      visibility: 'user-only',
      description: 'Longitude',
    },
    startDate: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Start date',
    },
    endDate: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'End date',
    },
    hourly: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Hourly variables',
    },
    daily: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Daily variables',
    },
    timezone: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Timezone',
    },
    temperatureUnit: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Temperature unit',
    },
    windspeedUnit: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Wind speed unit',
    },
    precipitationUnit: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Precipitation unit',
    },
  },

  request: {
    url: '',
    method: 'GET',
    headers: () => ({}),
  },

  directExecution: async (params: OpenMeteoToolParams) => {
    try {
      let baseUrl = ''
      
      switch (params.operation) {
        case 'current':
        case 'forecast':
          baseUrl = 'https://api.open-meteo.com/v1/forecast'
          break
        case 'historical':
          baseUrl = 'https://archive-api.open-meteo.com/v1/archive'
          break
        case 'air_quality':
          baseUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality'
          break
        default:
          throw new Error(`Unknown operation: ${params.operation}`)
      }

      const url = new URL(baseUrl)
      url.searchParams.append('latitude', params.latitude.toString())
      url.searchParams.append('longitude', params.longitude.toString())

      if (params.operation === 'current') {
        url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m')
      }

      if (params.hourly) {
        url.searchParams.append('hourly', params.hourly)
      }
      if (params.daily) {
        url.searchParams.append('daily', params.daily)
      }
      if (params.timezone) {
        url.searchParams.append('timezone', params.timezone)
      }
      if (params.temperatureUnit) {
        url.searchParams.append('temperature_unit', params.temperatureUnit)
      }
      if (params.windspeedUnit) {
        url.searchParams.append('wind_speed_unit', params.windspeedUnit)
      }
      if (params.precipitationUnit) {
        url.searchParams.append('precipitation_unit', params.precipitationUnit)
      }

      if (params.operation === 'historical') {
        if (!params.startDate || !params.endDate) {
          throw new Error('startDate and endDate are required for historical data')
        }
        url.searchParams.append('start_date', params.startDate)
        url.searchParams.append('end_date', params.endDate)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Open-Meteo API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      return {
        success: true,
        output: {
          current: data.current,
          hourly: data.hourly,
          daily: data.daily,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    current: { type: 'json', description: 'Current weather data' },
    hourly: { type: 'json', description: 'Hourly forecast data' },
    daily: { type: 'json', description: 'Daily forecast data' },
    latitude: { type: 'number', description: 'Location latitude' },
    longitude: { type: 'number', description: 'Location longitude' },
    timezone: { type: 'string', description: 'Timezone' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
