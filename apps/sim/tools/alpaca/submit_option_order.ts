import type { ToolConfig } from '@/tools/types'
import type { AlpacaOrder } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaSubmitOptionOrderParams {
  apiKey: string
  apiSecret: string
  symbol: string
  qty: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop' | 'stop_limit'
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok'
  limit_price?: string
  stop_price?: string
  client_order_id?: string
  paper?: boolean
}

export interface AlpacaSubmitOptionOrderResponse {
  success: boolean
  output: {
    order: AlpacaOrder
  }
}

export const alpacaSubmitOptionOrderTool: ToolConfig<
  AlpacaSubmitOptionOrderParams,
  AlpacaSubmitOptionOrderResponse
> = {
  id: 'alpaca_submit_option_order',
  name: 'Submit Option Order',
  description:
    'Submit a new option order. Use the full OCC option symbol (e.g., "AAPL240119C00150000" for AAPL $150 call expiring Jan 19, 2024).',
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
      description:
        'OCC option symbol (e.g., "AAPL240119C00150000" = AAPL $150 call exp 2024-01-19)',
    },
    qty: {
      type: 'string',
      required: true,
      description: 'Number of contracts to trade',
    },
    side: {
      type: 'string',
      required: true,
      description: 'Order side: "buy" (to open/close long) or "sell" (to open/close short)',
    },
    type: {
      type: 'string',
      required: true,
      description: 'Order type: market, limit, stop, or stop_limit',
    },
    time_in_force: {
      type: 'string',
      required: true,
      description: 'Time in force: day, gtc, ioc, or fok',
    },
    limit_price: {
      type: 'string',
      required: false,
      description: 'Limit price per contract (required for limit and stop_limit orders)',
    },
    stop_price: {
      type: 'string',
      required: false,
      description: 'Stop price per contract (required for stop and stop_limit orders)',
    },
    client_order_id: {
      type: 'string',
      required: false,
      description: 'Custom client order ID (max 48 chars)',
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
        qty: params.qty,
        side: params.side,
        type: params.type,
        time_in_force: params.time_in_force,
      }

      if (params.limit_price) body.limit_price = params.limit_price
      if (params.stop_price) body.stop_price = params.stop_price
      if (params.client_order_id) body.client_order_id = params.client_order_id

      return body
    },
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'submit_option_order')
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
      description: 'The submitted option order details',
    },
  },
}
