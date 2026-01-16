/**
 * CoinGecko API Tool Types
 */

export type CoinGeckoOperation =
  | 'price'
  | 'coin'
  | 'coins_list'
  | 'markets'
  | 'trending'
  | 'search'
  | 'global'
  | 'history'
  | 'ohlc'
  | 'exchange_rates'

export interface CoinGeckoToolParams {
  operation: CoinGeckoOperation
  coinIds?: string[]
  coinId?: string
  vsCurrencies?: string[]
  query?: string
  date?: string
  days?: string
  perPage?: number
  page?: number
  order?: string
  includeMarketCap?: boolean
  include24hrVol?: boolean
  include24hrChange?: boolean
}

export interface CoinGeckoPriceData {
  [coinId: string]: {
    [currency: string]: number
    [key: `${string}_market_cap`]: number
    [key: `${string}_24h_vol`]: number
    [key: `${string}_24h_change`]: number
    last_updated_at?: number
  }
}

export interface CoinGeckoCoinListItem {
  id: string
  symbol: string
  name: string
}

export interface CoinGeckoMarketData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number | null
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

export interface CoinGeckoTrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    small: string
    large: string
    slug: string
    price_btc: number
    score: number
  }
}

export interface CoinGeckoSearchResult {
  coins: Array<{
    id: string
    name: string
    api_symbol: string
    symbol: string
    market_cap_rank: number | null
    thumb: string
    large: string
  }>
  exchanges: Array<{
    id: string
    name: string
    market_type: string
    thumb: string
    large: string
  }>
  categories: Array<{
    id: number
    name: string
  }>
  nfts: Array<{
    id: string
    name: string
    symbol: string
    thumb: string
  }>
}

export interface CoinGeckoGlobalData {
  data: {
    active_cryptocurrencies: number
    upcoming_icos: number
    ongoing_icos: number
    ended_icos: number
    markets: number
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_percentage: Record<string, number>
    market_cap_change_percentage_24h_usd: number
    updated_at: number
  }
}

export interface CoinGeckoHistoricalData {
  id: string
  symbol: string
  name: string
  market_data: {
    current_price: Record<string, number>
    market_cap: Record<string, number>
    total_volume: Record<string, number>
  }
}

export interface CoinGeckoOHLC {
  // [timestamp, open, high, low, close]
  data: Array<[number, number, number, number, number]>
}

export interface CoinGeckoExchangeRates {
  rates: Record<string, {
    name: string
    unit: string
    value: number
    type: string
  }>
}

export interface CoinGeckoToolResponse {
  success: boolean
  output: {
    prices?: CoinGeckoPriceData
    coin?: Record<string, unknown>
    coins?: CoinGeckoCoinListItem[]
    markets?: CoinGeckoMarketData[]
    trending?: CoinGeckoTrendingCoin[]
    searchResults?: CoinGeckoSearchResult
    global?: CoinGeckoGlobalData
    history?: CoinGeckoHistoricalData
    ohlc?: Array<[number, number, number, number, number]>
    exchangeRates?: CoinGeckoExchangeRates
    error?: string
  }
}
