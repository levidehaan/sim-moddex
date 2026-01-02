import type { ToolConfig } from '@/tools/types'
import type { WebullQuote } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_QUOTES_API_URL } from './types'

export interface WebullGetQuoteParams {
  accessToken: string
  deviceId: string
  symbol: string
}

export interface WebullGetQuoteResponse {
  success: boolean
  output: {
    quote: WebullQuote
    tickerId: string
  }
}

export const webullGetQuoteTool: ToolConfig<WebullGetQuoteParams, WebullGetQuoteResponse> = {
  id: 'webull_get_quote',
  name: 'Get Quote',
  description:
    'Get real-time quote for a stock symbol. Also returns the tickerId needed for placing orders.',
  version: '1.0.0',

  params: {
    accessToken: {
      type: 'string',
      required: true,
      description: 'Webull OAuth access token',
    },
    deviceId: {
      type: 'string',
      required: true,
      description: 'Webull device ID',
    },
    symbol: {
      type: 'string',
      required: true,
      description: 'Stock symbol (e.g., "AAPL", "MSFT")',
    },
  },

  request: {
    url: (params) =>
      `${WEBULL_QUOTES_API_URL}/v1/ticker/search?keyword=${encodeURIComponent(params.symbol)}`,
    method: 'GET',
    headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleWebullError(data, response.status, 'get_quote')
    }

    const data = await response.json()
    const results = data.data || data || []
    const quote = results[0] || {}

    return {
      success: true,
      output: {
        quote,
        tickerId: quote.tickerId || '',
      },
    }
  },

  outputs: {
    quote: {
      type: 'object',
      description: 'Quote data including price, volume, and fundamentals',
    },
    tickerId: {
      type: 'string',
      description: 'Ticker ID needed for placing orders',
    },
  },
}
