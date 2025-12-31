import type { ToolConfig } from '@/tools/types'
import type { AlpacaAccount } from './types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaGetAccountParams {
  apiKey: string
  apiSecret: string
  paper?: boolean
}

export interface AlpacaGetAccountResponse {
  success: boolean
  output: {
    account: AlpacaAccount
  }
}

export const alpacaGetAccountTool: ToolConfig<AlpacaGetAccountParams, AlpacaGetAccountResponse> = {
  id: 'alpaca_get_account',
  name: 'Get Alpaca Account',
  description: 'Retrieve account information including buying power, equity, and trading status',
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
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading API (default: false)',
    },
  },

  request: {
    url: (params) => buildAlpacaTradingUrl('/v2/account', params.paper),
    method: 'GET',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'get_account')
    }

    const account = await response.json()
    return {
      success: true,
      output: {
        account,
      },
    }
  },

  outputs: {
    account: {
      type: 'object',
      description: 'Account information',
    },
  },
}
