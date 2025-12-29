import type { AndroidVibrateParams, AndroidVibrateResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const vibrateTool: ToolConfig<AndroidVibrateParams, AndroidVibrateResponse> = {
  id: 'android_vibrate',
  name: 'Android Vibrate',
  description: 'Vibrate the Android device with optional pattern',
  version: '1.0',

  params: {
    duration: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Vibration duration in milliseconds (default: 1000)',
    },
    pattern: {
      type: 'array',
      required: false,
      visibility: 'user-or-llm',
      description: 'Vibration pattern [wait, vibrate, wait, vibrate, ...]',
    },
    force: {
      type: 'boolean',
      required: false,
      visibility: 'user-only',
      description: 'Force vibration even in silent mode',
    },
  },

  request: {
    url: '/api/tools/android/vibrate',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      duration: params.duration,
      pattern: params.pattern,
      force: params.force,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android vibrate failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Device vibrated successfully',
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Status message' },
  },
}
