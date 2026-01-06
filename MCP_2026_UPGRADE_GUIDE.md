# MCP 2026 Upgrade Guide

## Overview

This guide documents the comprehensive upgrade of the MCP (Model Context Protocol) system to support 2026's MCP ecosystem with multiple server types, auto-deploy capabilities, repository integration, and enhanced security.

## What's New

### 1. Multiple Transport Types

**Supported Transports:**
- `streamable-http` - Remote HTTP/SSE server (existing)
- `stdio` - Local stdio process (NEW)
- `sse` - Server-Sent Events only (NEW)
- `websocket` - WebSocket connection (NEW)

### 2. Multiple Server Sources

**Supported Sources:**
- `remote` - Remote HTTP server
- `npm` - NPM package via npx (NEW)
- `python` - Python package/script (NEW)
- `node` - Node.js script (NEW)
- `docker` - Docker container (NEW)
- `repository` - Well-known MCP repository (NEW)

### 3. MCP Server Repository

**14 Pre-configured Servers:**
- Filesystem - File operations
- GitHub - Repository management
- PostgreSQL - Database queries
- Brave Search - Web search
- Google Drive - Cloud storage
- Slack - Team communication
- Memory - Knowledge graph
- Puppeteer - Browser automation
- Sequential Thinking - Problem solving
- Fetch - HTTP requests
- SQLite - Local database
- Google Maps - Location services
- Everything - Windows file search
- AWS KB Retrieval - Bedrock integration

### 4. Dynamic Configuration

**Features:**
- Auto-generated forms based on server config schema
- Support for different field types (string, number, boolean, array, object)
- Secret field masking for passwords and API keys
- Enum support for dropdown selections
- Required field validation
- Default values

### 5. Local Server Management

**Capabilities:**
- Launch NPM servers with `npx`
- Launch Python servers
- Launch Node.js servers
- Process monitoring (PID, uptime)
- Auto-restart on failure
- Graceful shutdown
- Health checks

### 6. Security & Sandboxing

**Security Features:**
- Sandboxed execution
- Allowed filesystem paths
- Allowed network hosts
- Memory limits
- CPU limits
- Process isolation

### 7. Auto-Deploy

**Features:**
- Auto-deploy on workspace load
- Auto-restart on failure
- Health check monitoring
- Configurable health check intervals

## Implementation Details

### Type System

```typescript
// Transport types
export type McpTransport = 
  | 'streamable-http'
  | 'stdio'
  | 'sse'
  | 'websocket'

// Source types
export type McpServerSource =
  | 'remote'
  | 'npm'
  | 'python'
  | 'node'
  | 'docker'
  | 'repository'

// Server configuration
export interface McpServerConfig {
  id: string
  name: string
  transport: McpTransport
  source: McpServerSource
  
  // Remote config
  url?: string
  headers?: Record<string, string>
  
  // Local execution
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  
  // Package config
  package?: string
  version?: string
  
  // Security
  sandboxed?: boolean
  allowedPaths?: string[]
  allowedHosts?: string[]
  maxMemory?: number
  maxCpu?: number
  
  // Auto-deploy
  autoDeploy?: boolean
  autoRestart?: boolean
  healthCheckUrl?: string
  
  // Dynamic config
  configSchema?: McpConfigSchema
  configValues?: Record<string, any>
}
```

### Repository Integration

```typescript
// Repository entry
export interface McpRepositoryEntry {
  id: string
  name: string
  description: string
  author: string
  source: McpServerSource
  package?: string
  category: string
  tags: string[]
  configSchema?: McpConfigSchema
  verified?: boolean
}

// Usage
import { MCP_REPOSITORY, searchMcpRepository } from '@/lib/mcp/repository'

// Search servers
const results = searchMcpRepository('github')

// Get by category
const databases = getMcpServersByCategory('Database')
```

### Server Launcher

```typescript
import { launchNpmServer, launchPythonServer, stopServer } from '@/lib/mcp/launcher'

// Launch NPM server
const server = await launchNpmServer({
  id: 'filesystem-1',
  name: 'Filesystem',
  source: 'npm',
  transport: 'stdio',
  package: '@modelcontextprotocol/server-filesystem',
  args: ['--allowed-dirs', '/home/user/documents'],
  autoRestart: true,
})

// Check status
const uptime = getServerUptime('filesystem-1')
const isRunning = isServerRunning('filesystem-1')

// Stop server
await stopServer('filesystem-1')
```

