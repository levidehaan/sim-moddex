/**
 * Ntfy Push Notification Tool Types
 */

export interface NtfyAction {
  action: 'view' | 'broadcast' | 'http'
  label: string
  url?: string
  clear?: boolean
  intent?: string
  extras?: Record<string, string>
  method?: string
  headers?: Record<string, string>
  body?: string
}

export interface NtfyToolParams {
  serverUrl?: string
  topic: string
  message: string
  title?: string
  priority?: 1 | 2 | 3 | 4 | 5
  tags?: string[]
  clickUrl?: string
  attachUrl?: string
  attachFilename?: string
  email?: string
  delay?: string
  actions?: NtfyAction[]
}

export interface NtfyMessageResponse {
  id: string
  time: number
  expires: number
  event: string
  topic: string
  message: string
  title?: string
  priority?: number
  tags?: string[]
  click?: string
  attachment?: {
    name: string
    url: string
    type?: string
    size?: number
    expires?: number
  }
  actions?: NtfyAction[]
}

export interface NtfyToolResponse {
  success: boolean
  output: {
    id?: string
    time?: number
    topic?: string
    message?: NtfyMessageResponse
    error?: string
  }
}
