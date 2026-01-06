import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { getActiveServer, getServerUptime, isServerRunning } from '@/lib/mcp/launcher'

const logger = createLogger('MCPStatusAPI')

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: serverId } = params

    const isRunning = isServerRunning(serverId)
    const server = getActiveServer(serverId)
    const uptime = getServerUptime(serverId)

    return NextResponse.json({
      success: true,
      data: {
        serverId,
        status: isRunning ? 'running' : 'stopped',
        pid: server?.pid,
        uptime,
        startTime: server?.startTime.toISOString(),
      },
    })
  } catch (error) {
    logger.error(`Failed to get status for MCP server ${params.id}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to get server status'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