## Usage Examples

### Example 1: Add NPM Server from Repository

```typescript
// 1. Select from repository
const githubServer = getMcpServerFromRepository('github')

// 2. Configure with user values
const config: McpServerConfig = {
  id: generateMcpServerId(workspaceId, 'github'),
  name: 'GitHub',
  source: 'npm',
  transport: 'stdio',
  package: '@modelcontextprotocol/server-github',
  configValues: {
    githubToken: process.env.GITHUB_TOKEN,
    owner: 'myorg',
    repo: 'myrepo',
  },
  autoDeploy: true,
  autoRestart: true,
}

// 3. Launch server
const launched = await launchNpmServer(config)

// 4. Server is now available for tool execution
```

### Example 2: Add Remote HTTP Server

```typescript
const config: McpServerConfig = {
  id: generateMcpServerId(workspaceId, 'https://api.example.com/mcp'),
  name: 'Custom MCP Server',
  source: 'remote',
  transport: 'streamable-http',
  url: 'https://api.example.com/mcp',
  headers: {
    'Authorization': 'Bearer token123',
  },
  timeout: 30000,
  enabled: true,
}
```

### Example 3: Add Python Server

```typescript
const config: McpServerConfig = {
  id: 'custom-python-1',
  name: 'Custom Python Server',
  source: 'python',
  transport: 'stdio',
  command: 'python',
  args: ['-m', 'my_mcp_server'],
  env: {
    API_KEY: process.env.MY_API_KEY,
  },
  cwd: '/path/to/server',
  sandboxed: true,
  allowedPaths: ['/data'],
  maxMemory: 512,
}
```

### Example 4: Dynamic Form Generation

```typescript
// Server with config schema
const server = {
  id: 'postgres',
  configSchema: {
    type: 'object',
    properties: {
      connectionString: {
        type: 'string',
        title: 'Connection String',
        description: 'PostgreSQL connection string',
        secret: true,
      },
      maxConnections: {
        type: 'number',
        title: 'Max Connections',
        default: 10,
      },
    },
    required: ['connectionString'],
  },
}

// UI automatically generates:
// - Password field for connectionString
// - Number input for maxConnections
// - Validation for required fields
```

## Settings UI Enhancements

### New Features

1. **Server Type Selector**
   - Remote HTTP/SSE
   - NPM Package
   - Python Script
   - Node.js Script
   - Docker Container
   - From Repository

2. **Repository Browser**
   - Browse 14+ pre-configured servers
   - Search by name, category, tags
   - Filter by category
   - View documentation links
   - One-click installation

3. **Dynamic Configuration Forms**
   - Auto-generated from schema
   - Field type detection
   - Secret field masking
   - Validation
   - Default values

4. **Server Management**
   - Start/Stop local servers
   - View process status
   - Monitor uptime
   - View logs
   - Restart servers

5. **JSON Import/Export**
   - Paste JSON configuration
   - Export server config
   - Bulk import

## API Endpoints

### New Endpoints

```
POST /api/mcp/servers/launch
- Launch a local MCP server
- Body: McpServerConfig
- Returns: { serverId, pid, status }

POST /api/mcp/servers/:id/stop
- Stop a running server
- Returns: { success: boolean }

POST /api/mcp/servers/:id/restart
- Restart a server
- Returns: { serverId, pid, status }

GET /api/mcp/servers/:id/status
- Get server status
- Returns: { status, uptime, pid }

GET /api/mcp/repository
- Get MCP server repository
- Query params: ?category=Database&search=postgres
- Returns: McpRepositoryEntry[]

GET /api/mcp/repository/:id
- Get specific repository entry
- Returns: McpRepositoryEntry
```

## Migration Guide

### Existing Servers

Existing remote HTTP servers continue to work without changes. The `transport` field defaults to `streamable-http` and `source` defaults to `remote`.

### Database Schema

Add new columns to `mcp_servers` table:

