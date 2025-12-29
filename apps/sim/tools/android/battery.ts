import type { AndroidBatteryResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const batteryTool: ToolConfig<Record<string, never>, AndroidBatteryResponse> = {
  id: 'android_battery',
  name: 'Android Battery Status',
  description: 'Get battery status information from Android device',
  version: '1.0',

  params: {},

  request: {
    url: '/api/tools/android/battery',
    method: 'GET',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: () => ({}),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android battery status failed')
    }

    return {
      success: true,
      output: {
        health: data.health,
        percentage: data.percentage,
        plugged: data.plugged,
        status: data.status,
        temperature: data.temperature,
        current: data.current,
      },
      error: undefined,
    }
  },

  outputs: {
    health: { type: 'string', description: 'Battery health status' },
    percentage: { type: 'number', description: 'Battery percentage (0-100)' },
    plugged: { type: 'string', description: 'Charging source (USB, AC, WIRELESS, UNPLUGGED)' },
    status: { type: 'string', description: 'Battery status (CHARGING, DISCHARGING, FULL, etc.)' },
    temperature: { type: 'number', description: 'Battery temperature in Celsius' },
    current: { type: 'number', description: 'Current battery current in microamps' },
  },
}
