import { z } from 'zod'
import { tool } from '@/tools/registry'
import { pushoverClient } from '@/lib/pushover/client'

export const pushoverRegisterDeviceTool = tool({
  id: 'pushover_register_device',
  name: 'Register Pushover Device',
  description:
    'Register a new Open Client device for Pushover to receive messages. Returns the Secret and Device ID needed for the Pushover Trigger.',
  params: {
    email: {
      type: 'string',
      description: 'Your Pushover account email',
      required: true,
    },
    password: {
      type: 'string',
      description: 'Your Pushover account password',
      required: true,
    },
    deviceName: {
      type: 'string',
      description: 'A unique name for this device (e.g. "SimTrigger")',
      required: true,
    },
  },
  run: async ({ email, password, deviceName }) => {
    try {
      // 1. Login to get User Secret
      const { secret } = await pushoverClient.login(email, password)

      // 2. Register Device
      const device = await pushoverClient.registerDevice(secret, deviceName)

      return {
        success: true,
        output: {
          message: 'Device registered successfully. Save these credentials securely.',
          secret: secret,
          deviceId: device.id,
          deviceName: device.name,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  },
})
