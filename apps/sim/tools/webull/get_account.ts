import type { ToolConfig } from '@/tools/types'
import type { WebullAccount } from './types'
import { getWebullHeaders, handleWebullError, WEBULL_TRADE_API_URL } from './types'

export interface WebullGetAccountParams {
  accessToken: string
  deviceId: string
  accountId: string
}

export interface WebullGetAccountResponse {
  success: boolean
  output: {
    account: WebullAccount
  }
}

export const webullGetAccountTool: ToolConfig<WebullGetAccountParams, WebullGetAccountResponse> = {
  id: 'webull_get_account',
  name: 'Get Account',
  description: 'Get Webull account information including buying power and balances',
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
    url: (params) => `${WEBULL_TRADE_API_URL}/v1/account/${params.accountId}`,
    method: 'GET',
    headers: (params) => getWebullHeaders(params.accessToken, params.deviceId),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleWebullError(data, response.status, 'get_account')
    }

    const account = await response.json()
    return {
      success: true,
      output: { account },
    }
  },

  outputs: {
    account: {
      type: 'object',
      description: 'Account information including balances and buying power',
    },
  },
}
