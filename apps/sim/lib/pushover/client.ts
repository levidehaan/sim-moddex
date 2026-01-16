import { z } from 'zod'

const PUSHOVER_API_URL = 'https://api.pushover.net/1'

export interface PushoverUser {
  id: string
  secret: string
  user_key: string
}

export interface PushoverDevice {
  id: string
  name: string
  os: string
}

export class PushoverClient {
  /**
   * Login to get the user's secret (needed for Open Client API)
   */
  async login(email: string, password: string): Promise<{ secret: string; userKey: string }> {
    const params = new URLSearchParams()
    params.append('email', email)
    params.append('password', password)

    const response = await fetch(`${PUSHOVER_API_URL}/users/login.json`, {
      method: 'POST',
      body: params,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Pushover login failed: ${response.status} ${error}`)
    }

    const data = await response.json()
    return {
      secret: data.secret,
      userKey: data.user_key, // API returns user_key, usually referenced as user key
    }
  }

  /**
   * Register a new desktop device
   */
  async registerDevice(secret: string, name: string): Promise<PushoverDevice> {
    const params = new URLSearchParams()
    params.append('secret', secret)
    params.append('name', name)
    params.append('os', 'O') // 'O' for Open Client

    const response = await fetch(`${PUSHOVER_API_URL}/devices.json`, {
      method: 'POST',
      body: params,
    })

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json()
        if (error.errors && error.errors[0]?.includes('already has a device')) {
            throw new Error(`Device name '${name}' is already taken. Please choose a different name.`)
        }
      }
      throw new Error(`Device registration failed: ${response.status} ${await response.text()}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      name: name,
      os: 'O',
    }
  }

  /**
   * Fetch messages for a device
   */
  async getMessages(secret: string, deviceId: string) {
    // Note: secret here is the User Secret obtained from login, NOT the app token.
    const url = `${PUSHOVER_API_URL}/messages.json?secret=${secret}&device_id=${deviceId}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status} ${await response.text()}`)
    }

    const data = await response.json()
    return data.messages || []
  }

  /**
   * Delete the highest message ID to acknowledge receipt and clear queue
   */
  async deleteMessages(secret: string, deviceId: string, messageId: number) {
     const params = new URLSearchParams()
     params.append('secret', secret)
     params.append('device_id', deviceId)
     params.append('message_id', messageId.toString())

     // The doc says: "highest message id that was retrieved"
     // POST https://api.pushover.net/1/devices/DEVICE_ID/update_highest_message.json
     // Wait, checking docs...
     // Docs say: "Once the client has downloaded messages... it should delete them from the server"
     // Usually this is done by updating the highest message ID.
     // Let's verify endpoint.
     // "https://api.pushover.net/1/devices/:device_id/update_highest_message.json"
     
     const response = await fetch(`${PUSHOVER_API_URL}/devices/${deviceId}/update_highest_message.json`, {
         method: 'POST',
         body: params
     })

     if (!response.ok) {
        console.warn(`Failed to ack messages: ${response.status}`)
     }
  }
}

export const pushoverClient = new PushoverClient()
