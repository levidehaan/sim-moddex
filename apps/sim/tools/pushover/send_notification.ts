import type { ToolConfig } from '@/tools/types'
import type { PushoverMessage } from './types'
import { PUSHOVER_API_URL, handlePushoverError } from './types'

export interface PushoverSendNotificationParams {
  token: string
  user: string
  message: string
  title?: string
  device?: string
  url?: string
  url_title?: string
  priority?: number
  sound?: string
  html?: boolean
  timestamp?: number
  ttl?: number
  retry?: number
  expire?: number
  callback?: string
  tags?: string
}

export interface PushoverSendNotificationResponse {
  success: boolean
  output: PushoverMessage
}

export const pushoverSendNotificationTool: ToolConfig<
  PushoverSendNotificationParams,
  PushoverSendNotificationResponse
> = {
  id: 'pushover_send_notification',
  name: 'Send Pushover Notification',
  description: 'Send a push notification via Pushover',
  version: '1.0.0',

  params: {
    token: {
      type: 'string',
      required: true,
      description: 'Pushover application API token',
    },
    user: {
      type: 'string',
      required: true,
      description: 'Pushover user key or group key',
    },
    message: {
      type: 'string',
      required: true,
      description: 'Notification message (max 1024 characters)',
    },
    title: {
      type: 'string',
      required: false,
      description: 'Notification title (max 250 characters)',
    },
    device: {
      type: 'string',
      required: false,
      description: 'Device name to send to (leave empty for all devices)',
    },
    url: {
      type: 'string',
      required: false,
      description: 'Supplementary URL to include',
    },
    url_title: {
      type: 'string',
      required: false,
      description: 'Title for the supplementary URL',
    },
    priority: {
      type: 'number',
      required: false,
      description: 'Priority: -2 (lowest) to 2 (emergency)',
    },
    sound: {
      type: 'string',
      required: false,
      description: 'Notification sound name',
    },
    html: {
      type: 'boolean',
      required: false,
      description: 'Enable HTML formatting in message',
    },
    timestamp: {
      type: 'number',
      required: false,
      description: 'Unix timestamp for the message',
    },
    ttl: {
      type: 'number',
      required: false,
      description: 'Time to live in seconds',
    },
    retry: {
      type: 'number',
      required: false,
      description: 'Retry interval for emergency priority (min 30 seconds)',
    },
    expire: {
      type: 'number',
      required: false,
      description: 'Expiration time for emergency priority (max 10800 seconds)',
    },
    callback: {
      type: 'string',
      required: false,
      description: 'Callback URL for emergency priority acknowledgment',
    },
    tags: {
      type: 'string',
      required: false,
      description: 'Tags for the message (comma-separated)',
    },
  },

  request: {
    url: () => `${PUSHOVER_API_URL}/messages.json`,
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: (params) => {
      const formData = new URLSearchParams()
      formData.append('token', params.token)
      formData.append('user', params.user)
      formData.append('message', params.message)

      if (params.title) formData.append('title', params.title)
      if (params.device) formData.append('device', params.device)
      if (params.url) formData.append('url', params.url)
      if (params.url_title) formData.append('url_title', params.url_title)
      if (params.priority !== undefined) formData.append('priority', params.priority.toString())
      if (params.sound) formData.append('sound', params.sound)
      if (params.html) formData.append('html', '1')
      if (params.timestamp) formData.append('timestamp', params.timestamp.toString())
      if (params.ttl) formData.append('ttl', params.ttl.toString())
      if (params.retry) formData.append('retry', params.retry.toString())
      if (params.expire) formData.append('expire', params.expire.toString())
      if (params.callback) formData.append('callback', params.callback)
      if (params.tags) formData.append('tags', params.tags)

      return formData.toString()
    },
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok || data.status !== 1) {
      handlePushoverError(data, response.status, 'send_notification')
    }

    return {
      success: true,
      output: data,
    }
  },

  outputs: {
    status: {
      type: 'number',
      description: 'Status code (1 = success)',
    },
    request: {
      type: 'string',
      description: 'Request ID',
    },
    receipt: {
      type: 'string',
      description: 'Receipt for emergency priority messages',
    },
  },
}
