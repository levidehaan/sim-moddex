import type { ToolConfig } from '@/tools/types'
import type {
  ShodanToolParams,
  ShodanToolResponse,
  ShodanHost,
  ShodanExploit,
  ShodanApiInfo,
} from './types'

const SHODAN_API_URL = 'https://api.shodan.io'
const SHODAN_EXPLOITS_URL = 'https://exploits.shodan.io/api'

/**
 * Helper to make requests to Shodan API
 */
async function shodanRequest(
  baseUrl: string,
  endpoint: string,
  apiKey: string,
  params: Record<string, string> = {}
): Promise<Response> {
  const url = new URL(`${baseUrl}${endpoint}`)
  url.searchParams.set('key', apiKey)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return fetch(url.toString())
}

/**
 * Search for hosts
 */
async function searchHosts(
  apiKey: string,
  query: string,
  page: number = 1
): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/shodan/host/search', apiKey, {
    query,
    page: page.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Search failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      results: data.matches as ShodanHost[],
      total: data.total,
    },
  }
}

/**
 * Get host information by IP
 */
async function getHost(
  apiKey: string,
  ip: string,
  minify: boolean = false
): Promise<ShodanToolResponse> {
  const params: Record<string, string> = {}
  if (minify) params.minify = 'true'

  const response = await shodanRequest(SHODAN_API_URL, `/shodan/host/${ip}`, apiKey, params)

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Host lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      host: data as ShodanHost,
    },
  }
}

/**
 * DNS lookup
 */
async function dnsLookup(
  apiKey: string,
  hostnames: string[]
): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/dns/resolve', apiKey, {
    hostnames: hostnames.join(','),
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `DNS lookup failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      dns: data,
    },
  }
}

/**
 * Reverse DNS lookup
 */
async function reverseDns(
  apiKey: string,
  ips: string[]
): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/dns/reverse', apiKey, {
    ips: ips.join(','),
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Reverse DNS failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      dns: data,
    },
  }
}

/**
 * Get my IP
 */
async function getMyIp(apiKey: string): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/tools/myip', apiKey)

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Get IP failed: ${response.status} - ${error}`,
      },
    }
  }

  const ip = await response.text()
  return {
    success: true,
    output: {
      ip: ip.replace(/"/g, ''),
    },
  }
}

/**
 * Get API info
 */
async function getApiInfo(apiKey: string): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/api-info', apiKey)

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `API info failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      apiInfo: data as ShodanApiInfo,
    },
  }
}

/**
 * Search exploits
 */
async function searchExploits(
  apiKey: string,
  query: string,
  page: number = 1
): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_EXPLOITS_URL, '/search', apiKey, {
    query,
    page: page.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Exploit search failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      results: data.matches as ShodanExploit[],
      total: data.total,
    },
  }
}

/**
 * Get ports Shodan crawls
 */
async function getPorts(apiKey: string): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/shodan/ports', apiKey)

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Get ports failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      ports: data as number[],
    },
  }
}

/**
 * Get protocols Shodan understands
 */
async function getProtocols(apiKey: string): Promise<ShodanToolResponse> {
  const response = await shodanRequest(SHODAN_API_URL, '/shodan/protocols', apiKey)

  if (!response.ok) {
    const error = await response.text()
    return {
      success: false,
      output: {
        error: `Get protocols failed: ${response.status} - ${error}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    output: {
      protocols: data as Record<string, string>,
    },
  }
}

export const shodanTool: ToolConfig<ShodanToolParams, ShodanToolResponse> = {
  id: 'shodan_api',
  name: 'Shodan API',
  description:
    'Search for internet-connected devices, get host information, DNS lookups, and security vulnerability data.',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      description: 'Shodan API key',
    },
    operation: {
      type: 'string',
      required: true,
      description:
        'Operation: search, host, dns_lookup, dns_reverse, my_ip, api_info, exploits, ports, protocols',
    },
    query: {
      type: 'string',
      required: false,
      description: 'Search query for search operation',
    },
    ip: {
      type: 'string',
      required: false,
      description: 'IP address for host operation',
    },
    hostnames: {
      type: 'array',
      required: false,
      description: 'Hostnames for dns_lookup operation',
    },
    ips: {
      type: 'array',
      required: false,
      description: 'IP addresses for dns_reverse operation',
    },
    exploitQuery: {
      type: 'string',
      required: false,
      description: 'Query for exploits operation',
    },
    page: {
      type: 'number',
      required: false,
      description: 'Page number for paginated results',
    },
    minify: {
      type: 'boolean',
      required: false,
      description: 'Return minimal host information',
    },
  },

  directExecution: async (params: ShodanToolParams): Promise<ShodanToolResponse> => {
    const { apiKey, operation, query, ip, hostnames, ips, exploitQuery, page = 1, minify = false } = params

    if (!apiKey) {
      return {
        success: false,
        output: {
          error: 'API key is required',
        },
      }
    }

    try {
      switch (operation) {
        case 'search':
          if (!query) {
            return {
              success: false,
              output: {
                error: 'Query is required for search operation',
              },
            }
          }
          return await searchHosts(apiKey, query, page)

        case 'host':
          if (!ip) {
            return {
              success: false,
              output: {
                error: 'IP address is required for host operation',
              },
            }
          }
          return await getHost(apiKey, ip, minify)

        case 'dns_lookup':
          if (!hostnames || hostnames.length === 0) {
            return {
              success: false,
              output: {
                error: 'Hostnames are required for dns_lookup operation',
              },
            }
          }
          return await dnsLookup(apiKey, hostnames)

        case 'dns_reverse':
          if (!ips || ips.length === 0) {
            return {
              success: false,
              output: {
                error: 'IP addresses are required for dns_reverse operation',
              },
            }
          }
          return await reverseDns(apiKey, ips)

        case 'my_ip':
          return await getMyIp(apiKey)

        case 'api_info':
          return await getApiInfo(apiKey)

        case 'exploits':
          if (!exploitQuery) {
            return {
              success: false,
              output: {
                error: 'Query is required for exploits operation',
              },
            }
          }
          return await searchExploits(apiKey, exploitQuery, page)

        case 'ports':
          return await getPorts(apiKey)

        case 'protocols':
          return await getProtocols(apiKey)

        default:
          return {
            success: false,
            output: {
              error: `Unknown operation: ${operation}`,
            },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    results: { type: 'array', description: 'Search results (hosts or exploits)' },
    host: { type: 'json', description: 'Host information' },
    dns: { type: 'json', description: 'DNS lookup results' },
    ip: { type: 'string', description: 'Your public IP address' },
    apiInfo: { type: 'json', description: 'API account information' },
    ports: { type: 'array', description: 'List of ports Shodan crawls' },
    protocols: { type: 'json', description: 'Protocols Shodan understands' },
    total: { type: 'number', description: 'Total number of results' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
