import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { getMcpServerFromRepository } from '@/lib/mcp/repository'

const logger = createLogger('MCPRepositoryAPI')

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const server = getMcpServerFromRepository(id)

    if (!server) {
      return NextResponse.json(
        { error: `Server not found in repository: ${id}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: server,
    })
  } catch (error) {
    logger.error(`Failed to fetch repository entry ${params.id}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repository entry'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
