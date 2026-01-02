import type { ToolConfig } from '@/tools/types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaCancelOrderParams {
  apiKey: string
  apiSecret: string
  order_id: string
  paper?: boolean
}

export interface AlpacaCancelOrderResponse {
  success: boolean
  output: {
    message: string
    order_id: string
  }
}

export const alpacaCancelOrderTool: ToolConfig<AlpacaCancelOrderParams, AlpacaCancelOrderResponse> =
  {
    id: 'alpaca_cancel_order',
    name: 'Cancel Order',
    description: 'Cancel an open order by its ID',
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
        description: 'The order ID to cancel',
      },
      paper: {
        type: 'boolean',
        required: false,
        description: 'Use paper trading environment',
      },
    },

    request: {
      url: (params) => buildAlpacaTradingUrl(`/v2/orders/${params.order_id}`, params.paper),
      method: 'DELETE',
      headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
    },

    transformResponse: async (response: Response, params) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        handleAlpacaError(data, response.status, 'cancel_order')
      }

      return {
        success: true,
        output: {
          message: 'Order canceled successfully',
          order_id: params?.order_id || '',
        },
      }
    },

    outputs: {
      message: {
        type: 'string',
        description: 'Success message',
      },
      order_id: {
        type: 'string',
        description: 'The canceled order ID',
      },
    },
  }
