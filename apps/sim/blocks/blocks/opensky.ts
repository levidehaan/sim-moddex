import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Plane } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const OpenSkyIcon = (props: SVGProps<SVGSVGElement>) => createElement(Plane, props)

export const OpenSkyBlock: BlockConfig = {
  type: 'opensky',
  name: 'OpenSky Network',
  description: 'Real-time flight tracking data',
  longDescription:
    'Access the OpenSky Network API for real-time flight tracking, aircraft positions, flight paths, and aviation data. Free tier offers anonymous access with rate limits. Essential for aviation monitoring and logistics automation.',
  category: 'tools',
  bgColor: '#0066CC',
  icon: OpenSkyIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get All States (Live Flights)', id: 'states' },
        { label: 'Get Flights by Aircraft', id: 'flights_aircraft' },
        { label: 'Get Flights by Interval', id: 'flights_interval' },
        { label: 'Get Arrivals by Airport', id: 'arrivals' },
        { label: 'Get Departures by Airport', id: 'departures' },
      ],
      value: () => 'states',
    },
    {
      id: 'username',
      title: 'Username (Optional)',
      type: 'short-input',
      placeholder: 'OpenSky Network username for higher limits',
      description: 'Optional - increases rate limits',
    },
    {
      id: 'password',
      title: 'Password (Optional)',
      type: 'short-input',
      placeholder: 'OpenSky Network password',
      password: true,
      description: 'Optional - required if username provided',
    },
    {
      id: 'icao24',
      title: 'ICAO24 Address',
      type: 'short-input',
      placeholder: 'e.g., a12345',
      description: 'Aircraft transponder address (hex)',
      condition: {
        field: 'operation',
        value: ['flights_aircraft'],
      },
    },
    {
      id: 'airport',
      title: 'Airport ICAO Code',
      type: 'short-input',
      placeholder: 'e.g., KJFK, EGLL, LFPG',
      description: '4-letter ICAO airport code',
      condition: {
        field: 'operation',
        value: ['arrivals', 'departures'],
      },
    },
    {
      id: 'begin',
      title: 'Begin Time (Unix)',
      type: 'short-input',
      placeholder: 'Unix timestamp',
      description: 'Start time for query',
      condition: {
        field: 'operation',
        value: ['flights_aircraft', 'flights_interval', 'arrivals', 'departures'],
      },
    },
    {
      id: 'end',
      title: 'End Time (Unix)',
      type: 'short-input',
      placeholder: 'Unix timestamp',
      description: 'End time for query',
      condition: {
        field: 'operation',
        value: ['flights_aircraft', 'flights_interval', 'arrivals', 'departures'],
      },
    },
    {
      id: 'bbox',
      title: 'Bounding Box',
      type: 'short-input',
      placeholder: 'lamin,lomin,lamax,lomax',
      description: 'Geographic bounds: min_lat,min_lon,max_lat,max_lon',
      condition: {
        field: 'operation',
        value: ['states'],
      },
    },
  ],
  tools: {
    access: ['opensky_api'],
    config: {
      tool: () => 'opensky_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'states',
        }

        if (params.username) result.username = params.username
        if (params.password) result.password = params.password
        if (params.icao24) result.icao24 = params.icao24
        if (params.airport) result.airport = params.airport
        if (params.begin) result.begin = Number(params.begin)
        if (params.end) result.end = Number(params.end)
        if (params.bbox) result.bbox = params.bbox

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    username: { type: 'string', description: 'OpenSky username (optional)' },
    password: { type: 'string', description: 'OpenSky password (optional)' },
    icao24: { type: 'string', description: 'Aircraft ICAO24 address' },
    airport: { type: 'string', description: 'Airport ICAO code' },
    begin: { type: 'number', description: 'Begin timestamp' },
    end: { type: 'number', description: 'End timestamp' },
    bbox: { type: 'string', description: 'Bounding box coordinates' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    states: { type: 'array', description: 'Aircraft states' },
    flights: { type: 'array', description: 'Flight data' },
    time: { type: 'number', description: 'Response timestamp' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
