/**
 * Model Context Protocol (MCP) Types
 */

// MCP Transport Types
// Modern MCP supports multiple transport mechanisms
export type McpTransport = 
  | 'streamable-http'  // Remote HTTP/SSE server
  | 'stdio'            // Local stdio process
  | 'sse'              // Server-Sent Events only
  | 'websocket'        // WebSocket connection

// MCP Server Source Types
export type McpServerSource =
  | 'remote'           // Remote HTTP server
  | 'npm'              // NPM package (npx)
  | 'python'           // Python package/script
  | 'node'             // Node.js script
  | 'docker'           // Docker container
  | 'repository'       // Well-known MCP repository

export interface McpServerStatusConfig {
  consecutiveFailures: number
  lastSuccessfulDiscovery: string | null
}

export interface McpServerConfig {
  id: string
  name: string
  description?: string
  transport: McpTransport
  source: McpServerSource

  // Remote server config (HTTP/SSE/WebSocket)
  url?: string
  headers?: Record<string, string>

  // Local execution config (stdio)
  command?: string              // Command to execute
  args?: string[]              // Command arguments
  env?: Record<string, string> // Environment variables
  cwd?: string                 // Working directory

  // NPM/Python package config
  package?: string             // Package name
  version?: string             // Package version
  installCommand?: string      // Custom install command

  // Repository config
  repositoryUrl?: string       // GitHub/GitLab URL
  repositoryRef?: string       // Branch/tag/commit

  // Docker config
  dockerImage?: string         // Docker image name
  dockerTag?: string           // Docker image tag
  dockerPorts?: Record<string, number> // Port mappings

  // Security and sandboxing
  sandboxed?: boolean          // Run in sandbox
  allowedPaths?: string[]      // Allowed filesystem paths
  allowedHosts?: string[]      // Allowed network hosts
  maxMemory?: number           // Max memory in MB
  maxCpu?: number              // Max CPU percentage

  // Auto-deploy settings
  autoDeploy?: boolean         // Auto-deploy on workspace load
  autoRestart?: boolean        // Auto-restart on failure
  healthCheckUrl?: string      // Health check endpoint
  healthCheckInterval?: number // Health check interval in ms

  // Dynamic configuration
  configSchema?: McpConfigSchema // Schema for dynamic config
  configValues?: Record<string, any> // User-provided config values

  // Common config
  timeout?: number
  retries?: number
  enabled?: boolean
  statusConfig?: McpServerStatusConfig
  createdAt?: string
  updatedAt?: string
}

// Version negotiation support
export interface McpVersionInfo {
  supported: string[] // List of supported protocol versions
  preferred: string // Preferred version to use
}

// Security and Consent Framework
export interface McpConsentRequest {
  type: 'tool_execution' | 'resource_access' | 'data_sharing'
  context: {
    serverId: string
    serverName: string
    action: string // Tool name or resource path
    description?: string // Human-readable description
    dataAccess?: string[] // Types of data being accessed
    sideEffects?: string[] // Potential side effects
  }
  expires?: number // Consent expiration timestamp
}

export interface McpConsentResponse {
  granted: boolean
  expires?: number
  restrictions?: Record<string, any> // Any access restrictions
  auditId?: string // For audit trail
}

export interface McpSecurityPolicy {
  requireConsent: boolean
  allowedOrigins?: string[]
  blockedOrigins?: string[]
  maxToolExecutionsPerHour?: number
  auditLevel: 'none' | 'basic' | 'detailed'
}

// MCP Tool Types
export interface McpToolSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  additionalProperties?: boolean
  description?: string
}

export interface McpTool {
  name: string
  description?: string
  inputSchema: McpToolSchema
  serverId: string
  serverName: string
}

export interface McpToolCall {
  name: string
  arguments: Record<string, any>
}

// Standard MCP protocol response format
export interface McpToolResult {
  content?: Array<{
    type: 'text' | 'image' | 'resource'
    text?: string
    data?: string
    mimeType?: string
  }>
  isError?: boolean
  // Allow additional fields that some MCP servers return
  [key: string]: any
}

// Connection and Error Types
export interface McpConnectionStatus {
  connected: boolean
  lastConnected?: Date
  lastError?: string
}

export class McpError extends Error {
  constructor(
    message: string,
    public code?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'McpError'
  }
}

export class McpConnectionError extends McpError {
  constructor(message: string, serverName: string) {
    super(`Failed to connect to "${serverName}": ${message}`)
    this.name = 'McpConnectionError'
  }
}

// Dynamic configuration schema for MCP servers
export interface McpConfigSchema {
  type: 'object'
  properties: Record<string, McpConfigProperty>
  required?: string[]
}

export interface McpConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  default?: any
  enum?: any[]
  items?: McpConfigProperty
  properties?: Record<string, McpConfigProperty>
  required?: string[]
  secret?: boolean // Mark as password/secret field
}

// MCP Server Repository Entry
export interface McpRepositoryEntry {
  id: string
  name: string
  description: string
  author: string
  source: McpServerSource
  package?: string
  repositoryUrl?: string
  dockerImage?: string
  category: string
  tags: string[]
  configSchema?: McpConfigSchema
  documentation?: string
  examples?: string[]
  verified?: boolean
  downloads?: number
  rating?: number
}

export interface McpServerSummary {
  id: string
  name: string
  url?: string
  transport?: McpTransport
  source?: McpServerSource
  status: 'connected' | 'disconnected' | 'error' | 'starting' | 'stopping'
  toolCount: number
  resourceCount?: number
  promptCount?: number
  lastSeen?: Date
  error?: string
  pid?: number // Process ID for local servers
  uptime?: number // Uptime in seconds
}

// API Response Types
export interface McpApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface McpToolDiscoveryResponse {
  tools: McpTool[]
  totalCount: number
  byServer: Record<string, number>
}
