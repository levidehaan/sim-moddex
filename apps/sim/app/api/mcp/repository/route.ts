import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { MCP_REPOSITORY, searchMcpRepository, getMcpServersByCategory, getMcpCategories } from '@/lib/mcp/repository'

const logger = createLogger('MCPRepositoryAPI')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let servers = MCP_REPOSITORY

    // Apply search filter
    if (search) {
      servers = searchMcpRepository(search)
    }

    // Apply category filter
    if (category) {
      servers = servers.filter((s) => s.category === category)
    }

    const categories = getMcpCategories()

    return NextResponse.json({
      success: true,
      data: {
        servers,
        categories,
        totalCount: servers.length,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch MCP repository:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repository'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
