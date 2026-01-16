import { Activity } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const USGSEarthquakeBlock: BlockConfig = {
  type: 'usgs_earthquake',
  name: 'USGS Earthquake',
  description: 'Get real-time earthquake data from USGS',
  longDescription:
    'Access the USGS Earthquake Hazards Program API for real-time earthquake data worldwide. Get recent earthquakes, search by location, magnitude, and time range. Completely free with no authentication required. Great for monitoring seismic activity and building alert systems.',
  category: 'tools',
  bgColor: '#8B4513',
  icon: Activity,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Recent Earthquakes', id: 'query' },
        { label: 'Get Significant Earthquakes', id: 'significant' },
        { label: 'Get Earthquake by ID', id: 'get_event' },
        { label: 'Get Earthquake Count', id: 'count' },
      ],
      value: () => 'query',
    },
    {
      id: 'eventId',
      title: 'Event ID',
      type: 'short-input',
      placeholder: 'e.g., us7000abcd',
      description: 'USGS earthquake event ID',
      condition: { field: 'operation', value: 'get_event' },
    },
    {
      id: 'startTime',
      title: 'Start Time',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-01 or NOW-7days',
      description: 'Start date (ISO 8601 or relative like NOW-7days)',
    },
    {
      id: 'endTime',
      title: 'End Time',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-31 or NOW',
      description: 'End date (ISO 8601 or relative)',
    },
    {
      id: 'minMagnitude',
      title: 'Minimum Magnitude',
      type: 'short-input',
      placeholder: 'e.g., 4.5',
      description: 'Minimum earthquake magnitude',
    },
    {
      id: 'maxMagnitude',
      title: 'Maximum Magnitude',
      type: 'short-input',
      placeholder: 'e.g., 9.0',
      description: 'Maximum earthquake magnitude',
    },
    {
      id: 'latitude',
      title: 'Latitude',
      type: 'short-input',
      placeholder: 'e.g., 37.7749',
      description: 'Center latitude for radius search',
    },
    {
      id: 'longitude',
      title: 'Longitude',
      type: 'short-input',
      placeholder: 'e.g., -122.4194',
      description: 'Center longitude for radius search',
    },
    {
      id: 'maxRadiusKm',
      title: 'Max Radius (km)',
      type: 'short-input',
      placeholder: 'e.g., 500',
      description: 'Search radius in kilometers',
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '20',
      description: 'Maximum number of results (default: 20, max: 20000)',
    },
    {
      id: 'orderBy',
      title: 'Order By',
      type: 'dropdown',
      options: [
        { label: 'Time (newest first)', id: 'time' },
        { label: 'Time (oldest first)', id: 'time-asc' },
        { label: 'Magnitude (largest first)', id: 'magnitude' },
        { label: 'Magnitude (smallest first)', id: 'magnitude-asc' },
      ],
      value: () => 'time',
    },
  ],
  tools: {
    access: ['usgs_earthquake_api'],
    config: {
      tool: () => 'usgs_earthquake_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'query',
        }

        if (params.eventId) result.eventId = params.eventId
        if (params.startTime) result.startTime = params.startTime
        if (params.endTime) result.endTime = params.endTime
        if (params.minMagnitude) result.minMagnitude = Number(params.minMagnitude)
        if (params.maxMagnitude) result.maxMagnitude = Number(params.maxMagnitude)
        if (params.latitude) result.latitude = Number(params.latitude)
        if (params.longitude) result.longitude = Number(params.longitude)
        if (params.maxRadiusKm) result.maxRadiusKm = Number(params.maxRadiusKm)
        if (params.limit) result.limit = Number(params.limit)
        if (params.orderBy) result.orderBy = params.orderBy

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    eventId: { type: 'string', description: 'Earthquake event ID' },
    startTime: { type: 'string', description: 'Start time for query' },
    endTime: { type: 'string', description: 'End time for query' },
    minMagnitude: { type: 'number', description: 'Minimum magnitude' },
    maxMagnitude: { type: 'number', description: 'Maximum magnitude' },
    latitude: { type: 'number', description: 'Center latitude for radius search' },
    longitude: { type: 'number', description: 'Center longitude for radius search' },
    maxRadiusKm: { type: 'number', description: 'Search radius in kilometers' },
    limit: { type: 'number', description: 'Maximum number of results' },
    orderBy: { type: 'string', description: 'Sort order' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    earthquakes: { type: 'array', description: 'Array of earthquake events' },
    count: { type: 'number', description: 'Number of earthquakes matching query' },
    event: { type: 'json', description: 'Single earthquake event details' },
    metadata: { type: 'json', description: 'Query metadata (count, API info)' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
