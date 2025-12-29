import type { AndroidTtsParams, AndroidTtsResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const ttsTool: ToolConfig<AndroidTtsParams, AndroidTtsResponse> = {
  id: 'android_tts',
  name: 'Android Text-to-Speech',
  description: 'Convert text to speech on Android device',
  version: '1.0',

  params: {
    text: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Text to speak',
    },
    language: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Language code (e.g., en-US, es-ES)',
    },
    pitch: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Voice pitch (0.25 to 4.0, default: 1.0)',
    },
    rate: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Speech rate (0.25 to 4.0, default: 1.0)',
    },
    engine: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'TTS engine package name',
    },
  },

  request: {
    url: '/api/tools/android/tts',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      text: params.text,
      language: params.language,
      pitch: params.pitch,
      rate: params.rate,
      engine: params.engine,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android TTS failed')
    }

    return {
      success: true,
      output: {
        text: data.text,
        message: data.message || 'Text spoken successfully',
      },
      error: undefined,
    }
  },

  outputs: {
    text: { type: 'string', description: 'Text that was spoken' },
    message: { type: 'string', description: 'Status message' },
  },
}
