import type { ToolConfig } from '@/tools/types'
import type { AlpacaOptionBar } from './types'
import { buildAlpacaDataUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetOptionBarsParams {
  apiKey: string
  apiSecret: string
  symbols: string
  timeframe: string
  start?: string
  end?: string
  limit?: number
  sort?: string
  format?: string
}

export interface AlpacaGetOptionBarsResponse {
  success: boolean
  output: {
    bars: Record<string, AlpacaOptionBar[]>
    next_page_token?: string
    csv?: string
  }
}

export const alpacaGetOptionBarsTool: ToolConfig<
  AlpacaGetOptionBarsParams,
  AlpacaGetOptionBarsResponse
> = {
  id: 'alpaca_get_option_bars',
  name: 'Get Option Bars from Alpaca',
  description: 'Retrieve historical bar data for option contracts',
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
      description: 'Comma-separated option symbols (e.g., "AAPL240119C00150000")',
    },
    timeframe: {
      type: 'string',
      required: true,
      description: 'Bar timeframe (1Min, 5Min, 15Min, 30Min, 1Hour, 1Day)',
    },
    start: {
      type: 'string',
      required: false,
      description: 'Start date/time (RFC-3339 format)',
    },
    end: {
      type: 'string',
      required: false,
      description: 'End date/time (RFC-3339 format)',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of bars per symbol',
    },
    sort: {
      type: 'string',
      required: false,
      description: 'Sort order (asc, desc)',
    },
    format: {
      type: 'string',
      required: false,
      description: 'Output format (json, csv)',
    },
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      queryParams.append('symbols', params.symbols)
      queryParams.append('timeframe', params.timeframe)

      // Calculate default date range if not provided
      // Without a start date, Alpaca returns only current day data (empty if market closed)
      const now = new Date()
      let startDate = params.start

      if (!startDate) {
        // For intraday timeframes, default to 7 days ago
        // For daily, default to 30 days ago
        const isIntraday = ['1Min', '5Min', '15Min', '30Min', '1Hour'].includes(params.timeframe)
        const daysBack = isIntraday ? 7 : 30
        const defaultStart = new Date(now)
        defaultStart.setDate(defaultStart.getDate() - daysBack)
        startDate = defaultStart.toISOString().split('T')[0]
      }

      queryParams.append('start', startDate)
      if (params.end) queryParams.append('end', params.end)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.sort) queryParams.append('sort', params.sort)
      return buildAlpacaDataUrl(`/v1beta1/options/bars?${queryParams.toString()}`)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response, params) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_option_bars')
    }

    const data = await response.json()

    if (params?.format === 'csv') {
      const csvRows: string[] = ['symbol,timestamp,open,high,low,close,volume,vwap,trades']
      for (const [symbol, bars] of Object.entries(data.bars || {})) {
        for (const bar of bars as AlpacaOptionBar[]) {
          csvRows.push(
            `${symbol},${bar.t},${bar.o},${bar.h},${bar.l},${bar.c},${bar.v},${bar.vw},${bar.n}`
          )
        }
      }
      return {
        success: true,
        output: {
          bars: data.bars || {},
          next_page_token: data.next_page_token,
          csv: csvRows.join('\n'),
        },
      }
    }

    return {
      success: true,
      output: {
        bars: data.bars || {},
        next_page_token: data.next_page_token,
      },
    }
  },

  outputs: {
    bars: {
      type: 'object',
      description: 'Option bar data keyed by symbol',
    },
    next_page_token: {
      type: 'string',
      description: 'Token for pagination',
    },
    csv: {
      type: 'string',
      description: 'CSV formatted data',
    },
  },
}
