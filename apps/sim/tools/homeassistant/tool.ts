import type { ToolConfig } from '@/tools/types'
import type { HomeAssistantToolParams, HomeAssistantToolResponse } from './types'

export const homeassistantTool: ToolConfig<HomeAssistantToolParams, HomeAssistantToolResponse> = {
  id: 'homeassistant_api',
  name: 'Home Assistant API',
  description: 'Control and monitor smart home devices',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Operation to perform',
    },
    baseUrl: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Home Assistant base URL',
    },
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Access token',
    },
    entityId: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Entity ID',
    },
    state: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'State value',
    },
    attributes: {
      type: 'json',
      required: false,
      visibility: 'user-only',
      description: 'State attributes',
    },
    domain: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Service domain',
    },
    service: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Service name',
    },
    serviceData: {
      type: 'json',
      required: false,
      visibility: 'user-only',
      description: 'Service data',
    },
    eventType: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Event type',
    },
    eventData: {
      type: 'json',
      required: false,
      visibility: 'user-only',
      description: 'Event data',
    },
  },

  request: {
    url: '',
    method: 'GET',
    headers: () => ({}),
  },

  directExecution: async (params: HomeAssistantToolParams) => {
    try {
      const baseUrl = params.baseUrl.replace(/\/$/, '')
      let endpoint = ''
      let method = 'GET'
      let body: any = undefined

      switch (params.operation) {
        case 'get_states':
          endpoint = '/api/states'
          break
        case 'get_state':
          if (!params.entityId) throw new Error('entityId is required for get_state')
          endpoint = `/api/states/${params.entityId}`
          break
        case 'set_state':
          if (!params.entityId) throw new Error('entityId is required for set_state')
          if (!params.state) throw new Error('state is required for set_state')
          endpoint = `/api/states/${params.entityId}`
          method = 'POST'
          body = {
            state: params.state,
            attributes: params.attributes || {},
          }
          break
        case 'call_service':
          if (!params.domain) throw new Error('domain is required for call_service')
          if (!params.service) throw new Error('service is required for call_service')
          endpoint = `/api/services/${params.domain}/${params.service}`
          method = 'POST'
          body = params.serviceData || {}
          break
        case 'get_services':
          endpoint = '/api/services'
          break
        case 'get_config':
          endpoint = '/api/config'
          break
        case 'get_events':
          endpoint = '/api/events'
          break
        case 'fire_event':
          if (!params.eventType) throw new Error('eventType is required for fire_event')
          endpoint = `/api/events/${params.eventType}`
          method = 'POST'
          body = params.eventData || {}
          break
        default:
          throw new Error(`Unknown operation: ${params.operation}`)
      }

      const url = `${baseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Home Assistant API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      return {
        success: true,
        output: {
          states: Array.isArray(data) ? data : undefined,
          state: !Array.isArray(data) && data.entity_id ? data : undefined,
          services: params.operation === 'get_services' ? data : undefined,
          config: params.operation === 'get_config' ? data : undefined,
          events: params.operation === 'get_events' ? data : undefined,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    states: { type: 'array', description: 'Entity states' },
    state: { type: 'json', description: 'Entity state' },
    services: { type: 'json', description: 'Available services' },
    config: { type: 'json', description: 'Home Assistant configuration' },
    events: { type: 'array', description: 'Event types' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
