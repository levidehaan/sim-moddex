import type { ToolConfig } from '@/tools/types'
import type { AlpacaOrder } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaSubmitOrderParams {
  apiKey: string
  apiSecret: string
  symbol: string
  qty?: string
  notional?: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop'
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok'
  limit_price?: string
  stop_price?: string
  trail_price?: string
  trail_percent?: string
  extended_hours?: boolean
  client_order_id?: string
  order_class?: 'simple' | 'bracket' | 'oco' | 'oto'
  take_profit_limit_price?: string
  stop_loss_stop_price?: string
  stop_loss_limit_price?: string
  paper?: boolean
}

export interface AlpacaSubmitOrderResponse {
  success: boolean
  output: {
    order: AlpacaOrder
  }
}

export const alpacaSubmitOrderTool: ToolConfig<AlpacaSubmitOrderParams, AlpacaSubmitOrderResponse> =
  {
    id: 'alpaca_submit_order',
    name: 'Submit Stock Order',
    description:
      'Submit a new stock order (market, limit, stop, stop_limit, or trailing_stop). Supports bracket and OCO orders.',
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
      symbol: {
        type: 'string',
        required: true,
        description: 'Stock symbol (e.g., "AAPL", "MSFT")',
      },
      qty: {
        type: 'string',
        required: false,
        description: 'Number of shares to trade (mutually exclusive with notional)',
      },
      notional: {
        type: 'string',
        required: false,
        description: 'Dollar amount to trade (mutually exclusive with qty)',
      },
      side: {
        type: 'string',
        required: true,
        description: 'Order side: "buy" or "sell"',
      },
      type: {
        type: 'string',
        required: true,
        description: 'Order type: market, limit, stop, stop_limit, or trailing_stop',
      },
      time_in_force: {
        type: 'string',
        required: true,
        description:
          'Time in force: day (day only), gtc (good til canceled), opg (market open), cls (market close), ioc (immediate or cancel), fok (fill or kill)',
      },
      limit_price: {
        type: 'string',
        required: false,
        description: 'Limit price (required for limit and stop_limit orders)',
      },
      stop_price: {
        type: 'string',
        required: false,
        description: 'Stop price (required for stop and stop_limit orders)',
      },
      trail_price: {
        type: 'string',
        required: false,
        description: 'Trail price in dollars (for trailing_stop orders)',
      },
      trail_percent: {
        type: 'string',
        required: false,
        description: 'Trail percent (for trailing_stop orders)',
      },
      extended_hours: {
        type: 'boolean',
        required: false,
        description: 'Allow trading during extended hours (pre-market/after-hours)',
      },
      client_order_id: {
        type: 'string',
        required: false,
        description: 'Custom client order ID (max 48 chars)',
      },
      order_class: {
        type: 'string',
        required: false,
        description: 'Order class: simple, bracket, oco, or oto',
      },
      take_profit_limit_price: {
        type: 'string',
        required: false,
        description: 'Take profit limit price (for bracket/oco orders)',
      },
      stop_loss_stop_price: {
        type: 'string',
        required: false,
        description: 'Stop loss stop price (for bracket/oco orders)',
      },
      stop_loss_limit_price: {
        type: 'string',
        required: false,
        description: 'Stop loss limit price (for bracket/oco stop_limit orders)',
      },
      paper: {
        type: 'boolean',
        required: false,
        description: 'Use paper trading environment',
      },
    },

    request: {
      url: (params) => buildAlpacaTradingUrl('/v2/orders', params.paper),
      method: 'POST',
      headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
      body: (params) => {
        const body: Record<string, any> = {
          symbol: params.symbol,
          side: params.side,
          type: params.type,
          time_in_force: params.time_in_force,
        }

        // Quantity or notional (mutually exclusive)
        if (params.qty) body.qty = params.qty
        if (params.notional) body.notional = params.notional

        // Price parameters
        if (params.limit_price) body.limit_price = params.limit_price
        if (params.stop_price) body.stop_price = params.stop_price
        if (params.trail_price) body.trail_price = params.trail_price
        if (params.trail_percent) body.trail_percent = params.trail_percent

        // Optional parameters
        if (params.extended_hours !== undefined) body.extended_hours = params.extended_hours
        if (params.client_order_id) body.client_order_id = params.client_order_id
        if (params.order_class) body.order_class = params.order_class

        // Bracket/OCO order parameters
        if (params.take_profit_limit_price) {
          body.take_profit = { limit_price: params.take_profit_limit_price }
        }
        if (params.stop_loss_stop_price) {
          body.stop_loss = {
            stop_price: params.stop_loss_stop_price,
            ...(params.stop_loss_limit_price && { limit_price: params.stop_loss_limit_price }),
          }
        }

        return body
      },
    },

    transformResponse: async (response: Response) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        handleAlpacaError(data, response.status, 'submit_order')
      }

      const order = await response.json()
      return {
        success: true,
        output: { order },
      }
    },

    outputs: {
      order: {
        type: 'object',
        description: 'The submitted order details',
      },
    },
  }
