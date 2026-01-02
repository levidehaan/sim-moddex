import type { ToolConfig } from '@/tools/types'
import type { AlpacaPosition } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetPositionParams {
  apiKey: string
  apiSecret: string
  symbol: string
  paper?: boolean
}

export interface AlpacaGetPositionResponse {
  success: boolean
  output: {
    position: AlpacaPosition
  }
}

export const alpacaGetPositionTool: ToolConfig<AlpacaGetPositionParams, AlpacaGetPositionResponse> =
  {
    id: 'alpaca_get_position',
    name: 'Get Position',
    description: 'Get details of a specific open position by symbol',
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
        description: 'Stock symbol or OCC option symbol',
      },
      paper: {
        type: 'boolean',
        required: false,
        description: 'Use paper trading environment',
      },
    },

    request: {
      url: (params) =>
        buildAlpacaTradingUrl(`/v2/positions/${encodeURIComponent(params.symbol)}`, params.paper),
      method: 'GET',
      headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
    },

    transformResponse: async (response: Response) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        handleAlpacaError(data, response.status, 'get_position')
      }

      const position = await response.json()
      return {
        success: true,
        output: { position },
      }
    },

    outputs: {
      position: {
        type: 'object',
        description: 'The position details',
      },
    },
  }
