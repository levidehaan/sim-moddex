import type { ToolConfig } from '@/tools/types'
import type {
  USGSEarthquakeToolParams,
  USGSEarthquakeToolResponse,
  USGSEarthquakeFeature,
  USGSEarthquakeMetadata,
} from './types'

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1'

/**
 * Build query parameters for USGS API
 */
function buildQueryParams(params: USGSEarthquakeToolParams): URLSearchParams {
  const queryParams = new URLSearchParams()
  queryParams.set('format', 'geojson')

  if (params.startTime) queryParams.set('starttime', params.startTime)
  if (params.endTime) queryParams.set('endtime', params.endTime)
  if (params.minMagnitude !== undefined) queryParams.set('minmagnitude', params.minMagnitude.toString())
  if (params.maxMagnitude !== undefined) queryParams.set('maxmagnitude', params.maxMagnitude.toString())
  if (params.latitude !== undefined) queryParams.set('latitude', params.latitude.toString())
  if (params.longitude !== undefined) queryParams.set('longitude', params.longitude.toString())
  if (params.maxRadiusKm !== undefined) queryParams.set('maxradiuskm', params.maxRadiusKm.toString())
  if (params.limit !== undefined) queryParams.set('limit', Math.min(params.limit, 20000).toString())
  if (params.orderBy) queryParams.set('orderby', params.orderBy)

  return queryParams
}

/**
 * Query earthquakes with filters
 */
async function queryEarthquakes(params: USGSEarthquakeToolParams): Promise<USGSEarthquakeToolResponse> {
  const queryParams = buildQueryParams(params)
  const url = `${USGS_BASE_URL}/query?${queryParams.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to query earthquakes: ${response.status}`,
      },
    }
  }

  const data = await response.json()

  return {
    success: true,
    output: {
      earthquakes: data.features as USGSEarthquakeFeature[],
      count: data.metadata?.count || data.features.length,
      metadata: data.metadata as USGSEarthquakeMetadata,
    },
  }
}

/**
 * Get significant earthquakes (past 30 days by default)
 */
async function getSignificantEarthquakes(params: USGSEarthquakeToolParams): Promise<USGSEarthquakeToolResponse> {
  // Use the significant earthquakes feed
  const period = 'month' // Options: hour, day, week, month
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_${period}.geojson`

  const response = await fetch(url)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get significant earthquakes: ${response.status}`,
      },
    }
  }

  const data = await response.json()
  let earthquakes = data.features as USGSEarthquakeFeature[]

  // Apply limit if specified
  if (params.limit) {
    earthquakes = earthquakes.slice(0, params.limit)
  }

  return {
    success: true,
    output: {
      earthquakes,
      count: earthquakes.length,
      metadata: data.metadata as USGSEarthquakeMetadata,
    },
  }
}

/**
 * Get a specific earthquake event by ID
 */
async function getEvent(eventId: string): Promise<USGSEarthquakeToolResponse> {
  const url = `${USGS_BASE_URL}/query?format=geojson&eventid=${eventId}`

  const response = await fetch(url)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get earthquake event: ${response.status}`,
      },
    }
  }

  const data = await response.json()

  if (!data.features || data.features.length === 0) {
    return {
      success: false,
      output: {
        error: `Earthquake event '${eventId}' not found`,
      },
    }
  }

  return {
    success: true,
    output: {
      event: data.features[0] as USGSEarthquakeFeature,
      metadata: data.metadata as USGSEarthquakeMetadata,
    },
  }
}

/**
 * Get count of earthquakes matching criteria
 */
async function getCount(params: USGSEarthquakeToolParams): Promise<USGSEarthquakeToolResponse> {
  const queryParams = buildQueryParams(params)
  queryParams.delete('limit') // Remove limit for count
  queryParams.delete('format')
  queryParams.set('format', 'geojson')
  
  const url = `${USGS_BASE_URL}/count?${queryParams.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    // Fall back to query and count results
    const queryUrl = `${USGS_BASE_URL}/query?${queryParams.toString()}`
    const queryResponse = await fetch(queryUrl)
    
    if (!queryResponse.ok) {
      return {
        success: false,
        output: {
          error: `Failed to get earthquake count: ${response.status}`,
        },
      }
    }

    const data = await queryResponse.json()
    return {
      success: true,
      output: {
        count: data.metadata?.count || data.features?.length || 0,
      },
    }
  }

  const count = await response.text()

  return {
    success: true,
    output: {
      count: Number.parseInt(count, 10) || 0,
    },
  }
}

export const usgsEarthquakeTool: ToolConfig<USGSEarthquakeToolParams, USGSEarthquakeToolResponse> = {
  id: 'usgs_earthquake_api',
  name: 'USGS Earthquake API',
  description:
    'Get real-time earthquake data from the USGS Earthquake Hazards Program. Free, no authentication required.',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation: query, significant, get_event, count',
    },
    eventId: {
      type: 'string',
      required: false,
      description: 'Earthquake event ID for get_event operation',
    },
    startTime: {
      type: 'string',
      required: false,
      description: 'Start time (ISO 8601 or relative like NOW-7days)',
    },
    endTime: {
      type: 'string',
      required: false,
      description: 'End time (ISO 8601 or relative)',
    },
    minMagnitude: {
      type: 'number',
      required: false,
      description: 'Minimum earthquake magnitude',
    },
    maxMagnitude: {
      type: 'number',
      required: false,
      description: 'Maximum earthquake magnitude',
    },
    latitude: {
      type: 'number',
      required: false,
      description: 'Center latitude for radius search',
    },
    longitude: {
      type: 'number',
      required: false,
      description: 'Center longitude for radius search',
    },
    maxRadiusKm: {
      type: 'number',
      required: false,
      description: 'Search radius in kilometers',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of results (default: 20, max: 20000)',
    },
    orderBy: {
      type: 'string',
      required: false,
      description: 'Sort order: time, time-asc, magnitude, magnitude-asc',
    },
  },

  directExecution: async (params: USGSEarthquakeToolParams): Promise<USGSEarthquakeToolResponse> => {
    const { operation, eventId } = params

    try {
      switch (operation) {
        case 'query':
          return await queryEarthquakes(params)

        case 'significant':
          return await getSignificantEarthquakes(params)

        case 'get_event':
          if (!eventId) {
            return {
              success: false,
              output: {
                error: 'Event ID is required for get_event operation',
              },
            }
          }
          return await getEvent(eventId)

        case 'count':
          return await getCount(params)

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
    earthquakes: { type: 'array', description: 'Array of earthquake events' },
    count: { type: 'number', description: 'Number of earthquakes matching query' },
    event: { type: 'json', description: 'Single earthquake event details' },
    metadata: { type: 'json', description: 'Query metadata (count, API info)' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
