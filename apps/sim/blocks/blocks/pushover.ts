import type { SVGProps } from 'react'
import { createElement } from 'react'
import { Bell } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const PushoverIcon = (props: SVGProps<SVGSVGElement>) => createElement(Bell, props)

export const PushoverBlock: BlockConfig = {
  type: 'pushover',
  name: 'Pushover',
  description: 'Send push notifications via Pushover',
  longDescription:
    'Send real-time push notifications to iOS, Android, and Desktop devices using Pushover. Supports priorities, sounds, URLs, HTML formatting, and emergency notifications with acknowledgment.',
  docsLink: 'https://pushover.net/api',
  authMode: AuthMode.ApiKey,
  category: 'tools',
  bgColor: '#249DF1',
  icon: PushoverIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Send Notification', id: 'send_notification' },
        { label: 'Get Sounds', id: 'get_sounds' },
        { label: 'Get Receipt Status', id: 'get_receipt' },
        { label: 'Cancel Emergency', id: 'cancel_emergency' },
      ],
      value: () => 'send_notification',
    },
    {
      id: 'token',
      title: 'API Token',
      type: 'short-input',
      placeholder: 'Your Pushover application API token',
      password: true,
      required: true,
    },
    {
      id: 'user',
      title: 'User/Group Key',
      type: 'short-input',
      placeholder: 'User or group key to send to',
      required: true,
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'message',
      title: 'Message',
      type: 'long-input',
      placeholder: 'Notification message (max 1024 characters)',
      required: true,
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'title',
      title: 'Title',
      type: 'short-input',
      placeholder: 'Notification title (optional)',
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'device',
      title: 'Device',
      type: 'short-input',
      placeholder: 'Specific device name (optional)',
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'url',
      title: 'URL',
      type: 'short-input',
      placeholder: 'Supplementary URL (optional)',
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'url_title',
      title: 'URL Title',
      type: 'short-input',
      placeholder: 'Title for the URL (optional)',
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'priority',
      title: 'Priority',
      type: 'dropdown',
      options: [
        { label: 'Lowest (-2)', id: '-2' },
        { label: 'Low (-1)', id: '-1' },
        { label: 'Normal (0)', id: '0' },
        { label: 'High (1)', id: '1' },
        { label: 'Emergency (2)', id: '2' },
      ],
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'sound',
      title: 'Sound',
      type: 'dropdown',
      options: [
        { label: 'Default', id: '' },
        { label: 'Pushover (default)', id: 'pushover' },
        { label: 'Bike', id: 'bike' },
        { label: 'Bugle', id: 'bugle' },
        { label: 'Cash Register', id: 'cashregister' },
        { label: 'Classical', id: 'classical' },
        { label: 'Cosmic', id: 'cosmic' },
        { label: 'Falling', id: 'falling' },
        { label: 'Gamelan', id: 'gamelan' },
        { label: 'Incoming', id: 'incoming' },
        { label: 'Intermission', id: 'intermission' },
        { label: 'Magic', id: 'magic' },
        { label: 'Mechanical', id: 'mechanical' },
        { label: 'Piano Bar', id: 'pianobar' },
        { label: 'Siren', id: 'siren' },
        { label: 'Space Alarm', id: 'spacealarm' },
        { label: 'Tug Boat', id: 'tugboat' },
        { label: 'Alien (long)', id: 'alien' },
        { label: 'Climb (long)', id: 'climb' },
        { label: 'Persistent (long)', id: 'persistent' },
        { label: 'Echo (long)', id: 'echo' },
        { label: 'Up Down (long)', id: 'updown' },
        { label: 'Vibrate Only', id: 'vibrate' },
        { label: 'None (silent)', id: 'none' },
      ],
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'html',
      title: 'HTML Formatting',
      type: 'dropdown',
      options: [
        { label: 'Disabled', id: '' },
        { label: 'Enabled', id: 'true' },
      ],
      condition: { field: 'operation', value: ['send_notification'] },
    },
    {
      id: 'ttl',
      title: 'Time to Live (seconds)',
      type: 'short-input',
      placeholder: 'Auto-delete after N seconds',
      condition: { field: 'operation', value: ['send_notification'] },
    },
    // Emergency priority fields
    {
      id: 'retry',
      title: 'Retry Interval (seconds)',
      type: 'short-input',
      placeholder: 'Retry every N seconds (min 30)',
      condition: { field: 'priority', value: '2' },
    },
    {
      id: 'expire',
      title: 'Expiration (seconds)',
      type: 'short-input',
      placeholder: 'Stop retrying after N seconds (max 10800)',
      condition: { field: 'priority', value: '2' },
    },
    {
      id: 'callback',
      title: 'Callback URL',
      type: 'short-input',
      placeholder: 'URL to call when acknowledged',
      condition: { field: 'priority', value: '2' },
    },
    {
      id: 'tags',
      title: 'Tags',
      type: 'short-input',
      placeholder: 'Comma-separated tags',
      condition: { field: 'operation', value: ['send_notification'] },
    },
    // Receipt operations
    {
      id: 'receipt',
      title: 'Receipt ID',
      type: 'short-input',
      placeholder: 'Receipt from emergency notification',
      required: true,
      condition: { field: 'operation', value: ['get_receipt', 'cancel_emergency'] },
    },
  ],
  tools: {
    access: [
      'pushover_send_notification',
      'pushover_get_sounds',
      'pushover_get_receipt',
      'pushover_cancel_emergency',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'send_notification':
            return 'pushover_send_notification'
          case 'get_sounds':
            return 'pushover_get_sounds'
          case 'get_receipt':
            return 'pushover_get_receipt'
          case 'cancel_emergency':
            return 'pushover_cancel_emergency'
          default:
            return 'pushover_send_notification'
        }
      },
      params: (params) => {
        const { operation, priority, html, ttl, retry, expire, ...rest } = params
        const cleanParams: Record<string, any> = {}

        // Convert priority to number
        if (priority) cleanParams.priority = parseInt(priority, 10)

        // Convert html to boolean
        if (html === 'true') cleanParams.html = true

        // Convert numeric fields
        if (ttl) cleanParams.ttl = parseInt(ttl, 10)
        if (retry) cleanParams.retry = parseInt(retry, 10)
        if (expire) cleanParams.expire = parseInt(expire, 10)

        Object.entries(rest).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanParams[key] = value
          }
        })

        return cleanParams
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    token: { type: 'string', description: 'Pushover application API token' },
    user: { type: 'string', description: 'User or group key' },
    message: { type: 'string', description: 'Notification message' },
    title: { type: 'string', description: 'Notification title' },
    device: { type: 'string', description: 'Specific device name' },
    url: { type: 'string', description: 'Supplementary URL' },
    url_title: { type: 'string', description: 'URL title' },
    priority: { type: 'number', description: 'Priority level' },
    sound: { type: 'string', description: 'Notification sound' },
    html: { type: 'boolean', description: 'Enable HTML formatting' },
    ttl: { type: 'number', description: 'Time to live in seconds' },
    retry: { type: 'number', description: 'Retry interval for emergency' },
    expire: { type: 'number', description: 'Expiration for emergency' },
    callback: { type: 'string', description: 'Callback URL for acknowledgment' },
    tags: { type: 'string', description: 'Comma-separated tags' },
    receipt: { type: 'string', description: 'Receipt ID from emergency notification' },
  },
  outputs: {
    status: { type: 'number', description: 'Response status (1 = success)' },
    request: { type: 'string', description: 'Request ID' },
    receipt: { type: 'string', description: 'Receipt for emergency messages' },
    sounds: { type: 'json', description: 'Available notification sounds' },
    acknowledged: { type: 'number', description: 'Whether message was acknowledged' },
    acknowledged_at: { type: 'number', description: 'Acknowledgment timestamp' },
    expired: { type: 'number', description: 'Whether message has expired' },
  },
}
