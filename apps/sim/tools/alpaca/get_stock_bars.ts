import type { ToolConfig } from '@/tools/types'
import type { AlpacaBar } from './types'
import { buildAlpacaDataUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetStockBarsParams {
  apiKey: string
  apiSecret: string
  symbols: string
  timeframe: string
  start?: string
  end?: string
  limit?: number
  adjustment?: string
  feed?: string
  sort?: string
  format?: string
}

export interface AlpacaGetStockBarsResponse {
  success: boolean
  output: {
    bars: Record<string, AlpacaBar[]>
    next_page_token?: string
    csv?: string
  }
}

export const alpacaGetStockBarsTool: ToolConfig<
  AlpacaGetStockBarsParams,
  AlpacaGetStockBarsResponse
> = {
  id: 'alpaca_get_stock_bars',
  name: 'Get Stock Bars from Alpaca',
  description: 'Retrieve historical bar data (OHLCV) for one or more stock symbols',
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
      description: 'Comma-separated list of symbols (e.g., "AAPL,MSFT,GOOGL")',
    },
    timeframe: {
      type: 'string',
      required: true,
      description: 'Bar timeframe (1Min, 5Min, 15Min, 30Min, 1Hour, 1Day, 1Week, 1Month)',
    },
    start: {
      type: 'string',
      required: false,
      description: 'Start date/time (RFC-3339 format or YYYY-MM-DD)',
    },
    end: {
      type: 'string',
      required: false,
      description: 'End date/time (RFC-3339 format or YYYY-MM-DD)',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of bars per symbol (default: 1000, max: 10000)',
    },
    adjustment: {
      type: 'string',
      required: false,
      description: 'Price adjustment (raw, split, dividend, all)',
    },
    feed: {
      type: 'string',
      required: false,
      description: 'Data feed (iex, sip)',
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
      const endDate = params.end

      if (!startDate) {
        // For intraday timeframes, default to 7 days ago (IEX limit)
        // For daily/weekly/monthly, default to 30 days ago
        const isIntraday = ['1Min', '5Min', '15Min', '30Min', '1Hour'].includes(params.timeframe)
        const daysBack = isIntraday ? 7 : 30
        const defaultStart = new Date(now)
        defaultStart.setDate(defaultStart.getDate() - daysBack)
        startDate = defaultStart.toISOString().split('T')[0]
      }

      queryParams.append('start', startDate)
      if (endDate) queryParams.append('end', endDate)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.adjustment) queryParams.append('adjustment', params.adjustment)
      if (params.feed) queryParams.append('feed', params.feed)
      if (params.sort) queryParams.append('sort', params.sort)
      return buildAlpacaDataUrl(`/v2/stocks/bars?${queryParams.toString()}`)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response, params) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_stock_bars')
    }

    const data = await response.json()

    // If CSV format requested, convert to CSV
    if (params?.format === 'csv') {
      const csvRows: string[] = ['symbol,timestamp,open,high,low,close,volume,vwap,trades']
      for (const [symbol, bars] of Object.entries(data.bars || {})) {
        for (const bar of bars as AlpacaBar[]) {
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
      description: 'Bar data keyed by symbol',
    },
    next_page_token: {
      type: 'string',
      description: 'Token for pagination',
    },
    csv: {
      type: 'string',
      description: 'CSV formatted data (if format=csv)',
    },
  },
}
