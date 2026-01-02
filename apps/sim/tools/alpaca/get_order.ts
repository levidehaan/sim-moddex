import type { ToolConfig } from '@/tools/types'
import type { AlpacaOrder } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetOrderParams {
  apiKey: string
  apiSecret: string
  order_id: string
  nested?: boolean
  paper?: boolean
}

export interface AlpacaGetOrderResponse {
  success: boolean
  output: {
    order: AlpacaOrder
  }
}

export const alpacaGetOrderTool: ToolConfig<AlpacaGetOrderParams, AlpacaGetOrderResponse> = {
  id: 'alpaca_get_order',
  name: 'Get Order',
  description: 'Get details of a specific order by ID',
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
    order_id: {
      type: 'string',
      required: true,
      description: 'The order ID to retrieve',
    },
    nested: {
      type: 'boolean',
      required: false,
      description: 'Include nested multi-leg order details',
    },
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading environment',
    },
  },

  request: {
    url: (params) => {
      const query = params.nested ? '?nested=true' : ''
      return buildAlpacaTradingUrl(`/v2/orders/${params.order_id}${query}`, params.paper)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_order')
    }

    const order = await response.json()
    return {
      success: true,
      output: { order },
    }
  },

  outputs: {
    order: {
      type: 'object',
      description: 'The order details',
    },
  },
}
