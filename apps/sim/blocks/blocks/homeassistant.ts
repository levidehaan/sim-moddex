import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Home } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const HomeAssistantIcon = (props: SVGProps<SVGSVGElement>) => createElement(Home, props)

export const HomeAssistantBlock: BlockConfig = {
  type: 'homeassistant',
  name: 'Home Assistant',
  description: 'Smart home automation and control',
  longDescription:
    'Access Home Assistant REST API for smart home control, automation, device states, and services. Control lights, switches, sensors, climate, and more. Essential for IoT and smart home automation workflows.',
  category: 'tools',
  bgColor: '#41BDF5',
  icon: HomeAssistantIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get States', id: 'get_states' },
        { label: 'Get State', id: 'get_state' },
        { label: 'Set State', id: 'set_state' },
        { label: 'Call Service', id: 'call_service' },
        { label: 'Get Services', id: 'get_services' },
        { label: 'Get Config', id: 'get_config' },
        { label: 'Get Events', id: 'get_events' },
        { label: 'Fire Event', id: 'fire_event' },
      ],
      value: () => 'get_states',
    },
    {
      id: 'baseUrl',
      title: 'Base URL',
      type: 'short-input',
      placeholder: 'http://homeassistant.local:8123',
      description: 'Home Assistant instance URL',
      required: true,
    },
    {
      id: 'accessToken',
      title: 'Access Token',
      type: 'short-input',
      placeholder: 'Long-lived access token',
      password: true,
      required: true,
      connectionDroppable: false,
    },
    {
      id: 'entityId',
      title: 'Entity ID',
      type: 'short-input',
      placeholder: 'e.g., light.living_room, switch.bedroom',
      description: 'Entity identifier',
      condition: {
        field: 'operation',
        value: ['get_state', 'set_state'],
      },
    },
    {
      id: 'state',
      title: 'State',
      type: 'short-input',
      placeholder: 'e.g., on, off, 50',
      description: 'New state value',
      condition: {
        field: 'operation',
        value: ['set_state'],
      },
    },
    {
      id: 'attributes',
      title: 'Attributes (JSON)',
      type: 'long-input',
      placeholder: '{"brightness": 255, "color_temp": 400}',
      description: 'State attributes as JSON',
      condition: {
        field: 'operation',
        value: ['set_state'],
      },
    },
    {
      id: 'domain',
      title: 'Domain',
      type: 'short-input',
      placeholder: 'e.g., light, switch, climate',
      description: 'Service domain',
      condition: {
        field: 'operation',
        value: ['call_service'],
      },
    },
    {
      id: 'service',
      title: 'Service',
      type: 'short-input',
      placeholder: 'e.g., turn_on, turn_off, set_temperature',
      description: 'Service name',
      condition: {
        field: 'operation',
        value: ['call_service'],
      },
    },
    {
      id: 'serviceData',
      title: 'Service Data (JSON)',
      type: 'long-input',
      placeholder: '{"entity_id": "light.living_room", "brightness": 255}',
      description: 'Service call data as JSON',
      condition: {
        field: 'operation',
        value: ['call_service'],
      },
    },
    {
      id: 'eventType',
      title: 'Event Type',
      type: 'short-input',
      placeholder: 'e.g., custom_event',
      description: 'Event type to fire',
      condition: {
        field: 'operation',
        value: ['fire_event'],
      },
    },
    {
      id: 'eventData',
      title: 'Event Data (JSON)',
      type: 'long-input',
      placeholder: '{"message": "Hello"}',
      description: 'Event data as JSON',
      condition: {
        field: 'operation',
        value: ['fire_event'],
      },
    },
  ],
  tools: {
    access: ['homeassistant_api'],
    config: {
      tool: () => 'homeassistant_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'get_states',
          baseUrl: params.baseUrl,
          accessToken: params.accessToken,
        }

        if (params.entityId) result.entityId = params.entityId
        if (params.state) result.state = params.state
        if (params.attributes) {
          try {
            result.attributes = JSON.parse(params.attributes)
          } catch {
            result.attributes = params.attributes
          }
        }
        if (params.domain) result.domain = params.domain
        if (params.service) result.service = params.service
        if (params.serviceData) {
          try {
            result.serviceData = JSON.parse(params.serviceData)
          } catch {
            result.serviceData = params.serviceData
          }
        }
        if (params.eventType) result.eventType = params.eventType
        if (params.eventData) {
          try {
            result.eventData = JSON.parse(params.eventData)
          } catch {
            result.eventData = params.eventData
          }
        }

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    baseUrl: { type: 'string', description: 'Home Assistant base URL' },
    accessToken: { type: 'string', description: 'Access token' },
    entityId: { type: 'string', description: 'Entity ID' },
    state: { type: 'string', description: 'State value' },
    attributes: { type: 'json', description: 'State attributes' },
    domain: { type: 'string', description: 'Service domain' },
    service: { type: 'string', description: 'Service name' },
    serviceData: { type: 'json', description: 'Service data' },
    eventType: { type: 'string', description: 'Event type' },
    eventData: { type: 'json', description: 'Event data' },
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
