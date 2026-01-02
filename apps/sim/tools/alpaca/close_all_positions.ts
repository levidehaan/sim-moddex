import type { ToolConfig } from '@/tools/types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaCloseAllPositionsParams {
  apiKey: string
  apiSecret: string
  cancel_orders?: boolean
  paper?: boolean
}

export interface AlpacaCloseAllPositionsResponse {
  success: boolean
  output: {
    closed_positions: Array<{
      symbol: string
      status: number
      body?: any
    }>
    total_closed: number
  }
}

export const alpacaCloseAllPositionsTool: ToolConfig<
  AlpacaCloseAllPositionsParams,
  AlpacaCloseAllPositionsResponse
> = {
  id: 'alpaca_close_all_positions',
  name: 'Close All Positions',
  description: 'Close all open positions (liquidate portfolio)',
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
    cancel_orders: {
      type: 'boolean',
      required: false,
      description: 'Also cancel all open orders before closing positions',
    },
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading environment',
    },
  },

  request: {
    url: (params) => {
      const query = params.cancel_orders ? '?cancel_orders=true' : ''
      return buildAlpacaTradingUrl(`/v2/positions${query}`, params.paper)
    },
    method: 'DELETE',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'close_all_positions')
    }

    const data = await response.json()
    return {
      success: true,
      output: {
        closed_positions: data || [],
        total_closed: data?.length || 0,
      },
    }
  },

  outputs: {
    closed_positions: {
      type: 'array',
      description: 'List of closed positions with their status',
    },
    total_closed: {
      type: 'number',
      description: 'Total number of positions closed',
    },
  },
}
