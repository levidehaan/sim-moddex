import type { AndroidClipboardParams, AndroidClipboardResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const clipboardTool: ToolConfig<AndroidClipboardParams, AndroidClipboardResponse> = {
  id: 'android_clipboard',
  name: 'Android Clipboard',
  description: 'Get or set Android system clipboard content',
  version: '1.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Clipboard operation (get or set)',
    },
    text: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Text to set to clipboard (required for set operation)',
    },
  },

  request: {
    url: '/api/tools/android/clipboard',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      operation: params.operation,
      text: params.text,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android clipboard operation failed')
    }

    return {
      success: true,
      output: {
        text: data.text || '',
        message: data.message || 'Clipboard operation successful',
      },
      error: undefined,
    }
  },

  outputs: {
    text: { type: 'string', description: 'Clipboard content' },
    message: { type: 'string', description: 'Status message' },
  },
}
