import type { AndroidLocationParams, AndroidLocationResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const locationTool: ToolConfig<AndroidLocationParams, AndroidLocationResponse> = {
  id: 'android_location',
  name: 'Android Location',
  description: 'Get device location from Android GPS or network provider',
  version: '1.0',

  params: {
    provider: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Location provider (gps, network, passive)',
    },
    request: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Request type (once, last, updates)',
    },
  },

  request: {
    url: '/api/tools/android/location',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      provider: params.provider || 'gps',
      request: params.request || 'once',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android location failed')
    }

    return {
      success: true,
      output: {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        accuracy: data.accuracy,
        bearing: data.bearing,
        speed: data.speed,
        provider: data.provider,
        timestamp: data.timestamp,
      },
      error: undefined,
    }
  },

  outputs: {
    latitude: { type: 'number', description: 'Latitude coordinate' },
    longitude: { type: 'number', description: 'Longitude coordinate' },
    altitude: { type: 'number', description: 'Altitude in meters' },
    accuracy: { type: 'number', description: 'Accuracy in meters' },
    bearing: { type: 'number', description: 'Bearing in degrees' },
    speed: { type: 'number', description: 'Speed in m/s' },
    provider: { type: 'string', description: 'Location provider used' },
    timestamp: { type: 'string', description: 'Timestamp of location fix' },
  },
}
