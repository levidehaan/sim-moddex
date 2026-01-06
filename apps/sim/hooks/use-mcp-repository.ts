/**
 * React hooks for MCP repository
 */

import { useQuery } from '@tanstack/react-query'
import type { McpRepositoryEntry } from '@/lib/mcp/types'

interface RepositoryResponse {
  servers: McpRepositoryEntry[]
  categories: string[]
  totalCount: number
}

/**
 * Fetch MCP repository servers
 */
export function useMcpRepository(search?: string, category?: string) {
  return useQuery({
    queryKey: ['mcp', 'repository', search, category],
    queryFn: async (): Promise<RepositoryResponse> => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category && category !== 'all') params.set('category', category)

      const response = await fetch(`/api/mcp/repository?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch repository')
      }

      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - repository doesn't change often
  })
}

/**
 * Fetch a specific repository entry
 */
export function useMcpRepositoryEntry(id: string | null) {
  return useQuery({
    queryKey: ['mcp', 'repository', id],
    queryFn: async (): Promise<McpRepositoryEntry> => {
      if (!id) throw new Error('Repository ID is required')

      const response = await fetch(`/api/mcp/repository/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch repository entry')
      }

      return data.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
