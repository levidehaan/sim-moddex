import type { AndroidWifiParams, AndroidWifiResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const wifiTool: ToolConfig<AndroidWifiParams, AndroidWifiResponse> = {
  id: 'android_wifi',
  name: 'Android WiFi',
  description: 'Get WiFi information or scan for networks on Android',
  version: '1.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'WiFi operation (scan, info, enable, disable)',
    },
  },

  request: {
    url: '/api/tools/android/wifi',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      operation: params.operation,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android WiFi operation failed')
    }

    return {
      success: true,
      output: {
        connected: data.connected,
        ssid: data.ssid,
        bssid: data.bssid,
        ipAddress: data.ipAddress,
        linkSpeed: data.linkSpeed,
        networks: data.networks,
        message: data.message || 'WiFi operation successful',
      },
      error: undefined,
    }
  },

  outputs: {
    connected: { type: 'boolean', description: 'Whether WiFi is connected' },
    ssid: { type: 'string', description: 'Connected network SSID' },
    bssid: { type: 'string', description: 'Connected network BSSID' },
    ipAddress: { type: 'string', description: 'Device IP address' },
    linkSpeed: { type: 'number', description: 'Connection speed in Mbps' },
    networks: { type: 'array', description: 'Available networks (scan operation)' },
    message: { type: 'string', description: 'Status message' },
  },
}
