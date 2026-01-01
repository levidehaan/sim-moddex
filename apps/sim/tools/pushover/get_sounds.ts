import type { ToolConfig } from '@/tools/types'
import { handlePushoverError, PUSHOVER_API_URL } from './types'

export interface PushoverGetSoundsParams {
  token: string
}

export interface PushoverGetSoundsResponse {
  success: boolean
  output: {
    sounds: Record<string, string>
  }
}

export const pushoverGetSoundsTool: ToolConfig<PushoverGetSoundsParams, PushoverGetSoundsResponse> =
  {
    id: 'pushover_get_sounds',
    name: 'Get Pushover Sounds',
    description: 'Get list of available notification sounds',
    version: '1.0.0',

    params: {
      token: {
        type: 'string',
        required: true,
        description: 'Pushover application API token',
      },
    },

    request: {
      url: (params) => `${PUSHOVER_API_URL}/sounds.json?token=${params.token}`,
      method: 'GET',
      headers: () => ({
        'Content-Type': 'application/json',
      }),
    },

    transformResponse: async (response: Response) => {
      const data = await response.json()

      if (!response.ok || data.status !== 1) {
        handlePushoverError(data, response.status, 'get_sounds')
      }

      return {
        success: true,
        output: {
          sounds: data.sounds || {},
        },
      }
    },

    outputs: {
      sounds: {
        type: 'object',
        description: 'Map of sound names to display names',
      },
    },
  }
