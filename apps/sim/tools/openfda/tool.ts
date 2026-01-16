import type { ToolConfig } from '@/tools/types'
import type { OpenFDAToolParams, OpenFDAToolResponse } from './types'

const OPENFDA_API_BASE = 'https://api.fda.gov'

const ENDPOINT_MAP: Record<string, string> = {
  drug_event: '/drug/event.json',
  drug_label: '/drug/label.json',
  drug_enforcement: '/drug/enforcement.json',
  drug_ndc: '/drug/ndc.json',
  device_event: '/device/event.json',
  device_recall: '/device/recall.json',
  device_510k: '/device/510k.json',
  food_enforcement: '/food/enforcement.json',
  food_event: '/food/event.json',
}

function buildSearchQuery(params: OpenFDAToolParams): string {
  const searchParts: string[] = []

  // Use custom search if provided
  if (params.search) {
    searchParts.push(params.search)
  }

  // Build search based on operation type and parameters
  if (params.drugName) {
    if (params.operation === 'drug_event') {
      searchParts.push(`patient.drug.openfda.brand_name:"${params.drugName}"`)
    } else if (params.operation === 'drug_label') {
      searchParts.push(`openfda.brand_name:"${params.drugName}"`)
    } else if (params.operation === 'drug_enforcement') {
      searchParts.push(`product_description:"${params.drugName}"`)
    } else if (params.operation === 'drug_ndc') {
      searchParts.push(`brand_name:"${params.drugName}"`)
    }
  }

  if (params.manufacturer) {
    if (params.operation === 'drug_event') {
      searchParts.push(`patient.drug.openfda.manufacturer_name:"${params.manufacturer}"`)
    } else if (params.operation === 'drug_label' || params.operation === 'drug_ndc') {
      searchParts.push(`openfda.manufacturer_name:"${params.manufacturer}"`)
    } else if (params.operation === 'drug_enforcement' || params.operation === 'food_enforcement') {
      searchParts.push(`recalling_firm:"${params.manufacturer}"`)
    } else if (params.operation === 'device_event' || params.operation === 'device_recall') {
      searchParts.push(`manufacturer_d_name:"${params.manufacturer}"`)
    }
  }

  if (params.reactionType && params.operation === 'drug_event') {
    searchParts.push(`patient.reaction.reactionmeddrapt:"${params.reactionType}"`)
  }

  if (params.recallClass && (params.operation === 'drug_enforcement' || params.operation === 'food_enforcement' || params.operation === 'device_recall')) {
    searchParts.push(`classification:"${params.recallClass}"`)
  }

  return searchParts.join('+AND+')
}

export const openfdaTool: ToolConfig<OpenFDAToolParams, OpenFDAToolResponse> = {
  id: 'openfda_api',
  name: 'OpenFDA API',
  description: 'Access FDA drug, device, and food safety data',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform',
    },
    apiKey: {
      type: 'string',
      required: false,
      description: 'OpenFDA API key (optional, increases rate limits)',
    },
    search: {
      type: 'string',
      required: false,
      description: 'Custom search query',
    },
    drugName: {
      type: 'string',
      required: false,
      description: 'Drug name to search',
    },
    manufacturer: {
      type: 'string',
      required: false,
      description: 'Manufacturer name',
    },
    reactionType: {
      type: 'string',
      required: false,
      description: 'Adverse reaction type',
    },
    recallClass: {
      type: 'string',
      required: false,
      description: 'Recall classification',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum results (max 1000)',
    },
    skip: {
      type: 'number',
      required: false,
      description: 'Results to skip',
    },
    count: {
      type: 'string',
      required: false,
      description: 'Field to count/aggregate',
    },
  },

  directExecution: async (params: OpenFDAToolParams): Promise<OpenFDAToolResponse> => {
    try {
      const { operation } = params

      const endpoint = ENDPOINT_MAP[operation]
      if (!endpoint) {
        return {
          success: false,
          output: { error: `Unknown operation: ${operation}` },
        }
      }

      // Build URL
      const urlParams = new URLSearchParams()
      
      // Add API key if provided
      if (params.apiKey) {
        urlParams.append('api_key', params.apiKey)
      }

      // Build and add search query
      const searchQuery = buildSearchQuery(params)
      if (searchQuery) {
        urlParams.append('search', searchQuery)
      }

      // Add limit
      if (params.limit) {
        urlParams.append('limit', Math.min(params.limit, 1000).toString())
      } else {
        urlParams.append('limit', '10')
      }

      // Add skip for pagination
      if (params.skip) {
        urlParams.append('skip', params.skip.toString())
      }

      // Add count for aggregation
      if (params.count) {
        urlParams.append('count', params.count)
      }

      const url = `${OPENFDA_API_BASE}${endpoint}?${urlParams.toString()}`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `OpenFDA API error: ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error?.message) {
            errorMessage = errorJson.error.message
          }
        } catch {
          // Use default error message
        }
        return {
          success: false,
          output: { error: errorMessage },
        }
      }

      const data = await response.json()

      // Handle count response (different structure)
      if (params.count && data.results) {
        return {
          success: true,
          output: {
            counts: data.results,
            meta: data.meta,
            total: data.meta?.results?.total,
          },
        }
      }

      return {
        success: true,
        output: {
          results: data.results || [],
          meta: data.meta,
          total: data.meta?.results?.total,
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
    results: { type: 'array', description: 'Search results' },
    meta: { type: 'json', description: 'Response metadata' },
    total: { type: 'number', description: 'Total matching records' },
    counts: { type: 'array', description: 'Count aggregation results' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
