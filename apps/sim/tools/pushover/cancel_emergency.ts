import type { ToolConfig } from '@/tools/types'
import { handlePushoverError, PUSHOVER_API_URL } from './types'

export interface PushoverCancelEmergencyParams {
  token: string
  receipt: string
}

export interface PushoverCancelEmergencyResponse {
  success: boolean
  output: {
    status: number
    request: string
  }
}

export const pushoverCancelEmergencyTool: ToolConfig<
  PushoverCancelEmergencyParams,
  PushoverCancelEmergencyResponse
> = {
  id: 'pushover_cancel_emergency',
  name: 'Cancel Pushover Emergency',
  description: 'Cancel an emergency priority notification',
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
    url: (params) => `${PUSHOVER_API_URL}/receipts/${params.receipt}/cancel.json`,
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: (params) => `token=${params.token}`,
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok || data.status !== 1) {
      handlePushoverError(data, response.status, 'cancel_emergency')
    }

    return {
      success: true,
      output: {
        status: data.status,
        request: data.request,
      },
    }
  },

  outputs: {
    status: {
      type: 'number',
      description: 'Status code',
    },
    request: {
      type: 'string',
      description: 'Request ID',
    },
  },
}
