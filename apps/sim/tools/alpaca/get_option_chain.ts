import type { ToolConfig } from '@/tools/types'
import type { AlpacaOptionContract } from './types'
import { buildAlpacaDataUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetOptionChainParams {
  apiKey: string
  apiSecret: string
  underlying_symbol: string
  expiration_date?: string
  expiration_date_gte?: string
  expiration_date_lte?: string
  strike_price_gte?: number
  strike_price_lte?: number
  type?: string
  limit?: number
}

export interface AlpacaGetOptionChainResponse {
  success: boolean
  output: {
    option_contracts: AlpacaOptionContract[]
    next_page_token?: string
  }
}

export const alpacaGetOptionChainTool: ToolConfig<
  AlpacaGetOptionChainParams,
  AlpacaGetOptionChainResponse
> = {
  id: 'alpaca_get_option_chain',
  name: 'Get Option Chain from Alpaca',
  description: 'Retrieve available option contracts for an underlying symbol',
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
    underlying_symbol: {
      type: 'string',
      required: true,
      description: 'Underlying stock symbol (e.g., "AAPL")',
    },
    expiration_date: {
      type: 'string',
      required: false,
      description: 'Exact expiration date (YYYY-MM-DD)',
    },
    expiration_date_gte: {
      type: 'string',
      required: false,
      description: 'Minimum expiration date',
    },
    expiration_date_lte: {
      type: 'string',
      required: false,
      description: 'Maximum expiration date',
    },
    strike_price_gte: {
      type: 'number',
      required: false,
      description: 'Minimum strike price',
    },
    strike_price_lte: {
      type: 'number',
      required: false,
      description: 'Maximum strike price',
    },
    type: {
      type: 'string',
      required: false,
      description: 'Option type (call, put)',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of contracts to return',
    },
  },

  request: {
    url: (params) => {
      const queryParams = new URLSearchParams()
      queryParams.append('underlying_symbol', params.underlying_symbol)
      if (params.expiration_date) queryParams.append('expiration_date', params.expiration_date)
      if (params.expiration_date_gte)
        queryParams.append('expiration_date_gte', params.expiration_date_gte)
      if (params.expiration_date_lte)
        queryParams.append('expiration_date_lte', params.expiration_date_lte)
      if (params.strike_price_gte)
        queryParams.append('strike_price_gte', params.strike_price_gte.toString())
      if (params.strike_price_lte)
        queryParams.append('strike_price_lte', params.strike_price_lte.toString())
      if (params.type) queryParams.append('type', params.type)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      return buildAlpacaDataUrl(`/v1beta1/options/contracts?${queryParams.toString()}`)
    },
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      handleAlpacaError(errorData, response.status, 'get_option_chain')
    }

    const data = await response.json()
    
    // Log for debugging
    if (!data.option_contracts || data.option_contracts.length === 0) {
      console.warn('No option contracts found. Response:', JSON.stringify(data, null, 2))
    }
    
    return {
      success: true,
      output: {
        option_contracts: data.option_contracts || [],
        next_page_token: data.next_page_token,
      },
    }
  },

  outputs: {
    option_contracts: {
      type: 'array',
      description: 'List of option contracts',
    },
    next_page_token: {
      type: 'string',
      description: 'Token for pagination',
    },
  },
}
