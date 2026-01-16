import type { ToolConfig } from '@/tools/types'
import type { OpenSkyToolParams, OpenSkyToolResponse } from './types'

const OPENSKY_API_BASE = 'https://opensky-network.org/api'

export const openskyTool: ToolConfig<OpenSkyToolParams, OpenSkyToolResponse> = {
  id: 'opensky_api',
  name: 'OpenSky Network API',
  description: 'Access real-time flight tracking data',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Operation to perform',
    },
    username: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'OpenSky username',
    },
    password: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'OpenSky password',
    },
    icao24: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Aircraft ICAO24 address',
    },
    airport: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Airport ICAO code',
    },
    begin: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Begin timestamp',
    },
    end: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'End timestamp',
    },
    bbox: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Bounding box',
    },
  },

  request: {
    url: '',
    method: 'GET',
    headers: () => ({}),
  },

  directExecution: async (params: OpenSkyToolParams) => {
    try {
      let endpoint = ''
      const url = new URL(OPENSKY_API_BASE)

      switch (params.operation) {
        case 'states':
          endpoint = '/states/all'
          if (params.bbox) {
            const [lamin, lomin, lamax, lomax] = params.bbox.split(',')
            url.searchParams.append('lamin', lamin)
            url.searchParams.append('lomin', lomin)
            url.searchParams.append('lamax', lamax)
            url.searchParams.append('lomax', lomax)
          }
          break
        case 'flights_aircraft':
          if (!params.icao24) throw new Error('icao24 is required for flights_aircraft')
          endpoint = `/flights/aircraft?icao24=${params.icao24}`
          if (params.begin) url.searchParams.append('begin', params.begin.toString())
          if (params.end) url.searchParams.append('end', params.end.toString())
          break
        case 'flights_interval':
          endpoint = '/flights/all'
          if (params.begin) url.searchParams.append('begin', params.begin.toString())
          if (params.end) url.searchParams.append('end', params.end.toString())
          break
        case 'arrivals':
          if (!params.airport) throw new Error('airport is required for arrivals')
          endpoint = `/flights/arrival?airport=${params.airport}`
          if (params.begin) url.searchParams.append('begin', params.begin.toString())
          if (params.end) url.searchParams.append('end', params.end.toString())
          break
        case 'departures':
          if (!params.airport) throw new Error('airport is required for departures')
          endpoint = `/flights/departure?airport=${params.airport}`
          if (params.begin) url.searchParams.append('begin', params.begin.toString())
          if (params.end) url.searchParams.append('end', params.end.toString())
          break
        default:
          throw new Error(`Unknown operation: ${params.operation}`)
      }

      url.pathname = endpoint

      const headers: Record<string, string> = {}
      if (params.username && params.password) {
        const auth = Buffer.from(`${params.username}:${params.password}`).toString('base64')
        headers['Authorization'] = `Basic ${auth}`
      }

      const response = await fetch(url.toString(), { headers })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenSky API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      return {
        success: true,
        output: {
          states: data.states,
          flights: Array.isArray(data) ? data : undefined,
          time: data.time,
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
    states: { type: 'array', description: 'Aircraft states' },
    flights: { type: 'array', description: 'Flight data' },
    time: { type: 'number', description: 'Response timestamp' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
