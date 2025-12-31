import type { ToolConfig } from '@/tools/types'
import type { AlpacaSnapshot } from './types'
import { buildAlpacaDataUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetStockSnapshotParams {
  apiKey: string
  apiSecret: string
  symbols: string
  feed?: string
}

export interface AlpacaGetStockSnapshotResponse {
  success: boolean
  output: {
    snapshots: Record<string, AlpacaSnapshot>
  }
}

export const alpacaGetStockSnapshotTool: ToolConfig<
  AlpacaGetStockSnapshotParams,
  AlpacaGetStockSnapshotResponse
> = {
  id: 'alpaca_get_stock_snapshot',
  name: 'Get Stock Snapshots from Alpaca',
  description:
    'Get current market snapshot for stocks including latest trade, quote, and bar data',
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
    symbols: {
      type: 'string',
      required: true,
      description: 'Comma-separated list of symbols',
    },
    feed: {
      type: 'string',
      required: false,
      description: 'Data feed (iex, sip)',
    },
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      queryParams.append('symbols', params.symbols)
      if (params.feed) queryParams.append('feed', params.feed)
      return buildAlpacaDataUrl(`/v2/stocks/snapshots?${queryParams.toString()}`)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_stock_snapshot')
    }

    const data = await response.json()
    return {
      success: true,
      output: {
        snapshots: data || {},
      },
    }
  },

  outputs: {
    snapshots: {
      type: 'object',
      description: 'Snapshot data keyed by symbol',
    },
  },
}
