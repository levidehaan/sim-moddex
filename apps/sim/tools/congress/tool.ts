import type { ToolConfig } from '@/tools/types'
import type { CongressToolParams, CongressToolResponse } from './types'

const CONGRESS_API_BASE = 'https://api.congress.gov/v3'

const ENDPOINT_MAP: Record<string, (params: CongressToolParams) => string> = {
  bills: (p) => `/bill${p.congress ? `/${p.congress}` : ''}`,
  bill_details: (p) => `/bill/${p.congress}/${p.billNumber}`,
  bill_actions: (p) => `/bill/${p.congress}/${p.billNumber}/actions`,
  bill_amendments: (p) => `/bill/${p.congress}/${p.billNumber}/amendments`,
  bill_cosponsors: (p) => `/bill/${p.congress}/${p.billNumber}/cosponsors`,
  bill_summaries: (p) => `/bill/${p.congress}/${p.billNumber}/summaries`,
  members: () => '/member',
  member_details: (p) => `/member/${p.memberId}`,
  committees: (p) => `/committee${p.congress ? `/${p.congress}` : ''}`,
  committee_details: (p) => `/committee/${p.congress}/${p.chamber}/${p.committeeCode}`,
  nominations: (p) => `/nomination${p.congress ? `/${p.congress}` : ''}`,
  treaties: (p) => `/treaty${p.congress ? `/${p.congress}` : ''}`,
}

export const congressTool: ToolConfig<CongressToolParams, CongressToolResponse> = {
  id: 'congress_api',
  name: 'Congress.gov API',
  description: 'Access U.S. Congressional data and legislation',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Operation to perform',
    },
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Congress.gov API key',
    },
    congress: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Congress session number',
    },
    billNumber: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Bill number',
    },
    memberId: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Member bioguide ID',
    },
    committeeCode: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Committee code',
    },
    query: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Search query',
    },
    chamber: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Legislative chamber',
    },
    state: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'State code',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Maximum results',
    },
    offset: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Results to skip',
    },
  },

  request: {
    url: '',
    method: 'GET',
    headers: () => ({}),
  },

  directExecution: async (params: CongressToolParams) => {
    try {
      const endpointFn = ENDPOINT_MAP[params.operation]
      if (!endpointFn) {
        throw new Error(`Unknown operation: ${params.operation}`)
      }

      const endpoint = endpointFn(params)
      const url = new URL(`${CONGRESS_API_BASE}${endpoint}`)
      
      url.searchParams.append('api_key', params.apiKey)
      url.searchParams.append('format', 'json')

      if (params.query) {
        url.searchParams.append('query', params.query)
      }
      if (params.chamber) {
        url.searchParams.append('chamber', params.chamber)
      }
      if (params.state) {
        url.searchParams.append('state', params.state)
      }
      if (params.limit) {
        url.searchParams.append('limit', params.limit.toString())
      }
      if (params.offset) {
        url.searchParams.append('offset', params.offset.toString())
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Congress.gov API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      // Handle different response structures
      const output: any = {
        success: true,
      }

      if (data.bills) {
        output.results = data.bills
        output.pagination = data.pagination
      } else if (data.bill) {
        output.bill = data.bill
      } else if (data.members) {
        output.results = data.members
        output.pagination = data.pagination
      } else if (data.member) {
        output.member = data.member
      } else if (data.committees) {
        output.results = data.committees
        output.pagination = data.pagination
      } else if (data.committee) {
        output.committee = data.committee
      } else if (data.actions) {
        output.results = data.actions
        output.pagination = data.pagination
      } else if (data.amendments) {
        output.results = data.amendments
        output.pagination = data.pagination
      } else if (data.cosponsors) {
        output.results = data.cosponsors
        output.pagination = data.pagination
      } else if (data.summaries) {
        output.results = data.summaries
        output.pagination = data.pagination
      } else if (data.nominations) {
        output.results = data.nominations
        output.pagination = data.pagination
      } else if (data.treaties) {
        output.results = data.treaties
        output.pagination = data.pagination
      } else {
        output.results = [data]
      }

      return {
        success: true,
        output,
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
    bill: { type: 'json', description: 'Bill details' },
    member: { type: 'json', description: 'Member details' },
    committee: { type: 'json', description: 'Committee details' },
    pagination: { type: 'json', description: 'Pagination information' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
