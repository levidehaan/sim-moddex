import type { ToolConfig } from '@/tools/types'
import type { DateTimeToolParams, DateTimeToolResponse } from './types'

/**
 * Formats a date according to the specified format string
 * Supports common format tokens similar to moment.js/date-fns
 */
function formatCustomDate(date: Date, formatStr: string, locale: string): string {
  const pad = (n: number, width = 2) => n.toString().padStart(width, '0')

  const tokens: Record<string, () => string> = {
    // Year
    YYYY: () => date.getFullYear().toString(),
    YY: () => date.getFullYear().toString().slice(-2),
    // Month
    MMMM: () => date.toLocaleDateString(locale, { month: 'long' }),
    MMM: () => date.toLocaleDateString(locale, { month: 'short' }),
    MM: () => pad(date.getMonth() + 1),
    M: () => (date.getMonth() + 1).toString(),
    // Day
    DD: () => pad(date.getDate()),
    D: () => date.getDate().toString(),
    Do: () => {
      const d = date.getDate()
      const suffix =
        d === 1 || d === 21 || d === 31
          ? 'st'
          : d === 2 || d === 22
            ? 'nd'
            : d === 3 || d === 23
              ? 'rd'
              : 'th'
      return `${d}${suffix}`
    },
    // Day of week
    dddd: () => date.toLocaleDateString(locale, { weekday: 'long' }),
    ddd: () => date.toLocaleDateString(locale, { weekday: 'short' }),
    dd: () => date.toLocaleDateString(locale, { weekday: 'narrow' }),
    d: () => date.getDay().toString(),
    // Hour
    HH: () => pad(date.getHours()),
    H: () => date.getHours().toString(),
    hh: () => pad(date.getHours() % 12 || 12),
    h: () => (date.getHours() % 12 || 12).toString(),
    // Minute
    mm: () => pad(date.getMinutes()),
    m: () => date.getMinutes().toString(),
    // Second
    ss: () => pad(date.getSeconds()),
    s: () => date.getSeconds().toString(),
    // Millisecond
    SSS: () => pad(date.getMilliseconds(), 3),
    // AM/PM
    A: () => (date.getHours() < 12 ? 'AM' : 'PM'),
    a: () => (date.getHours() < 12 ? 'am' : 'pm'),
    // Timezone
    Z: () => {
      const offset = -date.getTimezoneOffset()
      const sign = offset >= 0 ? '+' : '-'
      const hours = pad(Math.floor(Math.abs(offset) / 60))
      const mins = pad(Math.abs(offset) % 60)
      return `${sign}${hours}:${mins}`
    },
    ZZ: () => {
      const offset = -date.getTimezoneOffset()
      const sign = offset >= 0 ? '+' : '-'
      const hours = pad(Math.floor(Math.abs(offset) / 60))
      const mins = pad(Math.abs(offset) % 60)
      return `${sign}${hours}${mins}`
    },
    // Quarter
    Q: () => Math.ceil((date.getMonth() + 1) / 3).toString(),
    // Week of year (ISO)
    W: () => getWeekOfYear(date).toString(),
    WW: () => pad(getWeekOfYear(date)),
    // Day of year
    DDD: () => getDayOfYear(date).toString(),
    DDDD: () => pad(getDayOfYear(date), 3),
    // Unix timestamp
    X: () => Math.floor(date.getTime() / 1000).toString(),
    x: () => date.getTime().toString(),
  }

  // Sort tokens by length (longest first) to match correctly
  const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length)

  let result = formatStr
  for (const token of sortedTokens) {
    result = result.replace(new RegExp(token, 'g'), tokens[token]())
  }

  return result
}

/**
 * Get ISO week number
 */
function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Get timezone offset string
 */
function getTimezoneOffset(date: Date): string {
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
    .toString()
    .padStart(2, '0')
  const mins = (Math.abs(offset) % 60).toString().padStart(2, '0')
  return `${sign}${hours}:${mins}`
}

