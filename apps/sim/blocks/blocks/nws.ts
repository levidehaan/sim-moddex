import { Cloud } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const NWSBlock: BlockConfig = {
  type: 'nws',
  name: 'National Weather Service',
  description: 'Get weather forecasts and alerts from NWS',
  longDescription:
    'Access the National Weather Service API for weather forecasts, current conditions, and severe weather alerts. Completely free with unlimited access and no API key required. Covers the United States and its territories.',
  category: 'tools',
  bgColor: '#1E40AF',
  icon: Cloud,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Forecast', id: 'forecast' },
        { label: 'Get Hourly Forecast', id: 'forecast_hourly' },
        { label: 'Get Current Conditions', id: 'current' },
        { label: 'Get Active Alerts', id: 'alerts' },
        { label: 'Get Alerts by Area', id: 'alerts_area' },
        { label: 'Get Grid Data', id: 'gridpoints' },
      ],
      value: () => 'forecast',
    },
    {
      id: 'latitude',
      title: 'Latitude',
      type: 'short-input',
      placeholder: 'e.g., 39.7456',
      description: 'Latitude coordinate',
      condition: { field: 'operation', value: 'alerts', not: true },
    },
    {
      id: 'longitude',
      title: 'Longitude',
      type: 'short-input',
      placeholder: 'e.g., -97.0892',
      description: 'Longitude coordinate',
      condition: { field: 'operation', value: 'alerts', not: true },
    },
    {
      id: 'state',
      title: 'State Code',
      type: 'short-input',
      placeholder: 'e.g., KS, TX, CA',
      description: 'Two-letter state code for area alerts',
      condition: { field: 'operation', value: 'alerts_area' },
    },
    {
      id: 'urgency',
      title: 'Alert Urgency',
      type: 'dropdown',
      options: [
        { label: 'All', id: 'all' },
        { label: 'Immediate', id: 'Immediate' },
        { label: 'Expected', id: 'Expected' },
        { label: 'Future', id: 'Future' },
      ],
      value: () => 'all',
      condition: { field: 'operation', value: 'alerts' },
    },
    {
      id: 'severity',
      title: 'Alert Severity',
      type: 'dropdown',
      options: [
        { label: 'All', id: 'all' },
        { label: 'Extreme', id: 'Extreme' },
        { label: 'Severe', id: 'Severe' },
        { label: 'Moderate', id: 'Moderate' },
        { label: 'Minor', id: 'Minor' },
      ],
      value: () => 'all',
      condition: { field: 'operation', value: 'alerts' },
    },
  ],
  tools: {
    access: ['nws_weather'],
    config: {
      tool: () => 'nws_weather',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'forecast',
        }

        if (params.latitude) result.latitude = Number(params.latitude)
        if (params.longitude) result.longitude = Number(params.longitude)
        if (params.state) result.state = params.state
        if (params.urgency && params.urgency !== 'all') result.urgency = params.urgency
        if (params.severity && params.severity !== 'all') result.severity = params.severity

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    latitude: { type: 'number', description: 'Latitude coordinate' },
    longitude: { type: 'number', description: 'Longitude coordinate' },
    state: { type: 'string', description: 'State code for area alerts' },
    urgency: { type: 'string', description: 'Alert urgency filter' },
    severity: { type: 'string', description: 'Alert severity filter' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    forecast: { type: 'json', description: 'Weather forecast data' },
    periods: { type: 'array', description: 'Forecast periods with conditions' },
    alerts: { type: 'array', description: 'Active weather alerts' },
    location: { type: 'json', description: 'Location information' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
