import type { ToolConfig } from '@/tools/types'
import type { AlpacaOrder } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaClosePositionParams {
  apiKey: string
  apiSecret: string
  symbol: string
  qty?: string
  percentage?: string
  paper?: boolean
}

export interface AlpacaClosePositionResponse {
  success: boolean
  output: {
    order: AlpacaOrder
  }
}

export const alpacaClosePositionTool: ToolConfig<
  AlpacaClosePositionParams,
  AlpacaClosePositionResponse
> = {
  id: 'alpaca_close_position',
  name: 'Close Position',
  description: 'Close an open position by symbol. Can close all or a partial position.',
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
    symbol: {
      type: 'string',
      required: true,
      description:
        'Symbol to close (stock symbol or OCC option symbol). Use {asset_id} format for options.',
    },
    qty: {
      type: 'string',
      required: false,
      description:
        'Number of shares/contracts to close (omit to close entire position). Mutually exclusive with percentage.',
    },
    percentage: {
      type: 'string',
      required: false,
      description:
        'Percentage of position to close (e.g., "50" for 50%). Mutually exclusive with qty.',
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
      if (params.qty) queryParams.append('qty', params.qty)
      if (params.percentage) queryParams.append('percentage', params.percentage)
      const query = queryParams.toString()
      return buildAlpacaTradingUrl(
        `/v2/positions/${encodeURIComponent(params.symbol)}${query ? `?${query}` : ''}`,
        params.paper
      )
    },
    method: 'DELETE',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'close_position')
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
      description: 'The closing order details',
    },
  },
}
