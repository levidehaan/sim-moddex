import { z } from 'zod'
import { tool } from '@/tools/registry'

export const pushoverListDevicesTool = tool({
  id: 'pushover_list_devices',
  name: 'List Pushover Devices',
  description:
    'List available device names for a Pushover user. Requires App Token and User Key.',
  params: {
    token: { 
        type: 'string', 
        description: 'Application API Token',
        required: true 
    },
    user: { 
        type: 'string', 
        description: 'User Key',
        required: true 
    }
  },
  run: async ({ token, user }) => {
    try {
      const params = new URLSearchParams()
      params.append('token', token)
      params.append('user', user)

      const response = await fetch('https://api.pushover.net/1/users/validate.json', {
          method: 'POST',
          body: params
      })

      if (!response.ok) {
          throw new Error(`Failed to validate user: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 1) {
          throw new Error('User validation failed.')
      }

      return {
        success: true,
        output: {
          devices: data.devices || []
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
