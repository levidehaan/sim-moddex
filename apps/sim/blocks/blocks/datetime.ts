import { Calendar } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const DateTimeBlock: BlockConfig = {
  type: 'datetime',
  name: 'Date/Time',
  description: 'Get, manipulate, and format dates and times',
  longDescription:
    'Returns date and time in multiple formats including ISO 8601, Unix timestamps, US/EU formats, and custom format strings. Supports timezone conversion, locale-aware formatting, and date arithmetic (add/subtract time). Use a base date or current time as the starting point.',
  category: 'tools',
  bgColor: '#6366F1',
  icon: Calendar,
  subBlocks: [
    {
      id: 'baseDate',
      title: 'Base Date',
      type: 'short-input',
      placeholder: 'Leave empty for current time, or enter date/timestamp',
      description: 'ISO 8601 string, Unix timestamp, or parseable date. Empty = now',
    },
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'None (just format)', id: 'none' },
        { label: 'Add Time', id: 'add' },
        { label: 'Subtract Time', id: 'subtract' },
      ],
      value: () => 'none',
    },
    {
      id: 'amount',
      title: 'Amount',
      type: 'short-input',
      placeholder: 'e.g., 5',
      condition: { field: 'operation', value: 'none', not: true },
    },
    {
      id: 'unit',
      title: 'Unit',
      type: 'dropdown',
      options: [
        { label: 'Years', id: 'years' },
        { label: 'Months', id: 'months' },
        { label: 'Weeks', id: 'weeks' },
        { label: 'Days', id: 'days' },
        { label: 'Hours', id: 'hours' },
        { label: 'Minutes', id: 'minutes' },
        { label: 'Seconds', id: 'seconds' },
      ],
      value: () => 'days',
      condition: { field: 'operation', value: 'none', not: true },
    },
    {
      id: 'format',
      title: 'Output Format',
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
        const result: Record<string, string | number> = {}
        if (params.baseDate) result.baseDate = params.baseDate
        if (params.operation) result.operation = params.operation
        if (params.amount) result.amount = Number(params.amount)
        if (params.unit) result.unit = params.unit
        if (params.format) result.format = params.format
        if (params.customFormat) result.customFormat = params.customFormat
        if (params.timezone) result.timezone = params.timezone
        if (params.locale) result.locale = params.locale
        return result
      },
    },
  },
  inputs: {
    baseDate: { type: 'string', description: 'Base date (ISO 8601, Unix timestamp, or parseable date string)' },
    operation: { type: 'string', description: 'Operation: none, add, or subtract' },
    amount: { type: 'number', description: 'Amount of time to add or subtract' },
    unit: { type: 'string', description: 'Unit: years, months, weeks, days, hours, minutes, seconds' },
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
