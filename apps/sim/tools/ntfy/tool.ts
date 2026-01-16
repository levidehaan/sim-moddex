import type { ToolConfig } from '@/tools/types'
import type {
  NtfyToolParams,
  NtfyToolResponse,
  NtfyMessageResponse,
} from './types'

/**
 * Send a notification via ntfy
 */
async function sendNotification(params: NtfyToolParams): Promise<NtfyToolResponse> {
  const {
    serverUrl = 'https://ntfy.sh',
    topic,
    message,
    title,
    priority,
    tags,
    clickUrl,
    attachUrl,
    attachFilename,
    email,
    delay,
    actions,
  } = params

  const url = `${serverUrl.replace(/\/$/, '')}/${topic}`

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain',
  }

  if (title) headers['Title'] = title
  if (priority) headers['Priority'] = priority.toString()
  if (tags && tags.length > 0) headers['Tags'] = tags.join(',')
  if (clickUrl) headers['Click'] = clickUrl
  if (attachUrl) headers['Attach'] = attachUrl
  if (attachFilename) headers['Filename'] = attachFilename
  if (email) headers['Email'] = email
  if (delay) headers['Delay'] = delay
  if (actions && actions.length > 0) {
    headers['Actions'] = JSON.stringify(actions)
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: message,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        output: {
          error: `Failed to send notification: ${response.status} - ${errorText}`,
        },
      }
    }

    const data = await response.json() as NtfyMessageResponse

    return {
      success: true,
      output: {
        id: data.id,
        time: data.time,
        topic: data.topic,
        message: data,
      },
    }
  } catch (error) {
    return {
      success: false,
      output: {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }
  }
}

export const ntfySendTool: ToolConfig<NtfyToolParams, NtfyToolResponse> = {
  id: 'ntfy_send',
  name: 'Ntfy Send Notification',
  description:
    'Send push notifications via ntfy.sh. Free, no signup required for public topics.',
  version: '1.0.0',

  params: {
    serverUrl: {
      type: 'string',
      required: false,
      description: 'Ntfy server URL (default: https://ntfy.sh)',
    },
    topic: {
      type: 'string',
      required: true,
      description: 'Topic to publish notification to',
    },
    message: {
      type: 'string',
      required: true,
      description: 'Notification message body',
    },
    title: {
      type: 'string',
      required: false,
      description: 'Notification title',
    },
    priority: {
      type: 'number',
      required: false,
      description: 'Priority level (1=min, 2=low, 3=default, 4=high, 5=max)',
    },
    tags: {
      type: 'array',
      required: false,
      description: 'Tags/emojis (e.g., ["warning", "skull"])',
    },
    clickUrl: {
      type: 'string',
      required: false,
      description: 'URL to open when notification is clicked',
    },
    attachUrl: {
      type: 'string',
      required: false,
      description: 'URL of file to attach',
    },
    attachFilename: {
      type: 'string',
      required: false,
      description: 'Filename for attachment',
    },
    email: {
      type: 'string',
      required: false,
      description: 'Email address to forward notification to',
    },
    delay: {
      type: 'string',
      required: false,
      description: 'Delay delivery (e.g., "30m", "1h", "tomorrow 9am")',
    },
    actions: {
      type: 'array',
      required: false,
      description: 'Action buttons for the notification',
    },
  },

  directExecution: async (params: NtfyToolParams): Promise<NtfyToolResponse> => {
    if (!params.topic) {
      return {
        success: false,
        output: {
          error: 'Topic is required',
        },
      }
    }

    if (!params.message) {
      return {
        success: false,
        output: {
          error: 'Message is required',
        },
      }
    }

    return await sendNotification(params)
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the notification was sent' },
    id: { type: 'string', description: 'Message ID' },
    time: { type: 'number', description: 'Unix timestamp of message' },
    topic: { type: 'string', description: 'Topic the message was sent to' },
    message: { type: 'json', description: 'Full message response' },
    error: { type: 'string', description: 'Error message if send failed' },
  },
}