```sql
ALTER TABLE mcp_servers
ADD COLUMN source VARCHAR(20) DEFAULT 'remote',
ADD COLUMN command TEXT,
ADD COLUMN args JSONB,
ADD COLUMN env JSONB,
ADD COLUMN cwd TEXT,
ADD COLUMN package VARCHAR(255),
ADD COLUMN version VARCHAR(50),
ADD COLUMN sandboxed BOOLEAN DEFAULT false,
ADD COLUMN allowed_paths JSONB,
ADD COLUMN allowed_hosts JSONB,
ADD COLUMN max_memory INTEGER,
ADD COLUMN max_cpu INTEGER,
ADD COLUMN auto_deploy BOOLEAN DEFAULT false,
ADD COLUMN auto_restart BOOLEAN DEFAULT false,
ADD COLUMN health_check_url TEXT,
ADD COLUMN config_schema JSONB,
ADD COLUMN config_values JSONB,
ADD COLUMN pid INTEGER,
ADD COLUMN status VARCHAR(20) DEFAULT 'disconnected';
```

## Security Considerations

### Sandboxing

Local servers should run in sandboxed environments:

1. **Filesystem Access**
   - Restrict to `allowedPaths`
   - No access to system directories
   - Read-only by default

2. **Network Access**
   - Restrict to `allowedHosts`
   - No localhost access by default
   - HTTPS only for external requests

3. **Resource Limits**
   - Memory limits via `maxMemory`
   - CPU limits via `maxCpu`
   - Process timeout limits

4. **Process Isolation**
   - Run in separate process
   - No access to parent environment
   - Clean environment variables

### Best Practices

1. **Always use sandboxing** for untrusted servers
2. **Validate all user input** in config values
3. **Use secrets management** for API keys
4. **Monitor resource usage** of local servers
5. **Implement health checks** for critical servers
6. **Log all server operations** for audit trail

## Testing

### Unit Tests

```typescript
// Test server launcher
describe('MCPLauncher', () => {
  it('should launch NPM server', async () => {
    const config = { /* ... */ }
    const server = await launchNpmServer(config)
    expect(server.pid).toBeDefined()
  })
  
  it('should stop server gracefully', async () => {
    await stopServer('test-server-1')
    expect(isServerRunning('test-server-1')).toBe(false)
  })
})

// Test repository
describe('MCPRepository', () => {
  it('should search servers', () => {
    const results = searchMcpRepository('github')
    expect(results.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests

```typescript
// Test full workflow
describe('MCP Integration', () => {
  it('should install and use repository server', async () => {
    // 1. Get from repository
    const server = getMcpServerFromRepository('filesystem')
    
    // 2. Configure
    const config = createServerConfig(server, {
      allowedDirectories: ['/tmp'],
    })
    
    // 3. Launch
    const launched = await launchNpmServer(config)
    
    // 4. Execute tool
    const result = await executeMcpTool('mcp-filesystem-read_file', {
      path: '/tmp/test.txt',
    })
    
    expect(result.success).toBe(true)
    
    // 5. Cleanup
    await stopServer(config.id)
  })
})
```

## Troubleshooting

### Common Issues

**Issue: NPM server won't start**
- Check if npx is installed
- Verify package name is correct
- Check network connectivity
- Review server logs

**Issue: Python server fails**
- Verify Python is installed
- Check Python version compatibility
- Ensure dependencies are installed
- Check virtual environment

**Issue: Server keeps restarting**
- Check server logs for errors
- Verify configuration is correct
- Disable auto-restart temporarily
- Check resource limits

**Issue: Can't connect to remote server**
- Verify URL is correct
- Check network connectivity
- Verify authentication headers
- Check firewall settings

## Future Enhancements

1. **Docker Support** - Full Docker container management
2. **Server Marketplace** - Community-contributed servers
3. **Version Management** - Automatic updates
4. **Performance Monitoring** - Resource usage tracking
5. **Load Balancing** - Multiple server instances
6. **Clustering** - Distributed MCP servers
7. **WebAssembly** - WASM-based servers
8. **Custom Protocols** - Plugin system for new transports

## Resources

- MCP Specification: https://modelcontextprotocol.io/
- Official Servers: https://github.com/modelcontextprotocol/servers
- Community Servers: https://github.com/topics/mcp-server
- Documentation: https://docs.sim.ai/mcp

## Summary

The MCP 2026 upgrade provides:

✅ **Multiple transport types** (stdio, SSE, WebSocket)
✅ **Multiple server sources** (npm, python, node, docker)
✅ **14+ pre-configured servers** from repository
✅ **Dynamic configuration** with auto-generated forms
✅ **Local server management** with process monitoring
✅ **Security & sandboxing** for safe execution
✅ **Auto-deploy capabilities** for seamless integration
✅ **Enhanced settings UI** for easy management

This makes MCP integration significantly easier and more powerful, enabling users to quickly add and manage MCP servers from various sources with minimal configuration.
