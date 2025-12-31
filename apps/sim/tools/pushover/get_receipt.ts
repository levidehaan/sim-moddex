import type { ToolConfig } from '@/tools/types'
import type { PushoverReceipt } from './types'
import { PUSHOVER_API_URL, handlePushoverError } from './types'

export interface PushoverGetReceiptParams {
  token: string
  receipt: string
}

export interface PushoverGetReceiptResponse {
  success: boolean
  output: PushoverReceipt
}

export const pushoverGetReceiptTool: ToolConfig<
  PushoverGetReceiptParams,
  PushoverGetReceiptResponse
> = {
  id: 'pushover_get_receipt',
  name: 'Get Pushover Receipt Status',
  description: 'Check the status of an emergency priority notification',
  version: '1.0.0',

  params: {
    token: {
      type: 'string',
      required: true,
      description: 'Pushover application API token',
    },
    receipt: {
      type: 'string',
      required: true,
      description: 'Receipt ID from emergency priority message',
    },
  },

  request: {
    url: (params) => `${PUSHOVER_API_URL}/receipts/${params.receipt}.json?token=${params.token}`,
    method: 'GET',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok || data.status !== 1) {
      handlePushoverError(data, response.status, 'get_receipt')
    }

    return {
      success: true,
      output: data,
    }
  },

  outputs: {
    status: {
      type: 'number',
      description: 'Status code',
    },
    acknowledged: {
      type: 'number',
      description: 'Whether the message was acknowledged',
    },
    acknowledged_at: {
      type: 'number',
      description: 'Unix timestamp of acknowledgment',
    },
    expired: {
      type: 'number',
      description: 'Whether the message has expired',
    },
  },
}
