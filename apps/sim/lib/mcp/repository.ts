/**
 * MCP Server Repository
 * Well-known MCP servers from the community (2026)
 */

import type { McpRepositoryEntry } from './types'

/**
 * Curated list of well-known MCP servers
 */
export const MCP_REPOSITORY: McpRepositoryEntry[] = [
  // Filesystem
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Secure file operations with configurable access controls',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-filesystem',
    category: 'File System',
    tags: ['files', 'filesystem', 'read', 'write'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        allowedDirectories: {
          type: 'array',
          title: 'Allowed Directories',
          description: 'List of directories the server can access',
          items: { type: 'string' },
        },
      },
      required: ['allowedDirectories'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
  },

  // Git
  {
    id: 'git',
    name: 'Git',
    description: 'Tools to read, search, and manipulate Git repositories',
    author: 'Anthropic',
    source: 'python',
    package: 'mcp-server-git',
    category: 'Development',
    tags: ['git', 'version-control', 'repositories'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          title: 'Repository Path',
          description: 'Path to the Git repository',
        },
      },
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
  },

  // Memory
  {
    id: 'memory',
    name: 'Memory',
    description: 'Knowledge graph-based persistent memory system',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-memory',
    category: 'AI/ML',
    tags: ['memory', 'knowledge-graph', 'persistence'],
    verified: true,
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
  },


  // Everything
  {
    id: 'everything',
    name: 'Everything',
    description: 'Reference/test server with prompts, resources, and tools',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-everything',
    category: 'Development',
    tags: ['test', 'reference', 'demo'],
    verified: true,
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything',
  },

  // GitHub
  {
    id: 'github',
    name: 'GitHub',
    description: 'Interact with GitHub repositories, issues, and pull requests',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-github',
    category: 'Development',
    tags: ['github', 'git', 'repositories', 'issues', 'pr'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        githubToken: {
          type: 'string',
          title: 'GitHub Personal Access Token',
          description: 'GitHub PAT with appropriate permissions',
          secret: true,
        },
        owner: {
          type: 'string',
          title: 'Repository Owner',
          description: 'GitHub username or organization',
        },
        repo: {
          type: 'string',
          title: 'Repository Name',
          description: 'Repository name',
        },
      },
      required: ['githubToken'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
  },

  // PostgreSQL
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query and manage PostgreSQL databases',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-postgres',
    category: 'Database',
    tags: ['postgresql', 'database', 'sql', 'query'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        connectionString: {
          type: 'string',
          title: 'Connection String',
          description: 'PostgreSQL connection string',
          secret: true,
        },
      },
      required: ['connectionString'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
  },

  // Brave Search
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search using Brave Search API',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-brave-search',
    category: 'Search',
    tags: ['search', 'web', 'brave'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        apiKey: {
          type: 'string',
          title: 'Brave Search API Key',
          description: 'API key from Brave Search',
          secret: true,
        },
      },
      required: ['apiKey'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
  },

  // Google Drive
  {
    id: 'gdrive',
    name: 'Google Drive',
    description: 'Access and manage Google Drive files',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-gdrive',
    category: 'Cloud Storage',
    tags: ['google', 'drive', 'storage', 'files'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        credentials: {
          type: 'string',
          title: 'Google OAuth Credentials',
          description: 'OAuth 2.0 credentials JSON',
          secret: true,
        },
      },
      required: ['credentials'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive',
  },

  // Slack
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and interact with Slack workspaces',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-slack',
    category: 'Communication',
    tags: ['slack', 'messaging', 'chat'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        botToken: {
          type: 'string',
          title: 'Slack Bot Token',
          description: 'Slack bot user OAuth token',
          secret: true,
        },
        teamId: {
          type: 'string',
          title: 'Team ID',
          description: 'Slack workspace team ID',
        },
      },
      required: ['botToken'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
  },



  // Puppeteer
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation and web scraping with Puppeteer',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-puppeteer',
    category: 'Web',
    tags: ['browser', 'automation', 'scraping', 'puppeteer'],
    verified: true,
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
  },

  // Google Maps
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: 'Location services and mapping',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-google-maps',
    category: 'Location',
    tags: ['maps', 'location', 'geocoding', 'directions'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        apiKey: {
          type: 'string',
          title: 'Google Maps API Key',
          description: 'API key from Google Cloud Console',
          secret: true,
        },
      },
      required: ['apiKey'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps',
  },


  // AWS KB Retrieval
  {
    id: 'aws-kb-retrieval',
    name: 'AWS Knowledge Base Retrieval',
    description: 'Query AWS Bedrock Knowledge Bases',
    author: 'Anthropic',
    source: 'npm',
    package: '@modelcontextprotocol/server-aws-kb-retrieval',
    category: 'AI/ML',
    tags: ['aws', 'bedrock', 'knowledge-base', 'retrieval'],
    verified: true,
    configSchema: {
      type: 'object',
      properties: {
        region: {
          type: 'string',
          title: 'AWS Region',
          description: 'AWS region for Bedrock',
          default: 'us-east-1',
        },
        knowledgeBaseId: {
          type: 'string',
          title: 'Knowledge Base ID',
          description: 'AWS Bedrock Knowledge Base ID',
        },
      },
      required: ['knowledgeBaseId'],
    },
    documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval',
  },
]

/**
 * Get MCP server by ID from repository
 */
export function getMcpServerFromRepository(id: string): McpRepositoryEntry | undefined {
  return MCP_REPOSITORY.find((server) => server.id === id)
}

/**
 * Search MCP repository
 */
export function searchMcpRepository(query: string): McpRepositoryEntry[] {
  const lowerQuery = query.toLowerCase()
  return MCP_REPOSITORY.filter(
    (server) =>
      server.name.toLowerCase().includes(lowerQuery) ||
      server.description.toLowerCase().includes(lowerQuery) ||
      server.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      server.category.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get MCP servers by category
 */
export function getMcpServersByCategory(category: string): McpRepositoryEntry[] {
  return MCP_REPOSITORY.filter((server) => server.category === category)
}

/**
 * Get all MCP categories
 */
export function getMcpCategories(): string[] {
  return Array.from(new Set(MCP_REPOSITORY.map((server) => server.category))).sort()
}
