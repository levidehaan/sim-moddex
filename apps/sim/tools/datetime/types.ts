/**
 * DateTime Tool Types
 */

export interface DateTimeToolParams {
  format?: string
  timezone?: string
  locale?: string
  customFormat?: string
}

export interface DateTimeToolResponse {
  success: boolean
  output: {
    iso: string
    unix: number
    unixMs: number
    formatted: string
    date: string
    time: string
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
    dayOfWeek: string
    dayOfYear: number
    weekOfYear: number
    quarter: number
    timezone: string
    offset: string
  }
}

/**
 * Pre-defined date format options
 */
export const DATE_FORMATS = {
  iso: 'ISO 8601',
  iso_date: 'ISO Date Only',
  iso_time: 'ISO Time Only',
  us: 'US (MM/DD/YYYY)',
  us_long: 'US Long (Month DD, YYYY)',
  eu: 'EU (DD/MM/YYYY)',
  eu_long: 'EU Long (DD Month YYYY)',
  unix: 'Unix Timestamp',
  unix_ms: 'Unix Timestamp (ms)',
  rfc2822: 'RFC 2822',
  relative: 'Relative',
  custom: 'Custom Format',
} as const

export type DateFormatKey = keyof typeof DATE_FORMATS
