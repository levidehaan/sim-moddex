import type { ToolConfig } from '@/tools/types'
import type { WebullOptionContract } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_QUOTES_API_URL } from './types'

export interface WebullGetOptionChainParams {
  accessToken: string
  deviceId: string
  tickerId: string
  expireDate?: string
  direction?: 'call' | 'put' | 'all'
}

export interface WebullGetOptionChainResponse {
  success: boolean
  output: {
    expirationDates: string[]
    options: WebullOptionContract[]
    count: number
  }
}

export const webullGetOptionChainTool: ToolConfig<
  WebullGetOptionChainParams,
  WebullGetOptionChainResponse
> = {
  id: 'webull_get_option_chain',
  name: 'Get Option Chain',
  description: 'Get option chain for a stock (available strike prices and expirations)',
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
    tickerId: {
      type: 'string',
      required: true,
      description: 'Ticker ID of the underlying stock (from Get Quote)',
    },
    expireDate: {
      type: 'string',
      required: false,
      description: 'Filter by expiration date (YYYY-MM-DD)',
    },
    direction: {
      type: 'string',
      required: false,
      description: 'Filter by option type: call, put, or all',
    },
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      queryParams.append('tickerId', params.tickerId)
      if (params.expireDate) queryParams.append('expireDate', params.expireDate)
      if (params.direction && params.direction !== 'all') {
        queryParams.append('direction', params.direction)
      }
      return `${WEBULL_QUOTES_API_URL}/v1/option/chain?${queryParams.toString()}`
    },
    method: 'GET',
    headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleWebullError(data, response.status, 'get_option_chain')
    }

    const data = await response.json()
    const expirationDates = data.expireDateList || []
    const options = data.data || []

    return {
      success: true,
      output: {
        expirationDates,
        options,
        count: options.length,
      },
    }
  },

  outputs: {
    expirationDates: {
      type: 'array',
      description: 'Available expiration dates',
    },
    options: {
      type: 'array',
      description: 'Option contracts with greeks and pricing',
    },
    count: {
      type: 'number',
      description: 'Number of option contracts returned',
    },
  },
}
