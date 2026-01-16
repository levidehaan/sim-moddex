import type { ToolConfig } from '@/tools/types'
import type { FinnhubToolParams, FinnhubToolResponse } from './types'

const FINNHUB_API_BASE = 'https://finnhub.io/api/v1'

async function makeRequest(endpoint: string, apiKey: string): Promise<unknown> {
  const separator = endpoint.includes('?') ? '&' : '?'
  const url = `${FINNHUB_API_BASE}${endpoint}${separator}token=${apiKey}`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Finnhub API error: ${error}`)
  }

  return response.json()
}

function dateToTimestamp(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000)
}

export const finnhubTool: ToolConfig<FinnhubToolParams, FinnhubToolResponse> = {
  id: 'finnhub_api',
  name: 'Finnhub API',
  description: 'Access real-time stock data, news, and market information',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform',
    },
    apiKey: {
      type: 'string',
      required: true,
      description: 'Finnhub API key',
    },
    symbol: {
      type: 'string',
      required: false,
      description: 'Stock ticker symbol',
    },
    query: {
      type: 'string',
      required: false,
      description: 'Search query',
    },
    fromDate: {
      type: 'string',
      required: false,
      description: 'Start date for candles (YYYY-MM-DD)',
    },
    toDate: {
      type: 'string',
      required: false,
      description: 'End date for candles (YYYY-MM-DD)',
    },
    resolution: {
      type: 'string',
      required: false,
      description: 'Candle resolution (1, 5, 15, 30, 60, D, W, M)',
    },
    newsFromDate: {
      type: 'string',
      required: false,
      description: 'Start date for news (YYYY-MM-DD)',
    },
    newsToDate: {
      type: 'string',
      required: false,
      description: 'End date for news (YYYY-MM-DD)',
    },
    exchange: {
      type: 'string',
      required: false,
      description: 'Exchange code for market status',
    },
  },

  directExecution: async (params: FinnhubToolParams): Promise<FinnhubToolResponse> => {
    try {
      const { operation, apiKey } = params

      if (!apiKey) {
        return {
          success: false,
          output: { error: 'API key is required' },
        }
      }

      switch (operation) {
        case 'quote': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for quote' },
            }
          }
          const quote = await makeRequest(`/quote?symbol=${params.symbol}`, apiKey)
          return {
            success: true,
            output: { quote: quote as FinnhubToolResponse['output']['quote'] },
          }
        }

        case 'profile': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for company profile' },
            }
          }
          const profile = await makeRequest(`/stock/profile2?symbol=${params.symbol}`, apiKey)
          return {
            success: true,
            output: { profile: profile as FinnhubToolResponse['output']['profile'] },
          }
        }

        case 'news': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for company news' },
            }
          }
          const from = params.newsFromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          const to = params.newsToDate || new Date().toISOString().split('T')[0]
          const news = await makeRequest(`/company-news?symbol=${params.symbol}&from=${from}&to=${to}`, apiKey)
          return {
            success: true,
            output: { news: news as FinnhubToolResponse['output']['news'] },
          }
        }

        case 'candles': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for candles' },
            }
          }
          const resolution = params.resolution || 'D'
          const from = params.fromDate ? dateToTimestamp(params.fromDate) : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
          const to = params.toDate ? dateToTimestamp(params.toDate) : Math.floor(Date.now() / 1000)
          const candles = await makeRequest(`/stock/candle?symbol=${params.symbol}&resolution=${resolution}&from=${from}&to=${to}`, apiKey)
          return {
            success: true,
            output: { candles: candles as FinnhubToolResponse['output']['candles'] },
          }
        }

        case 'earnings': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for earnings' },
            }
          }
          const earnings = await makeRequest(`/stock/earnings?symbol=${params.symbol}`, apiKey)
          return {
            success: true,
            output: { earnings: earnings as FinnhubToolResponse['output']['earnings'] },
          }
        }

        case 'insider': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for insider transactions' },
            }
          }
          const insider = await makeRequest(`/stock/insider-transactions?symbol=${params.symbol}`, apiKey)
          const data = insider as { data?: unknown[] }
          return {
            success: true,
            output: { insiderTransactions: (data.data || []) as FinnhubToolResponse['output']['insiderTransactions'] },
          }
        }

        case 'recommendations': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for recommendations' },
            }
          }
          const recommendations = await makeRequest(`/stock/recommendation?symbol=${params.symbol}`, apiKey)
          return {
            success: true,
            output: { recommendations: recommendations as FinnhubToolResponse['output']['recommendations'] },
          }
        }

        case 'price_target': {
          if (!params.symbol) {
            return {
              success: false,
              output: { error: 'Symbol is required for price target' },
            }
          }
          const priceTarget = await makeRequest(`/stock/price-target?symbol=${params.symbol}`, apiKey)
          return {
            success: true,
            output: { priceTarget: priceTarget as FinnhubToolResponse['output']['priceTarget'] },
          }
        }

        case 'search': {
          if (!params.query) {
            return {
              success: false,
              output: { error: 'Query is required for symbol search' },
            }
          }
          const searchResult = await makeRequest(`/search?q=${encodeURIComponent(params.query)}`, apiKey)
          const data = searchResult as { result?: unknown[] }
          return {
            success: true,
            output: { searchResults: (data.result || []) as FinnhubToolResponse['output']['searchResults'] },
          }
        }

        case 'market_status': {
          const exchange = params.exchange || 'US'
          const marketStatus = await makeRequest(`/stock/market-status?exchange=${exchange}`, apiKey)
          return {
            success: true,
            output: { marketStatus: marketStatus as FinnhubToolResponse['output']['marketStatus'] },
          }
        }

        default:
          return {
            success: false,
            output: { error: `Unknown operation: ${operation}` },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    quote: { type: 'json', description: 'Stock quote data' },
    profile: { type: 'json', description: 'Company profile' },
    news: { type: 'array', description: 'Company news articles' },
    candles: { type: 'json', description: 'Stock candle data' },
    earnings: { type: 'array', description: 'Earnings calendar' },
    insiderTransactions: { type: 'array', description: 'Insider transactions' },
    recommendations: { type: 'array', description: 'Analyst recommendations' },
    priceTarget: { type: 'json', description: 'Price target consensus' },
    searchResults: { type: 'array', description: 'Symbol search results' },
    marketStatus: { type: 'json', description: 'Market status' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
