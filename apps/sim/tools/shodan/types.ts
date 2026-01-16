/**
 * Shodan API Tool Types
 */

export type ShodanOperation =
  | 'search'
  | 'host'
  | 'dns_lookup'
  | 'dns_reverse'
  | 'my_ip'
  | 'api_info'
  | 'exploits'
  | 'ports'
  | 'protocols'

export interface ShodanToolParams {
  apiKey: string
  operation: ShodanOperation
  query?: string
  ip?: string
  hostnames?: string[]
  ips?: string[]
  exploitQuery?: string
  page?: number
  minify?: boolean
}

export interface ShodanHostService {
  port: number
  transport: string
  product?: string
  version?: string
  data: string
  timestamp: string
  hostnames?: string[]
  domains?: string[]
  location?: {
    city?: string
    region_code?: string
    country_code?: string
    country_name?: string
    latitude?: number
    longitude?: number
  }
  vulns?: Record<string, {
    cvss: number
    references: string[]
    summary: string
    verified: boolean
  }>
}

export interface ShodanHost {
  ip_str: string
  asn?: string
  hostnames?: string[]
  domains?: string[]
  country_code?: string
  country_name?: string
  city?: string
  region_code?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  isp?: string
  org?: string
  os?: string
  ports?: number[]
  vulns?: string[]
  tags?: string[]
  data?: ShodanHostService[]
  last_update?: string
}

export interface ShodanSearchResult {
  matches: ShodanHost[]
  total: number
  facets?: Record<string, Array<{ value: string; count: number }>>
}

export interface ShodanExploit {
  _id: string
  author?: string
  code?: string
  date?: string
  description?: string
  platform?: string
  port?: number
  source?: string
  type?: string
  cve?: string[]
}

export interface ShodanExploitSearchResult {
  matches: ShodanExploit[]
  total: number
}

export interface ShodanApiInfo {
  query_credits: number
  scan_credits: number
  telnet: boolean
  plan: string
  https: boolean
  unlocked: boolean
  unlocked_left: number
  usage_limits: {
    scan_credits: number
    query_credits: number
    monitored_ips: number
  }
}

export interface ShodanToolResponse {
  success: boolean
  output: {
    results?: ShodanHost[] | ShodanExploit[]
    host?: ShodanHost
    dns?: Record<string, string | string[]>
    ip?: string
    apiInfo?: ShodanApiInfo
    ports?: number[]
    protocols?: Record<string, string>
    total?: number
    error?: string
  }
}
