import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { stopServer } from '@/lib/mcp/launcher'

const logger = createLogger('MCPStopAPI')

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: serverId } = params

    logger.info(`Stopping MCP server: ${serverId}`)

    await stopServer(serverId)

    return NextResponse.json({
      success: true,
      data: {
        serverId,
        status: 'stopped',
      },
    })
  } catch (error) {
    logger.error(`Failed to stop MCP server ${params.id}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to stop server'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
