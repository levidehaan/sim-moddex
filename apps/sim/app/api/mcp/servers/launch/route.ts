import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { launchNpmServer, launchPythonServer, launchNodeServer } from '@/lib/mcp/launcher'
import type { McpServerConfig } from '@/lib/mcp/types'

const logger = createLogger('MCPLaunchAPI')

const LaunchSchema = z.object({
  config: z.object({
    id: z.string(),
    name: z.string(),
    source: z.enum(['npm', 'python', 'node']),
    transport: z.enum(['stdio', 'streamable-http', 'sse', 'websocket']),
    package: z.string().optional(),
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    cwd: z.string().optional(),
    autoRestart: z.boolean().optional(),
    sandboxed: z.boolean().optional(),
    allowedPaths: z.array(z.string()).optional(),
    allowedHosts: z.array(z.string()).optional(),
    maxMemory: z.number().optional(),
    maxCpu: z.number().optional(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config } = LaunchSchema.parse(body)

    logger.info(`Launching MCP server: ${config.name} (${config.source})`)

    let launched
    switch (config.source) {
      case 'npm':
        launched = await launchNpmServer(config as McpServerConfig)
        break
      case 'python':
        launched = await launchPythonServer(config as McpServerConfig)
        break
      case 'node':
        launched = await launchNodeServer(config as McpServerConfig)
        break
      default:
        return NextResponse.json(
          { error: `Unsupported server source: ${config.source}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        serverId: config.id,
        pid: launched.pid,
        status: 'running',
        startTime: launched.startTime.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid launch request:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Failed to launch MCP server:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to launch server'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
