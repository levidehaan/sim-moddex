import type { ToolConfig } from '@/tools/types'
import type { AlpacaOrder } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaReplaceOrderParams {
  apiKey: string
  apiSecret: string
  order_id: string
  qty?: string
  time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok'
  limit_price?: string
  stop_price?: string
  trail?: string
  client_order_id?: string
  paper?: boolean
}

export interface AlpacaReplaceOrderResponse {
  success: boolean
  output: {
    order: AlpacaOrder
  }
}

export const alpacaReplaceOrderTool: ToolConfig<
  AlpacaReplaceOrderParams,
  AlpacaReplaceOrderResponse
> = {
  id: 'alpaca_replace_order',
  name: 'Replace Order',
  description: 'Modify an existing open order (quantity, price, or time in force)',
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
    order_id: {
      type: 'string',
      required: true,
      description: 'The order ID to replace',
    },
    qty: {
      type: 'string',
      required: false,
      description: 'New number of shares',
    },
    time_in_force: {
      type: 'string',
      required: false,
      description: 'New time in force: day, gtc, opg, cls, ioc, or fok',
    },
    limit_price: {
      type: 'string',
      required: false,
      description: 'New limit price',
    },
    stop_price: {
      type: 'string',
      required: false,
      description: 'New stop price',
    },
    trail: {
      type: 'string',
      required: false,
      description: 'New trail price or percent for trailing stop orders',
    },
    client_order_id: {
      type: 'string',
      required: false,
      description: 'New client order ID',
    },
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading environment',
    },
  },

  request: {
    url: (params) => buildAlpacaTradingUrl(`/v2/orders/${params.order_id}`, params.paper),
    method: 'PATCH',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
    body: (params) => {
      const body: Record<string, any> = {}
      if (params.qty) body.qty = params.qty
      if (params.time_in_force) body.time_in_force = params.time_in_force
      if (params.limit_price) body.limit_price = params.limit_price
      if (params.stop_price) body.stop_price = params.stop_price
      if (params.trail) body.trail = params.trail
      if (params.client_order_id) body.client_order_id = params.client_order_id
      return body
    },
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'replace_order')
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
      description: 'The new replacement order details',
    },
  },
}
