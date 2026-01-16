import { Shield } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const ShodanBlock: BlockConfig = {
  type: 'shodan',
  name: 'Shodan',
  description: 'Search for internet-connected devices and security data',
  longDescription:
    'Access the Shodan API to search for internet-connected devices, get host information, DNS lookups, and security vulnerability data. Shodan is the search engine for the Internet of Things. Requires API key (free tier available with limited queries).',
  category: 'tools',
  bgColor: '#C83737',
  icon: Shield,
  subBlocks: [
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      required: true,
      placeholder: 'Enter your Shodan API key',
      description: 'Get your API key from account.shodan.io',
      password: true,
    },
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Search Hosts', id: 'search' },
        { label: 'Get Host Info', id: 'host' },
        { label: 'DNS Lookup', id: 'dns_lookup' },
        { label: 'Reverse DNS', id: 'dns_reverse' },
        { label: 'Get My IP', id: 'my_ip' },
        { label: 'API Info', id: 'api_info' },
        { label: 'Search Exploits', id: 'exploits' },
        { label: 'Get Ports', id: 'ports' },
        { label: 'Get Protocols', id: 'protocols' },
      ],
      value: () => 'search',
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., apache country:US, port:22, org:"Google"',
      description: 'Shodan search query (supports filters)',
      condition: { field: 'operation', value: 'search' },
    },
    {
      id: 'ip',
      title: 'IP Address',
      type: 'short-input',
      placeholder: 'e.g., 8.8.8.8',
      description: 'IP address to look up',
      condition: { field: 'operation', value: 'host' },
    },
    {
      id: 'hostnames',
      title: 'Hostnames',
      type: 'short-input',
      placeholder: 'e.g., google.com,facebook.com',
      description: 'Comma-separated hostnames for DNS lookup',
      condition: { field: 'operation', value: 'dns_lookup' },
    },
    {
      id: 'ips',
      title: 'IP Addresses',
      type: 'short-input',
      placeholder: 'e.g., 8.8.8.8,1.1.1.1',
      description: 'Comma-separated IPs for reverse DNS',
      condition: { field: 'operation', value: 'dns_reverse' },
    },
    {
      id: 'exploitQuery',
      title: 'Exploit Search Query',
      type: 'short-input',
      placeholder: 'e.g., apache, CVE-2021-44228',
      description: 'Search for exploits by keyword or CVE',
      condition: { field: 'operation', value: 'exploits' },
    },
    {
      id: 'page',
      title: 'Page',
      type: 'short-input',
      placeholder: '1',
      description: 'Page number for paginated results',
    },
    {
      id: 'minify',
      title: 'Minify Results',
      type: 'dropdown',
      options: [
        { label: 'No - Full details', id: 'false' },
        { label: 'Yes - Basic info only', id: 'true' },
      ],
      value: () => 'false',
      description: 'Return minimal host information',
      condition: { field: 'operation', value: 'host' },
    },
  ],
  tools: {
    access: ['shodan_api'],
    config: {
      tool: () => 'shodan_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          apiKey: params.apiKey,
          operation: params.operation || 'search',
        }

        if (params.query) result.query = params.query
        if (params.ip) result.ip = params.ip
        if (params.hostnames) result.hostnames = params.hostnames.split(',').map((h: string) => h.trim())
        if (params.ips) result.ips = params.ips.split(',').map((ip: string) => ip.trim())
        if (params.exploitQuery) result.exploitQuery = params.exploitQuery
        if (params.page) result.page = Number(params.page)
        result.minify = params.minify === 'true'

        return result
      },
    },
  },
  inputs: {
    apiKey: { type: 'string', description: 'Shodan API key' },
    operation: { type: 'string', description: 'Operation to perform' },
    query: { type: 'string', description: 'Search query' },
    ip: { type: 'string', description: 'IP address for host lookup' },
    hostnames: { type: 'array', description: 'Hostnames for DNS lookup' },
    ips: { type: 'array', description: 'IP addresses for reverse DNS' },
    exploitQuery: { type: 'string', description: 'Exploit search query' },
    page: { type: 'number', description: 'Page number' },
    minify: { type: 'boolean', description: 'Return minimal results' },
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
