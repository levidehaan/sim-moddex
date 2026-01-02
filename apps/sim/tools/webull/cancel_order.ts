import type { ToolConfig } from '@/tools/types'
import { getWebullHeaders, handleWebullError, WEBULL_TRADE_API_URL } from './types'

export interface WebullCancelOrderParams {
  accessToken: string
  deviceId: string
  accountId: string
  orderId: string
}

export interface WebullCancelOrderResponse {
  success: boolean
  output: {
    message: string
    orderId: string
  }
}

export const webullCancelOrderTool: ToolConfig<WebullCancelOrderParams, WebullCancelOrderResponse> =
  {
    id: 'webull_cancel_order',
    name: 'Cancel Order',
    description: 'Cancel an open order on Webull',
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
      orderId: {
        type: 'string',
        required: true,
        description: 'Order ID to cancel',
      },
    },

    request: {
      url: (params) =>
        `${WEBULL_TRADE_API_URL}/v1/account/${params.accountId}/orders/${params.orderId}`,
      method: 'DELETE',
      headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
    },

    transformResponse: async (response: Response, params) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        handleWebullError(data, response.status, 'cancel_order')
      }

      return {
        success: true,
        output: {
          message: 'Order canceled successfully',
          orderId: params?.orderId || '',
        },
      }
    },

    outputs: {
      message: {
        type: 'string',
        description: 'Success message',
      },
      orderId: {
        type: 'string',
        description: 'The canceled order ID',
      },
    },
  }
