import type { ToolConfig } from '@/tools/types'
import type { AlpacaPosition } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetPositionsParams {
  apiKey: string
  apiSecret: string
  paper?: boolean
}

export interface AlpacaGetPositionsResponse {
  success: boolean
  output: {
    positions: AlpacaPosition[]
  }
}

export const alpacaGetPositionsTool: ToolConfig<
  AlpacaGetPositionsParams,
  AlpacaGetPositionsResponse
> = {
  id: 'alpaca_get_positions',
  name: 'Get Alpaca Positions',
  description: 'Retrieve all open positions in the account',
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
      description: 'Use paper trading API (default: false)',
    },
  },

  request: {
    url: (params) => buildAlpacaTradingUrl('/v2/positions', params.paper),
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_positions')
    }

    const positions = await response.json()
    return {
      success: true,
      output: {
        positions,
      },
    }
  },

  outputs: {
    positions: {
      type: 'array',
      description: 'List of open positions',
    },
  },
}
