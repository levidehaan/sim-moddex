import { Bell } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const NtfyBlock: BlockConfig = {
  type: 'ntfy',
  name: 'Ntfy',
  description: 'Send push notifications via ntfy.sh',
  longDescription:
    'Send push notifications to phones and desktops using ntfy.sh. Completely free and open source. No signup or API key required for public topics. Supports titles, priorities, tags, actions, and attachments.',
  category: 'tools',
  bgColor: '#57A64A',
  icon: Bell,
  subBlocks: [
    {
      id: 'serverUrl',
      title: 'Server URL',
      type: 'short-input',
      placeholder: 'https://ntfy.sh',
      description: 'Ntfy server URL (default: https://ntfy.sh)',
    },
    {
      id: 'topic',
      title: 'Topic',
      type: 'short-input',
      required: true,
      placeholder: 'e.g., my-alerts, workflow-notifications',
      description: 'Topic name to publish to (subscribers receive notifications)',
    },
    {
      id: 'message',
      title: 'Message',
      type: 'long-input',
      required: true,
      placeholder: 'Enter your notification message...',
      description: 'The notification message body',
    },
    {
      id: 'title',
      title: 'Title',
      type: 'short-input',
      placeholder: 'Notification title',
      description: 'Optional notification title',
    },
    {
      id: 'priority',
      title: 'Priority',
      type: 'dropdown',
      options: [
        { label: 'Max (urgent)', id: '5' },
        { label: 'High', id: '4' },
        { label: 'Default', id: '3' },
        { label: 'Low', id: '2' },
        { label: 'Min', id: '1' },
      ],
      value: () => '3',
      description: 'Notification priority level',
    },
    {
      id: 'tags',
      title: 'Tags/Emojis',
      type: 'short-input',
      placeholder: 'e.g., warning,skull,+1,partying_face',
      description: 'Comma-separated tags (emoji shortcodes supported)',
    },
    {
      id: 'clickUrl',
      title: 'Click URL',
      type: 'short-input',
      placeholder: 'https://example.com',
      description: 'URL to open when notification is clicked',
    },
    {
      id: 'attachUrl',
      title: 'Attachment URL',
      type: 'short-input',
      placeholder: 'https://example.com/image.jpg',
      description: 'URL of file to attach to notification',
    },
    {
      id: 'attachFilename',
      title: 'Attachment Filename',
      type: 'short-input',
      placeholder: 'image.jpg',
      description: 'Filename for the attachment',
    },
    {
      id: 'email',
      title: 'Email',
      type: 'short-input',
      placeholder: 'user@example.com',
      description: 'Email address to forward notification to',
    },
    {
      id: 'delay',
      title: 'Delay',
      type: 'short-input',
      placeholder: 'e.g., 30m, 1h, tomorrow 9am',
      description: 'Delay delivery (e.g., 30m, 1h, 9am, tomorrow)',
    },
    {
      id: 'actions',
      title: 'Actions (JSON)',
      type: 'code',
      placeholder: '[{"action": "view", "label": "Open", "url": "https://example.com"}]',
      description: 'JSON array of action buttons',
    },
  ],
  tools: {
    access: ['ntfy_send'],
    config: {
      tool: () => 'ntfy_send',
      params: (params) => {
        const result: Record<string, unknown> = {
          serverUrl: params.serverUrl || 'https://ntfy.sh',
          topic: params.topic,
          message: params.message,
        }

        if (params.title) result.title = params.title
        if (params.priority) result.priority = Number(params.priority)
        if (params.tags) result.tags = params.tags.split(',').map((t: string) => t.trim())
        if (params.clickUrl) result.clickUrl = params.clickUrl
        if (params.attachUrl) result.attachUrl = params.attachUrl
        if (params.attachFilename) result.attachFilename = params.attachFilename
        if (params.email) result.email = params.email
        if (params.delay) result.delay = params.delay
        if (params.actions) {
          try {
            result.actions = typeof params.actions === 'string' 
              ? JSON.parse(params.actions) 
              : params.actions
          } catch {
            // Invalid JSON, ignore
          }
        }

        return result
      },
    },
  },
  inputs: {
    serverUrl: { type: 'string', description: 'Ntfy server URL' },
    topic: { type: 'string', description: 'Topic to publish to' },
    message: { type: 'string', description: 'Notification message' },
    title: { type: 'string', description: 'Notification title' },
    priority: { type: 'number', description: 'Priority (1-5)' },
    tags: { type: 'array', description: 'Tags/emojis' },
    clickUrl: { type: 'string', description: 'URL to open on click' },
    attachUrl: { type: 'string', description: 'Attachment URL' },
    attachFilename: { type: 'string', description: 'Attachment filename' },
    email: { type: 'string', description: 'Email to forward to' },
    delay: { type: 'string', description: 'Delivery delay' },
    actions: { type: 'array', description: 'Action buttons' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the notification was sent' },
    id: { type: 'string', description: 'Message ID' },
    time: { type: 'number', description: 'Unix timestamp of message' },
    topic: { type: 'string', description: 'Topic the message was sent to' },
    error: { type: 'string', description: 'Error message if send failed' },
  },
}
