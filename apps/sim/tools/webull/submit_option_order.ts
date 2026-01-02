import type { ToolConfig } from '@/tools/types'
import type { WebullOptionOrder } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_TRADE_API_URL } from './types'

export interface WebullSubmitOptionOrderParams {
  accessToken: string
  deviceId: string
  accountId: string
  optionTickerId: string
  action: 'BUY' | 'SELL'
  orderType: 'LMT' | 'MKT'
  timeInForce: 'GTC' | 'DAY'
  quantity: string
  lmtPrice?: string
}

export interface WebullSubmitOptionOrderResponse {
  success: boolean
  output: {
    order: WebullOptionOrder
  }
}

export const webullSubmitOptionOrderTool: ToolConfig<
  WebullSubmitOptionOrderParams,
  WebullSubmitOptionOrderResponse
> = {
  id: 'webull_submit_option_order',
  name: 'Submit Option Order',
  description: 'Submit an option order on Webull',
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
    optionTickerId: {
      type: 'string',
      required: true,
      description: 'Option ticker ID (from option chain)',
    },
    action: {
      type: 'string',
      required: true,
      description: 'Order action: BUY or SELL',
    },
    orderType: {
      type: 'string',
      required: true,
      description: 'Order type: LMT (limit) or MKT (market)',
    },
    timeInForce: {
      type: 'string',
      required: true,
      description: 'Time in force: GTC or DAY',
    },
    quantity: {
      type: 'string',
      required: true,
      description: 'Number of contracts to trade',
    },
    lmtPrice: {
      type: 'string',
      required: false,
      description: 'Limit price per contract (required for LMT orders)',
    },
  },

  request: {
    url: (params) => `${WEBULL_TRADE_API_URL}/v1/account/${params.accountId}/option-orders`,
    method: 'POST',
    headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
    body: (params) => {
      const body: Record<string, any> = {
        optionTickerId: params.optionTickerId,
        action: params.action,
        orderType: params.orderType,
        timeInForce: params.timeInForce,
        quantity: params.quantity,
      }

      if (params.lmtPrice) body.lmtPrice = params.lmtPrice

      return body
    },
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleWebullError(data, response.status, 'submit_option_order')
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