export const dateTimeTool: ToolConfig<DateTimeToolParams, DateTimeToolResponse> = {
  id: 'datetime_now',
  name: 'Get Current Date/Time',
  description:
    'Returns the current date and time in various formats including ISO, Unix timestamp, and custom formats',
  version: '1.0.0',

  params: {
    format: {
      type: 'string',
      required: false,
      description:
        'Output format: iso, iso_date, iso_time, us, us_long, eu, eu_long, unix, unix_ms, rfc2822, relative, or custom',
    },
    timezone: {
      type: 'string',
      required: false,
      description: 'IANA timezone name (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")',
    },
    locale: {
      type: 'string',
      required: false,
      description: 'Locale for formatting (e.g., "en-US", "de-DE", "ja-JP")',
    },
    customFormat: {
      type: 'string',
      required: false,
      description:
        'Custom format string using tokens: YYYY, MM, DD, HH, mm, ss, etc. (only used when format is "custom")',
    },
  },

  directExecution: async (params: DateTimeToolParams): Promise<DateTimeToolResponse> => {
    const locale = params.locale || 'en-US'
    const timezone = params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

    // Create date in the specified timezone
    const now = new Date()
    let dateInTz: Date

    try {
      // Format the date in the target timezone, then parse it back
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })

      const parts = formatter.formatToParts(now)
      const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '0'

      dateInTz = new Date(
        Number.parseInt(getPart('year')),
        Number.parseInt(getPart('month')) - 1,
        Number.parseInt(getPart('day')),
        Number.parseInt(getPart('hour')),
        Number.parseInt(getPart('minute')),
        Number.parseInt(getPart('second'))
      )
    } catch {
      // Fallback to local time if timezone is invalid
      dateInTz = now
    }

    // Format based on selected format
    let formatted: string
    const format = params.format || 'iso'

    switch (format) {
      case 'iso':
        formatted = now.toISOString()
        break
      case 'iso_date':
        formatted = now.toISOString().split('T')[0]
        break
      case 'iso_time':
        formatted = now.toISOString().split('T')[1].replace('Z', '')
        break
      case 'us':
        formatted = dateInTz.toLocaleDateString('en-US', {
          timeZone: timezone,
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
        break
      case 'us_long':
        formatted = dateInTz.toLocaleDateString('en-US', {
          timeZone: timezone,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        break
      case 'eu':
        formatted = dateInTz.toLocaleDateString('en-GB', {
          timeZone: timezone,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        break
      case 'eu_long':
        formatted = dateInTz.toLocaleDateString('en-GB', {
          timeZone: timezone,
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        break
      case 'unix':
        formatted = Math.floor(now.getTime() / 1000).toString()
        break
      case 'unix_ms':
        formatted = now.getTime().toString()
        break
      case 'rfc2822':
        formatted = now.toUTCString()
        break
      case 'relative':
        formatted = 'now'
        break
      case 'custom':
        formatted = formatCustomDate(dateInTz, params.customFormat || 'YYYY-MM-DD HH:mm:ss', locale)
        break
      default:
        formatted = now.toISOString()
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return {
      success: true,
      output: {
        iso: now.toISOString(),
        unix: Math.floor(now.getTime() / 1000),
        unixMs: now.getTime(),
        formatted,
        date: now.toISOString().split('T')[0],
        time: now.toISOString().split('T')[1].replace('Z', ''),
        year: dateInTz.getFullYear(),
        month: dateInTz.getMonth() + 1,
        day: dateInTz.getDate(),
        hour: dateInTz.getHours(),
        minute: dateInTz.getMinutes(),
        second: dateInTz.getSeconds(),
        dayOfWeek: dayNames[dateInTz.getDay()],
        dayOfYear: getDayOfYear(dateInTz),
        weekOfYear: getWeekOfYear(dateInTz),
        quarter: Math.ceil((dateInTz.getMonth() + 1) / 3),
        timezone,
        offset: getTimezoneOffset(now),
      },
    }
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
