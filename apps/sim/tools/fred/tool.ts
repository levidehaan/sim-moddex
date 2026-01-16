import type { ToolConfig } from '@/tools/types'
import type { FREDToolParams, FREDToolResponse } from './types'

const FRED_API_BASE = 'https://api.stlouisfed.org/fred'

async function makeRequest(endpoint: string, apiKey: string, params: Record<string, string | number | undefined>): Promise<unknown> {
  const searchParams = new URLSearchParams()
  searchParams.append('api_key', apiKey)
  searchParams.append('file_type', 'json')
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  }

  const url = `${FRED_API_BASE}/${endpoint}?${searchParams.toString()}`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`FRED API error: ${error}`)
  }

  return response.json()
}

export const fredTool: ToolConfig<FREDToolParams, FREDToolResponse> = {
  id: 'fred_api',
  name: 'FRED API',
  description: 'Access Federal Reserve Economic Data',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform',
    },
    apiKey: {
      type: 'string',
      required: true,
      description: 'FRED API key',
    },
    seriesId: {
      type: 'string',
      required: false,
      description: 'Series ID',
    },
    searchText: {
      type: 'string',
      required: false,
      description: 'Search text',
    },
    categoryId: {
      type: 'string',
      required: false,
      description: 'Category ID',
    },
    releaseId: {
      type: 'string',
      required: false,
      description: 'Release ID',
    },
    startDate: {
      type: 'string',
      required: false,
      description: 'Start date (YYYY-MM-DD)',
    },
    endDate: {
      type: 'string',
      required: false,
      description: 'End date (YYYY-MM-DD)',
    },
    frequency: {
      type: 'string',
      required: false,
      description: 'Data frequency',
    },
    units: {
      type: 'string',
      required: false,
      description: 'Units transformation',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum results',
    },
    sortOrder: {
      type: 'string',
      required: false,
      description: 'Sort order (asc or desc)',
    },
  },

  directExecution: async (params: FREDToolParams): Promise<FREDToolResponse> => {
    try {
      const { operation, apiKey } = params

      if (!apiKey) {
        return {
          success: false,
          output: { error: 'API key is required' },
        }
      }

      switch (operation) {
        case 'observations': {
          if (!params.seriesId) {
            return {
              success: false,
              output: { error: 'Series ID is required for observations' },
            }
          }
          const result = await makeRequest('series/observations', apiKey, {
            series_id: params.seriesId,
            observation_start: params.startDate,
            observation_end: params.endDate,
            frequency: params.frequency,
            units: params.units,
            limit: params.limit,
            sort_order: params.sortOrder,
          })
          const data = result as { observations?: unknown[]; count?: number }
          return {
            success: true,
            output: {
              observations: data.observations as FREDToolResponse['output']['observations'],
              count: data.count,
            },
          }
        }

        case 'series': {
          if (!params.seriesId) {
            return {
              success: false,
              output: { error: 'Series ID is required' },
            }
          }
          const result = await makeRequest('series', apiKey, {
            series_id: params.seriesId,
          })
          const data = result as { seriess?: unknown[] }
          return {
            success: true,
            output: {
              series: (data.seriess?.[0] || null) as FREDToolResponse['output']['series'],
            },
          }
        }

        case 'search': {
          if (!params.searchText) {
            return {
              success: false,
              output: { error: 'Search text is required' },
            }
          }
          const result = await makeRequest('series/search', apiKey, {
            search_text: params.searchText,
            limit: params.limit || 100,
            sort_order: params.sortOrder,
          })
          const data = result as { seriess?: unknown[]; count?: number }
          return {
            success: true,
            output: {
              searchResults: data.seriess as FREDToolResponse['output']['searchResults'],
              count: data.count,
            },
          }
        }

        case 'category': {
          const categoryId = params.categoryId || '0' // Root category
          const result = await makeRequest('category', apiKey, {
            category_id: categoryId,
          })
          const data = result as { categories?: unknown[] }
          return {
            success: true,
            output: {
              category: (data.categories?.[0] || null) as FREDToolResponse['output']['category'],
            },
          }
        }

        case 'category_series': {
          if (!params.categoryId) {
            return {
              success: false,
              output: { error: 'Category ID is required' },
            }
          }
          const result = await makeRequest('category/series', apiKey, {
            category_id: params.categoryId,
            limit: params.limit || 100,
            sort_order: params.sortOrder,
          })
          const data = result as { seriess?: unknown[]; count?: number }
          return {
            success: true,
            output: {
              categorySeries: data.seriess as FREDToolResponse['output']['categorySeries'],
              count: data.count,
            },
          }
        }

        case 'releases': {
          const result = await makeRequest('releases', apiKey, {
            limit: params.limit || 100,
            sort_order: params.sortOrder,
          })
          const data = result as { releases?: unknown[] }
          return {
            success: true,
            output: {
              releases: data.releases as FREDToolResponse['output']['releases'],
            },
          }
        }

        case 'release_dates': {
          if (!params.releaseId) {
            return {
              success: false,
              output: { error: 'Release ID is required' },
            }
          }
          const result = await makeRequest('release/dates', apiKey, {
            release_id: params.releaseId,
            limit: params.limit || 100,
            sort_order: params.sortOrder,
          })
          const data = result as { release_dates?: unknown[] }
          return {
            success: true,
            output: {
              releaseDates: data.release_dates as FREDToolResponse['output']['releaseDates'],
            },
          }
        }

        default:
          return {
            success: false,
            output: { error: `Unknown operation: ${operation}` },
          }
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
    observations: { type: 'array', description: 'Time series observations' },
    series: { type: 'json', description: 'Series metadata' },
    searchResults: { type: 'array', description: 'Search results' },
    category: { type: 'json', description: 'Category information' },
    categorySeries: { type: 'array', description: 'Series in category' },
    releases: { type: 'array', description: 'Data releases' },
    releaseDates: { type: 'array', description: 'Release dates' },
    count: { type: 'number', description: 'Total count of results' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
