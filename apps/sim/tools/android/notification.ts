import type { AndroidNotificationParams, AndroidNotificationResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const notificationTool: ToolConfig<AndroidNotificationParams, AndroidNotificationResponse> = {
  id: 'android_notification',
  name: 'Android Notification',
  description: 'Send notifications to Android device via Termux:API',
  version: '1.0',

  params: {
    title: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Notification title',
    },
    content: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Notification content/body',
    },
    id: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Unique notification ID for updates',
    },
    priority: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Notification priority (high, default, low, min, max)',
    },
    sound: {
      type: 'boolean',
      required: false,
      visibility: 'user-only',
      description: 'Play notification sound',
    },
    vibrate: {
      type: 'boolean',
      required: false,
      visibility: 'user-only',
      description: 'Vibrate device',
    },
    led: {
      type: 'boolean',
      required: false,
      visibility: 'user-only',
      description: 'Enable LED notification',
    },
    ledColor: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'LED color in RRGGBB format',
    },
    group: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Notification group for bundling',
    },
    imageUrl: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'URL for notification image',
    },
    actionLabel: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Action button label',
    },
    actionCommand: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Command to run when action is tapped',
    },
  },

  request: {
    url: '/api/tools/android/notification',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => params,
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android notification failed')
    }

    return {
      success: true,
      output: {
        id: data.id,
        message: data.message || 'Notification sent successfully',
      },
      error: undefined,
    }
  },

  outputs: {
    id: { type: 'string', description: 'Notification ID' },
    message: { type: 'string', description: 'Status message' },
  },
}
