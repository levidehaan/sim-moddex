import type { ToolConfig } from '@/tools/types'
import type { AlpacaOrder } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaListOrdersParams {
  apiKey: string
  apiSecret: string
  status?: 'open' | 'closed' | 'all'
  limit?: number
  after?: string
  until?: string
  direction?: 'asc' | 'desc'
  nested?: boolean
  symbols?: string
  side?: 'buy' | 'sell'
  paper?: boolean
}

export interface AlpacaListOrdersResponse {
  success: boolean
  output: {
    orders: AlpacaOrder[]
    count: number
  }
}

export const alpacaListOrdersTool: ToolConfig<AlpacaListOrdersParams, AlpacaListOrdersResponse> = {
  id: 'alpaca_list_orders',
  name: 'List Orders',
  description: 'Get a list of orders with optional filtering',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      description: 'Alpaca API Key ID',
    },
    apiSecret: {
      type: 'string',
      required: true,
      description: 'Alpaca API Secret Key',
    },
    status: {
      type: 'string',
      required: false,
      description: 'Filter by status: open, closed, or all (default: open)',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of orders to return (default: 50, max: 500)',
    },
    after: {
      type: 'string',
      required: false,
      description: 'Return orders after this timestamp (RFC-3339)',
    },
    until: {
      type: 'string',
      required: false,
      description: 'Return orders until this timestamp (RFC-3339)',
    },
    direction: {
      type: 'string',
      required: false,
      description: 'Sort direction: asc or desc (default: desc)',
    },
    nested: {
      type: 'boolean',
      required: false,
      description: 'Include nested multi-leg order details',
    },
    symbols: {
      type: 'string',
      required: false,
      description: 'Comma-separated list of symbols to filter by',
    },
    side: {
      type: 'string',
      required: false,
      description: 'Filter by side: buy or sell',
    },
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading environment',
    },
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.after) queryParams.append('after', params.after)
      if (params.until) queryParams.append('until', params.until)
      if (params.direction) queryParams.append('direction', params.direction)
      if (params.nested !== undefined) queryParams.append('nested', params.nested.toString())
      if (params.symbols) queryParams.append('symbols', params.symbols)
      if (params.side) queryParams.append('side', params.side)
      const query = queryParams.toString()
      return buildAlpacaTradingUrl(`/v2/orders${query ? `?${query}` : ''}`, params.paper)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'list_orders')
    }

    const orders = await response.json()
    return {
      success: true,
      output: {
        orders: orders || [],
        count: orders?.length || 0,
      },
    }
  },

  outputs: {
    orders: {
      type: 'array',
      description: 'List of orders',
    },
    count: {
      type: 'number',
      description: 'Number of orders returned',
    },
  },
}
