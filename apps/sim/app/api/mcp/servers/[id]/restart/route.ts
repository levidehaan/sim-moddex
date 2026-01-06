import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { restartServer } from '@/lib/mcp/launcher'

const logger = createLogger('MCPRestartAPI')

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: serverId } = params

    logger.info(`Restarting MCP server: ${serverId}`)

    const launched = await restartServer(serverId)

    return NextResponse.json({
      success: true,
      data: {
        serverId,
        pid: launched.pid,
        status: 'running',
        startTime: launched.startTime.toISOString(),
      },
    })
  } catch (error) {
    logger.error(`Failed to restart MCP server ${params.id}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to restart server'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
