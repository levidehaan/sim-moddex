/**
 * Pushover API Types
 */

export const PUSHOVER_API_URL = 'https://api.pushover.net/1'

export interface PushoverDevice {
  name: string
  enabled: boolean
}

export interface PushoverMessage {
  status: number
  request: string
  receipt?: string
}

export interface PushoverReceipt {
  status: number
  acknowledged: number
  acknowledged_at: number
  acknowledged_by: string
  acknowledged_by_device: string
  last_delivered_at: number
  expired: number
  expires_at: number
  called_back: number
  called_back_at: number
}

export function handlePushoverError(data: any, status: number, operation: string): never {
  const errors = data?.errors?.join(', ') || data?.error || `HTTP ${status}`
  throw new Error(`Pushover ${operation} failed: ${errors}`)
}
