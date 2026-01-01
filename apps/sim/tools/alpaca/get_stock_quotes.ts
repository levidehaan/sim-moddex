import type { ToolConfig } from '@/tools/types'
import type { AlpacaQuote } from './types'
import { buildAlpacaDataUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetStockQuotesParams {
  apiKey: string
  apiSecret: string
  symbols: string
  start?: string
  end?: string
  limit?: number
  feed?: string
  sort?: string
}

export interface AlpacaGetStockQuotesResponse {
  success: boolean
  output: {
    quotes: Record<string, AlpacaQuote[]>
    next_page_token?: string
  }
}

export const alpacaGetStockQuotesTool: ToolConfig<
  AlpacaGetStockQuotesParams,
  AlpacaGetStockQuotesResponse
> = {
  id: 'alpaca_get_stock_quotes',
  name: 'Get Stock Quotes from Alpaca',
  description: 'Retrieve historical quote data (bid/ask) for one or more stock symbols',
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
      description: 'Comma-separated list of symbols (e.g., "AAPL,MSFT")',
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
      description: 'Maximum number of quotes per symbol',
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
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      queryParams.append('symbols', params.symbols)

      // Calculate default date range if not provided
      // Without a start date, Alpaca returns only current day data (empty if market closed)
      let startDate = params.start
      if (!startDate) {
        // Default to 7 days ago for quotes (intraday data)
        const defaultStart = new Date()
        defaultStart.setDate(defaultStart.getDate() - 7)
        startDate = defaultStart.toISOString().split('T')[0]
      }

      queryParams.append('start', startDate)
      if (params.end) queryParams.append('end', params.end)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.feed) queryParams.append('feed', params.feed)
      if (params.sort) queryParams.append('sort', params.sort)
      return buildAlpacaDataUrl(`/v2/stocks/quotes?${queryParams.toString()}`)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_stock_quotes')
    }

    const data = await response.json()
    return {
      success: true,
      output: {
        quotes: data.quotes || {},
        next_page_token: data.next_page_token,
      },
    }
  },

  outputs: {
    quotes: {
      type: 'object',
      description: 'Quote data keyed by symbol',
    },
    next_page_token: {
      type: 'string',
      description: 'Token for pagination',
    },
  },
}
