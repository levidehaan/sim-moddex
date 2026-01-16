import { createElement } from 'react'
import type { SVGProps } from 'react'
import { CloudRain } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const OpenMeteoIcon = (props: SVGProps<SVGSVGElement>) => createElement(CloudRain, props)

export const OpenMeteoBlock: BlockConfig = {
  type: 'openmeteo',
  name: 'Open-Meteo',
  description: 'Global weather forecasts and data',
  longDescription:
    'Access Open-Meteo API for weather forecasts, historical weather data, air quality, and climate data. Completely free with no API key required. Essential for weather-based automation and environmental monitoring.',
  category: 'tools',
  bgColor: '#4A90E2',
  icon: OpenMeteoIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Current Weather', id: 'current' },
        { label: 'Weather Forecast', id: 'forecast' },
        { label: 'Historical Weather', id: 'historical' },
        { label: 'Air Quality', id: 'air_quality' },
      ],
      value: () => 'current',
    },
    {
      id: 'latitude',
      title: 'Latitude',
      type: 'short-input',
      placeholder: 'e.g., 40.7128',
      description: 'Location latitude',
      required: true,
    },
    {
      id: 'longitude',
      title: 'Longitude',
      type: 'short-input',
      placeholder: 'e.g., -74.0060',
      description: 'Location longitude',
      required: true,
    },
    {
      id: 'startDate',
      title: 'Start Date',
      type: 'short-input',
      placeholder: 'YYYY-MM-DD',
      description: 'Start date for historical data',
      condition: {
        field: 'operation',
        value: ['historical'],
      },
    },
    {
      id: 'endDate',
      title: 'End Date',
      type: 'short-input',
      placeholder: 'YYYY-MM-DD',
      description: 'End date for historical data',
      condition: {
        field: 'operation',
        value: ['historical'],
      },
    },
    {
      id: 'hourly',
      title: 'Hourly Variables',
      type: 'short-input',
      placeholder: 'e.g., temperature_2m,precipitation,windspeed_10m',
      description: 'Comma-separated hourly weather variables',
    },
    {
      id: 'daily',
      title: 'Daily Variables',
      type: 'short-input',
      placeholder: 'e.g., temperature_2m_max,precipitation_sum',
      description: 'Comma-separated daily weather variables',
    },
    {
      id: 'timezone',
      title: 'Timezone',
      type: 'short-input',
      placeholder: 'e.g., America/New_York, auto',
      description: 'Timezone for timestamps',
    },
    {
      id: 'temperatureUnit',
      title: 'Temperature Unit',
      type: 'dropdown',
      options: [
        { label: 'Celsius', id: 'celsius' },
        { label: 'Fahrenheit', id: 'fahrenheit' },
      ],
      value: () => 'celsius',
    },
    {
      id: 'windspeedUnit',
      title: 'Wind Speed Unit',
      type: 'dropdown',
      options: [
        { label: 'km/h', id: 'kmh' },
        { label: 'mph', id: 'mph' },
        { label: 'm/s', id: 'ms' },
        { label: 'knots', id: 'kn' },
      ],
      value: () => 'kmh',
    },
    {
      id: 'precipitationUnit',
      title: 'Precipitation Unit',
      type: 'dropdown',
      options: [
        { label: 'mm', id: 'mm' },
        { label: 'inch', id: 'inch' },
      ],
      value: () => 'mm',
    },
  ],
  tools: {
    access: ['openmeteo_api'],
    config: {
      tool: () => 'openmeteo_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'current',
          latitude: Number(params.latitude),
          longitude: Number(params.longitude),
        }

        if (params.startDate) result.startDate = params.startDate
        if (params.endDate) result.endDate = params.endDate
        if (params.hourly) result.hourly = params.hourly
        if (params.daily) result.daily = params.daily
        if (params.timezone) result.timezone = params.timezone
        if (params.temperatureUnit) result.temperatureUnit = params.temperatureUnit
        if (params.windspeedUnit) result.windspeedUnit = params.windspeedUnit
        if (params.precipitationUnit) result.precipitationUnit = params.precipitationUnit

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    latitude: { type: 'number', description: 'Latitude' },
    longitude: { type: 'number', description: 'Longitude' },
    startDate: { type: 'string', description: 'Start date' },
    endDate: { type: 'string', description: 'End date' },
    hourly: { type: 'string', description: 'Hourly variables' },
    daily: { type: 'string', description: 'Daily variables' },
    timezone: { type: 'string', description: 'Timezone' },
    temperatureUnit: { type: 'string', description: 'Temperature unit' },
    windspeedUnit: { type: 'string', description: 'Wind speed unit' },
    precipitationUnit: { type: 'string', description: 'Precipitation unit' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    current: { type: 'json', description: 'Current weather data' },
    hourly: { type: 'json', description: 'Hourly forecast data' },
    daily: { type: 'json', description: 'Daily forecast data' },
    latitude: { type: 'number', description: 'Location latitude' },
    longitude: { type: 'number', description: 'Location longitude' },
    timezone: { type: 'string', description: 'Timezone' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
