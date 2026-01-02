import type { ToolConfig } from '@/tools/types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaCancelAllOrdersParams {
  apiKey: string
  apiSecret: string
  paper?: boolean
}

export interface AlpacaCancelAllOrdersResponse {
  success: boolean
  output: {
    canceled_orders: Array<{
      id: string
      status: number
    }>
    total_canceled: number
  }
}

export const alpacaCancelAllOrdersTool: ToolConfig<
  AlpacaCancelAllOrdersParams,
  AlpacaCancelAllOrdersResponse
> = {
  id: 'alpaca_cancel_all_orders',
  name: 'Cancel All Orders',
  description: 'Cancel all open orders',
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
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading environment',
    },
  },

  request: {
    url: (params) => buildAlpacaTradingUrl('/v2/orders', params.paper),
    method: 'DELETE',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'cancel_all_orders')
    }

    const data = await response.json()
    return {
      success: true,
      output: {
        canceled_orders: data || [],
        total_canceled: data?.length || 0,
      },
    }
  },

  outputs: {
    canceled_orders: {
      type: 'array',
      description: 'List of canceled order IDs and their status',
    },
    total_canceled: {
      type: 'number',
      description: 'Total number of orders canceled',
    },
  },
}
