import type { ToolConfig } from '@/tools/types'
import type { WebullPosition } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_TRADE_API_URL } from './types'

export interface WebullGetPositionsParams {
  accessToken: string
  deviceId: string
  accountId: string
}

export interface WebullGetPositionsResponse {
  success: boolean
  output: {
    positions: WebullPosition[]
    count: number
  }
}

export const webullGetPositionsTool: ToolConfig<
  WebullGetPositionsParams,
  WebullGetPositionsResponse
> = {
  id: 'webull_get_positions',
  name: 'Get Positions',
  description: 'Get all open positions in your Webull account',
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
  },

  request: {
    url: (params) => `${WEBULL_TRADE_API_URL}/v1/account/${params.accountId}/positions`,
    method: 'GET',
    headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleWebullError(data, response.status, 'get_positions')
    }

    const data = await response.json()
    const positions = data.positions || data || []
    return {
      success: true,
      output: {
        positions,
        count: positions.length,
      },
    }
  },

  outputs: {
    positions: {
      type: 'array',
      description: 'List of open positions',
    },
    count: {
      type: 'number',
      description: 'Number of positions',
    },
  },
}
