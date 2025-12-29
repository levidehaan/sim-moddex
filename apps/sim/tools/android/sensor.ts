import type { AndroidSensorParams, AndroidSensorResponse } from '@/tools/android/types'
import type { ToolConfig } from '@/tools/types'

export const sensorTool: ToolConfig<AndroidSensorParams, AndroidSensorResponse> = {
  id: 'android_sensor',
  name: 'Android Sensor',
  description: 'Read sensor data from Android device (accelerometer, gyroscope, light, etc.)',
  version: '1.0',

  params: {
    sensor: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Sensor type (accelerometer, gyroscope, light, proximity, etc.)',
    },
    delay: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Sensor delay (fastest, game, ui, normal)',
    },
    duration: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Duration to collect readings in milliseconds (default: 1000)',
    },
  },

  request: {
    url: '/api/tools/android/sensors',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      sensor: params.sensor,
      delay: params.delay,
      duration: params.duration,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Android sensor read failed')
    }

    return {
      success: true,
      output: {
        sensor: data.sensor,
        readings: data.readings,
        message: data.message || 'Sensor data retrieved successfully',
      },
      error: undefined,
    }
  },

  outputs: {
    sensor: { type: 'string', description: 'Sensor name' },
    readings: { type: 'array', description: 'Array of sensor readings with values and timestamps' },
    message: { type: 'string', description: 'Status message' },
  },
}
