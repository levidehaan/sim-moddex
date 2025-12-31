/**
 * Alpaca Markets API Types
 */

export const ALPACA_DATA_BASE_URL = 'https://data.alpaca.markets'
export const ALPACA_TRADING_BASE_URL = 'https://api.alpaca.markets'
export const ALPACA_PAPER_TRADING_BASE_URL = 'https://paper-api.alpaca.markets'

export interface AlpacaBar {
  t: string // Timestamp
  o: number // Open
  h: number // High
  l: number // Low
  c: number // Close
  v: number // Volume
  n: number // Number of trades
  vw: number // Volume weighted average price
}

export interface AlpacaQuote {
  t: string // Timestamp
  ax: string // Ask exchange
  ap: number // Ask price
  as: number // Ask size
  bx: string // Bid exchange
  bp: number // Bid price
  bs: number // Bid size
  c: string[] // Conditions
}

export interface AlpacaTrade {
  t: string // Timestamp
  x: string // Exchange
  p: number // Price
  s: number // Size
  c: string[] // Conditions
  i: number // Trade ID
  z: string // Tape
}

export interface AlpacaSnapshot {
  latestTrade: AlpacaTrade
  latestQuote: AlpacaQuote
  minuteBar: AlpacaBar
  dailyBar: AlpacaBar
  prevDailyBar: AlpacaBar
}

export interface AlpacaOptionContract {
  id: string
  symbol: string
  name: string
  status: string
  tradable: boolean
  expiration_date: string
  root_symbol: string
  underlying_symbol: string
  underlying_asset_id: string
  type: 'call' | 'put'
  style: 'american' | 'european'
  strike_price: string
  multiplier: string
  size: string
  open_interest: string
  open_interest_date: string
  close_price: string
  close_price_date: string
}

export interface AlpacaOptionBar {
  t: string
  o: number
  h: number
  l: number
  c: number
  v: number
  n: number
  vw: number
}

export interface AlpacaOptionQuote {
  t: string
  ax: string
  ap: number
  as: number
  bx: string
  bp: number
  bs: number
}

export interface AlpacaOptionTrade {
  t: string
  x: string
  p: number
  s: number
  c: string
}

export interface AlpacaAccount {
  id: string
  account_number: string
  status: string
  crypto_status: string
  currency: string
  buying_power: string
  regt_buying_power: string
  daytrading_buying_power: string
  non_marginable_buying_power: string
  cash: string
  accrued_fees: string
  pending_transfer_out: string
  pending_transfer_in: string
  portfolio_value: string
  pattern_day_trader: boolean
  trading_blocked: boolean
  transfers_blocked: boolean
  account_blocked: boolean
  created_at: string
  trade_suspended_by_user: boolean
  multiplier: string
  shorting_enabled: boolean
  equity: string
  last_equity: string
  long_market_value: string
  short_market_value: string
  position_market_value: string
  initial_margin: string
  maintenance_margin: string
  last_maintenance_margin: string
  sma: string
  daytrade_count: number
  options_buying_power: string
  options_approved_level: number
  options_trading_level: number
}

export interface AlpacaPosition {
  asset_id: string
  symbol: string
  exchange: string
  asset_class: string
  asset_marginable: boolean
  qty: string
  avg_entry_price: string
  side: string
  market_value: string
  cost_basis: string
  unrealized_pl: string
  unrealized_plpc: string
  unrealized_intraday_pl: string
  unrealized_intraday_plpc: string
  current_price: string
  lastday_price: string
  change_today: string
}

export interface AlpacaOrder {
  id: string
  client_order_id: string
  created_at: string
  updated_at: string
  submitted_at: string
  filled_at: string | null
  expired_at: string | null
  canceled_at: string | null
  failed_at: string | null
  replaced_at: string | null
  replaced_by: string | null
  replaces: string | null
  asset_id: string
  symbol: string
  asset_class: string
  notional: string | null
  qty: string
  filled_qty: string
  filled_avg_price: string | null
  order_class: string
  order_type: string
  type: string
  side: string
  time_in_force: string
  limit_price: string | null
  stop_price: string | null
  status: string
  extended_hours: boolean
  legs: AlpacaOrder[] | null
  trail_percent: string | null
  trail_price: string | null
  hwm: string | null
}

export function buildAlpacaDataUrl(path: string): string {
  return `${ALPACA_DATA_BASE_URL}${path}`
}

export function buildAlpacaTradingUrl(path: string, paper: boolean = false): string {
  const baseUrl = paper ? ALPACA_PAPER_TRADING_BASE_URL : ALPACA_TRADING_BASE_URL
  return `${baseUrl}${path}`
}

export function getAlpacaHeaders(apiKey: string, apiSecret: string): Record<string, string> {
  return {
    'APCA-API-KEY-ID': apiKey,
    'APCA-API-SECRET-KEY': apiSecret,
    'Content-Type': 'application/json',
  }
}

export function handleAlpacaError(data: any, status: number, operation: string): never {
  const message = data?.message || data?.error || `Alpaca API error: ${status}`
  throw new Error(`Alpaca ${operation} failed: ${message}`)
}
