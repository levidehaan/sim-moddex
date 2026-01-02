import type { ToolConfig } from '@/tools/types'
import type { WebullOrder } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_TRADE_API_URL } from './types'

export interface WebullListOrdersParams {
  accessToken: string
  deviceId: string
  accountId: string
  status?: 'working' | 'filled' | 'cancelled' | 'all'
  pageSize?: number
}

export interface WebullListOrdersResponse {
  success: boolean
  output: {
    orders: WebullOrder[]
    count: number
  }
}

export const webullListOrdersTool: ToolConfig<WebullListOrdersParams, WebullListOrdersResponse> = {
  id: 'webull_list_orders',
  name: 'List Orders',
  description: 'Get a list of orders from your Webull account',
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
    status: {
      type: 'string',
      required: false,
      description: 'Filter by status: working, filled, cancelled, or all',
    },
    pageSize: {
      type: 'number',
      required: false,
      description: 'Number of orders to return (default: 50)',
    },
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      if (params.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      const query = queryParams.toString()
      return `${WEBULL_TRADE_API_URL}/v1/account/${params.accountId}/orders${query ? `?${query}` : ''}`
    },
    method: 'GET',
    headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleWebullError(data, response.status, 'list_orders')
    }

    const data = await response.json()
    const orders = data.orders || data || []
    return {
      success: true,
      output: {
        orders,
        count: orders.length,
      },
    }
  },

  outputs: {
    orders: {
      type: 'array',
      description: 'List of orders',
    },
    count: {
      type: 'number',
      description: 'Number of orders returned',
    },
  },
}
