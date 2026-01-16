export type FinnhubOperation =
  | 'quote'
  | 'profile'
  | 'news'
  | 'candles'
  | 'earnings'
  | 'insider'
  | 'recommendations'
  | 'price_target'
  | 'search'
  | 'market_status'

export interface FinnhubToolParams {
  operation: FinnhubOperation
  apiKey: string
  symbol?: string
  query?: string
  fromDate?: string
  toDate?: string
  resolution?: string
  newsFromDate?: string
  newsToDate?: string
  exchange?: string
}

export interface FinnhubQuote {
  c: number  // Current price
  d: number  // Change
  dp: number // Percent change
  h: number  // High price of the day
  l: number  // Low price of the day
  o: number  // Open price of the day
  pc: number // Previous close price
  t: number  // Timestamp
}

export interface FinnhubProfile {
  country: string
  currency: string
  exchange: string
  finnhubIndustry: string
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
}

export interface FinnhubNews {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export interface FinnhubCandles {
  c: number[]  // Close prices
  h: number[]  // High prices
  l: number[]  // Low prices
  o: number[]  // Open prices
  s: string    // Status
  t: number[]  // Timestamps
  v: number[]  // Volumes
}

export interface FinnhubEarning {
  actual: number | null
  estimate: number | null
  period: string
  quarter: number
  surprise: number | null
  surprisePercent: number | null
  symbol: string
  year: number
}

export interface FinnhubInsiderTransaction {
  name: string
  share: number
  change: number
  filingDate: string
  transactionDate: string
  transactionCode: string
  transactionPrice: number
}

export interface FinnhubRecommendation {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

export interface FinnhubPriceTarget {
  lastUpdated: string
  symbol: string
  targetHigh: number
  targetLow: number
  targetMean: number
  targetMedian: number
}

export interface FinnhubSearchResult {
  description: string
  displaySymbol: string
  symbol: string
  type: string
}

export interface FinnhubMarketStatus {
  exchange: string
  holiday: string | null
  isOpen: boolean
  session: string
  timezone: string
  t: number
}

export interface FinnhubToolResponse {
  success: boolean
  output: {
    quote?: FinnhubQuote
    profile?: FinnhubProfile
    news?: FinnhubNews[]
    candles?: FinnhubCandles
    earnings?: FinnhubEarning[]
    insiderTransactions?: FinnhubInsiderTransaction[]
    recommendations?: FinnhubRecommendation[]
    priceTarget?: FinnhubPriceTarget
    searchResults?: FinnhubSearchResult[]
    marketStatus?: FinnhubMarketStatus
    error?: string
  }
}
