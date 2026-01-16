import type { ToolConfig } from '@/tools/types'
import type {
  CoinGeckoToolParams,
  CoinGeckoToolResponse,
  CoinGeckoPriceData,
  CoinGeckoCoinListItem,
  CoinGeckoMarketData,
  CoinGeckoTrendingCoin,
  CoinGeckoSearchResult,
  CoinGeckoGlobalData,
  CoinGeckoHistoricalData,
  CoinGeckoExchangeRates,
} from './types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

/**
 * Helper to make requests to CoinGecko API
 */
async function cgRequest(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<Response> {
  const url = new URL(`${COINGECKO_API_URL}${endpoint}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })
}

/**
 * Get simple price for coins
 */
async function getPrice(
  coinIds: string[],
  vsCurrencies: string[],
  includeMarketCap: boolean,
  include24hrVol: boolean,
  include24hrChange: boolean
): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/simple/price', {
    ids: coinIds.join(','),
    vs_currencies: vsCurrencies.join(','),
    include_market_cap: includeMarketCap.toString(),
    include_24hr_vol: include24hrVol.toString(),
    include_24hr_change: include24hrChange.toString(),
    include_last_updated_at: 'true',
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Price lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      prices: data as CoinGeckoPriceData,
    },
  }
}

/**
 * Get detailed coin information
 */
async function getCoin(coinId: string): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest(`/coins/${coinId}`, {
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Coin lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      coin: data,
    },
  }
}

/**
 * List all coins
 */
async function listCoins(): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/coins/list')

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `List coins failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      coins: data as CoinGeckoCoinListItem[],
    },
  }
}

/**
 * Get market data
 */
async function getMarkets(
  vsCurrency: string,
  order: string,
  perPage: number,
  page: number
): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/coins/markets', {
    vs_currency: vsCurrency,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'false',
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Markets lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      markets: data as CoinGeckoMarketData[],
    },
  }
}

/**
 * Get trending coins
 */
async function getTrending(): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/search/trending')

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Trending lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      trending: data.coins as CoinGeckoTrendingCoin[],
    },
  }
}

/**
 * Search for coins
 */
async function searchCoins(query: string): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/search', {
    query,
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Search failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      searchResults: data as CoinGeckoSearchResult,
    },
  }
}

/**
 * Get global market data
 */
async function getGlobal(): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/global')

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Global data failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      global: data as CoinGeckoGlobalData,
    },
  }
}

/**
 * Get historical data for a coin
 */
async function getHistory(coinId: string, date: string): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest(`/coins/${coinId}/history`, {
    date,
    localization: 'false',
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `History lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      history: data as CoinGeckoHistoricalData,
    },
  }
}

/**
 * Get OHLC data
 */
async function getOHLC(
  coinId: string,
  vsCurrency: string,
  days: string
): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest(`/coins/${coinId}/ohlc`, {
    vs_currency: vsCurrency,
    days,
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `OHLC lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      ohlc: data as Array<[number, number, number, number, number]>,
    },
  }
}

/**
 * Get exchange rates
 */
async function getExchangeRates(): Promise<CoinGeckoToolResponse> {
  const response = await cgRequest('/exchange_rates')

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Exchange rates failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      exchangeRates: data as CoinGeckoExchangeRates,
    },
  }
}

export const coingeckoTool: ToolConfig<CoinGeckoToolParams, CoinGeckoToolResponse> = {
  id: 'coingecko_api',
  name: 'CoinGecko API',
  description:
    'Get cryptocurrency prices, market data, trending coins, and historical data. Free, no API key required.',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description:
        'Operation: price, coin, coins_list, markets, trending, search, global, history, ohlc, exchange_rates',
    },
    coinIds: {
      type: 'array',
      required: false,
      description: 'Coin IDs for price lookup (comma-separated)',
    },
    coinId: {
      type: 'string',
      required: false,
      description: 'Single coin ID',
    },
    vsCurrencies: {
      type: 'array',
      required: false,
      description: 'Target currencies (default: usd)',
    },
    query: {
      type: 'string',
      required: false,
      description: 'Search query',
    },
    date: {
      type: 'string',
      required: false,
      description: 'Historical date (dd-mm-yyyy)',
    },
    days: {
      type: 'string',
      required: false,
      description: 'Number of days for OHLC (1, 7, 14, 30, 90, 180, 365, max)',
    },
    perPage: {
      type: 'number',
      required: false,
      description: 'Results per page (max 250)',
    },
    page: {
      type: 'number',
      required: false,
      description: 'Page number',
    },
    order: {
      type: 'string',
      required: false,
      description: 'Sort order for markets',
    },
    includeMarketCap: {
      type: 'boolean',
      required: false,
      description: 'Include market cap in price response',
    },
    include24hrVol: {
      type: 'boolean',
      required: false,
      description: 'Include 24h volume in price response',
    },
    include24hrChange: {
      type: 'boolean',
      required: false,
      description: 'Include 24h change in price response',
    },
  },

  directExecution: async (params: CoinGeckoToolParams): Promise<CoinGeckoToolResponse> => {
    const {
      operation,
      coinIds = ['bitcoin'],
      coinId = 'bitcoin',
      vsCurrencies = ['usd'],
      query,
      date,
      days = '7',
      perPage = 100,
      page = 1,
      order = 'market_cap_desc',
      includeMarketCap = true,
      include24hrVol = true,
      include24hrChange = true,
    } = params

    try {
      switch (operation) {
        case 'price':
          return await getPrice(coinIds, vsCurrencies, includeMarketCap, include24hrVol, include24hrChange)

        case 'coin':
          return await getCoin(coinId)

        case 'coins_list':
          return await listCoins()

        case 'markets':
          return await getMarkets(vsCurrencies[0] || 'usd', order, perPage, page)

        case 'trending':
          return await getTrending()

        case 'search':
          if (!query) {
            return {
              success: false,
              output: {
                error: 'Query is required for search operation',
              },
            }
          }
          return await searchCoins(query)

        case 'global':
          return await getGlobal()

        case 'history':
          if (!date) {
            return {
              success: false,
              output: {
                error: 'Date is required for history operation (format: dd-mm-yyyy)',
              },
            }
          }
          return await getHistory(coinId, date)

        case 'ohlc':
          return await getOHLC(coinId, vsCurrencies[0] || 'usd', days)

        case 'exchange_rates':
          return await getExchangeRates()

        default:
          return {
            success: false,
            output: {
              error: `Unknown operation: ${operation}`,
            },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    prices: { type: 'json', description: 'Price data for coins' },
    coin: { type: 'json', description: 'Detailed coin information' },
    coins: { type: 'array', description: 'List of all coins' },
    markets: { type: 'array', description: 'Market data for coins' },
    trending: { type: 'array', description: 'Trending coins' },
    searchResults: { type: 'json', description: 'Search results' },
    global: { type: 'json', description: 'Global market data' },
    history: { type: 'json', description: 'Historical price data' },
    ohlc: { type: 'array', description: 'OHLC candlestick data' },
    exchangeRates: { type: 'json', description: 'BTC exchange rates' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
