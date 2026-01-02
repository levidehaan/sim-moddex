/**
 * Webull API Types
 * Based on official Webull OpenAPI documentation
 * @see https://developer.webull.com/api-doc/
 */

export const WEBULL_API_BASE_URL = 'https://api.webull.com'
export const WEBULL_TRADE_API_URL = 'https://api.webull.com/api/trade'
export const WEBULL_QUOTES_API_URL = 'https://api.webull.com/api/quote'

export interface WebullAccount {
  secAccountId: string
  accountType: string
  currency: string
  netLiquidation: string
  totalCash: string
  totalMarketValue: string
  dayBuyingPower: string
  overnightBuyingPower: string
  dayTradingBuyingPower: string
  settledCash: string
  unsettledCash: string
}

export interface WebullPosition {
  tickerId: string
  ticker: {
    tickerId: string
    symbol: string
    name: string
    exchangeCode: string
    type: string
  }
  position: string
  avgCost: string
  marketValue: string
  unrealizedProfitLoss: string
  unrealizedProfitLossRate: string
  lastPrice: string
}

export interface WebullOrder {
  orderId: string
  ticker: {
    tickerId: string
    symbol: string
    name: string
  }
  action: 'BUY' | 'SELL'
  orderType: 'LMT' | 'MKT' | 'STP' | 'STP LMT'
  timeInForce: 'GTC' | 'DAY' | 'IOC' | 'FOK'
  quantity: string
  filledQuantity: string
  avgFilledPrice: string
  lmtPrice?: string
  auxPrice?: string
  status: string
  statusStr: string
  createTime: string
  updateTime: string
}

export interface WebullOptionOrder {
  orderId: string
  optionSymbol: string
  underlyingSymbol: string
  action: 'BUY' | 'SELL'
  orderType: 'LMT' | 'MKT'
  quantity: string
  filledQuantity: string
  avgFilledPrice: string
  lmtPrice?: string
  status: string
  createTime: string
}

export interface WebullQuote {
  tickerId: string
  symbol: string
  name: string
  close: string
  open: string
  high: string
  low: string
  volume: string
  change: string
  changeRatio: string
  marketValue: string
  turnoverRate: string
  vibrateRatio: string
  avgVol10D: string
  avgVol3M: string
  pe: string
  forwardPe: string
  pb: string
  ps: string
  bps: string
  peTtm: string
  eps: string
  epsTtm: string
  fiftyTwoWkHigh: string
  fiftyTwoWkLow: string
  yield: string
  dividend: string
  tradeTime: string
}

export interface WebullOptionChain {
  symbol: string
  expirationDates: string[]
  strikes: WebullOptionStrike[]
}

export interface WebullOptionStrike {
  strikePrice: string
  call?: WebullOptionContract
  put?: WebullOptionContract
}

export interface WebullOptionContract {
  tickerId: string
  symbol: string
  strikePrice: string
  expireDate: string
  direction: 'call' | 'put'
  lastPrice: string
  bid: string
  ask: string
  volume: string
  openInterest: string
  impliedVolatility: string
  delta: string
  gamma: string
  theta: string
  vega: string
}

export function getWebullHeaders(accessToken: string, deviceId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    did: deviceId,
    'Accept-Language': 'en-US',
  }
}

export function handleWebullError(data: any, status: number, operation: string): never {
  const message = data?.msg || data?.message || data?.error || `Webull API error: ${status}`
  throw new Error(`Webull ${operation} failed: ${message}`)
}
