import { Calendar } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const DateTimeBlock: BlockConfig = {
  type: 'datetime',
  name: 'Date/Time',
  description: 'Get current date and time in various formats',
  longDescription:
    'Returns the current date and time in multiple formats including ISO 8601, Unix timestamps, US/EU formats, and custom format strings. Supports timezone conversion and locale-aware formatting.',
  category: 'tools',
  bgColor: '#6366F1',
  icon: Calendar,
  subBlocks: [
    {
      id: 'format',
      title: 'Format',
      type: 'dropdown',
      options: [
        { label: 'ISO 8601', id: 'iso' },
        { label: 'ISO Date Only', id: 'iso_date' },
        { label: 'ISO Time Only', id: 'iso_time' },
        { label: 'US (MM/DD/YYYY)', id: 'us' },
        { label: 'US Long (Month DD, YYYY)', id: 'us_long' },
        { label: 'EU (DD/MM/YYYY)', id: 'eu' },
        { label: 'EU Long (DD Month YYYY)', id: 'eu_long' },
        { label: 'Unix Timestamp', id: 'unix' },
        { label: 'Unix Timestamp (ms)', id: 'unix_ms' },
        { label: 'RFC 2822', id: 'rfc2822' },
        { label: 'Custom Format', id: 'custom' },
      ],
      value: () => 'iso',
    },
    {
      id: 'customFormat',
      title: 'Custom Format',
      type: 'short-input',
      placeholder: 'e.g., YYYY-MM-DD HH:mm:ss',
      condition: { field: 'format', value: 'custom' },
    },
    {
      id: 'timezone',
      title: 'Timezone',
      type: 'short-input',
      placeholder: 'e.g., America/New_York, Europe/London',
    },
    {
      id: 'locale',
      title: 'Locale',
      type: 'short-input',
      placeholder: 'e.g., en-US, de-DE, ja-JP',
    },
  ],
  tools: {
    access: ['datetime_now'],
    config: {
      tool: () => 'datetime_now',
      params: (params) => {
        const result: Record<string, string> = {}
        if (params.format) result.format = params.format
        if (params.customFormat) result.customFormat = params.customFormat
        if (params.timezone) result.timezone = params.timezone
        if (params.locale) result.locale = params.locale
        return result
      },
    },
  },
  inputs: {
    format: { type: 'string', description: 'Output format' },
    customFormat: { type: 'string', description: 'Custom format string' },
    timezone: { type: 'string', description: 'IANA timezone name' },
    locale: { type: 'string', description: 'Locale for formatting' },
  },
  outputs: {
    iso: { type: 'string', description: 'ISO 8601 formatted date/time' },
    unix: { type: 'number', description: 'Unix timestamp (seconds)' },
    unixMs: { type: 'number', description: 'Unix timestamp (milliseconds)' },
    formatted: { type: 'string', description: 'Date/time in the requested format' },
    date: { type: 'string', description: 'Date portion (YYYY-MM-DD)' },
    time: { type: 'string', description: 'Time portion (HH:mm:ss.sss)' },
    year: { type: 'number', description: 'Year' },
    month: { type: 'number', description: 'Month (1-12)' },
    day: { type: 'number', description: 'Day of month (1-31)' },
    hour: { type: 'number', description: 'Hour (0-23)' },
    minute: { type: 'number', description: 'Minute (0-59)' },
    second: { type: 'number', description: 'Second (0-59)' },
    dayOfWeek: { type: 'string', description: 'Day of week name' },
    dayOfYear: { type: 'number', description: 'Day of year (1-366)' },
    weekOfYear: { type: 'number', description: 'ISO week number (1-53)' },
    quarter: { type: 'number', description: 'Quarter (1-4)' },
    timezone: { type: 'string', description: 'Timezone name' },
    offset: { type: 'string', description: 'UTC offset' },
  },
}
