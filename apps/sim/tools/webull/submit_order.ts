import type { ToolConfig } from '@/tools/types'
import type { WebullOrder } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_TRADE_API_URL } from './types'

export interface WebullSubmitOrderParams {
  accessToken: string
  deviceId: string
  accountId: string
  tickerId: string
  action: 'BUY' | 'SELL'
  orderType: 'LMT' | 'MKT' | 'STP' | 'STP LMT'
  timeInForce: 'GTC' | 'DAY' | 'IOC' | 'FOK'
  quantity: string
  lmtPrice?: string
  auxPrice?: string
  outsideRegularTradingHour?: boolean
}

export interface WebullSubmitOrderResponse {
  success: boolean
  output: {
    order: WebullOrder
  }
}

export const webullSubmitOrderTool: ToolConfig<WebullSubmitOrderParams, WebullSubmitOrderResponse> =
  {
    id: 'webull_submit_order',
    name: 'Submit Stock Order',
    description: 'Submit a stock order on Webull (market, limit, stop, or stop limit)',
    version: '1.0.0',

    params: {
      accessToken: {
        type: 'string',
        required: true,
        description: 'Webull OAuth access token',
      },
      deviceId: {
        type: 'string',
        required: true,
        description: 'Webull device ID',
      },
      accountId: {
        type: 'string',
        required: true,
        description: 'Webull account ID',
      },
      tickerId: {
        type: 'string',
        required: true,
        description: 'Webull ticker ID (use Get Quote to find ticker ID from symbol)',
      },
      action: {
        type: 'string',
        required: true,
        description: 'Order action: BUY or SELL',
      },
      orderType: {
        type: 'string',
        required: true,
        description: 'Order type: LMT (limit), MKT (market), STP (stop), STP LMT (stop limit)',
      },
      timeInForce: {
        type: 'string',
        required: true,
        description: 'Time in force: GTC, DAY, IOC, or FOK',
      },
      quantity: {
        type: 'string',
        required: true,
        description: 'Number of shares to trade',
      },
      lmtPrice: {
        type: 'string',
        required: false,
        description: 'Limit price (required for LMT and STP LMT orders)',
      },
      auxPrice: {
        type: 'string',
        required: false,
        description: 'Stop price (required for STP and STP LMT orders)',
      },
      outsideRegularTradingHour: {
        type: 'boolean',
        required: false,
        description: 'Allow trading during extended hours',
      },
    },

    request: {
      url: (params) => `${WEBULL_TRADE_API_URL}/v1/account/${params.accountId}/orders`,
      method: 'POST',
      headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
      body: (params) => {
        const body: Record<string, any> = {
          tickerId: params.tickerId,
          action: params.action,
          orderType: params.orderType,
          timeInForce: params.timeInForce,
          quantity: params.quantity,
        }

        if (params.lmtPrice) body.lmtPrice = params.lmtPrice
        if (params.auxPrice) body.auxPrice = params.auxPrice
        if (params.outsideRegularTradingHour !== undefined) {
          body.outsideRegularTradingHour = params.outsideRegularTradingHour
        }

        return body
      },
    },

    transformResponse: async (response: Response) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        handleWebullError(data, response.status, 'submit_order')
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
