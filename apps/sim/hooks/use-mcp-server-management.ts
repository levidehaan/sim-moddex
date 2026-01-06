/**
 * React hooks for MCP server management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLogger } from '@sim/logger'
import type { McpServerConfig } from '@/lib/mcp/types'

const logger = createLogger('useMcpServerManagement')

/**
 * Launch a local MCP server
 */
export function useLaunchMcpServer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: McpServerConfig) => {
      const response = await fetch('/api/mcp/servers/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to launch server')
      }

      return data.data
    },
    onSuccess: (data, variables) => {
      logger.info(`Launched MCP server: ${variables.name}`)
      // Invalidate server queries to refresh status
      queryClient.invalidateQueries({ queryKey: ['mcp', 'servers'] })
    },
    onError: (error) => {
      logger.error('Failed to launch MCP server:', error)
    },
  })
}

/**
 * Stop a running MCP server
 */
export function useStopMcpServer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serverId: string) => {
      const response = await fetch(`/api/mcp/servers/${serverId}/stop`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to stop server')
      }

      return data.data
    },
    onSuccess: (data) => {
      logger.info(`Stopped MCP server: ${data.serverId}`)
      queryClient.invalidateQueries({ queryKey: ['mcp', 'servers'] })
    },
    onError: (error) => {
      logger.error('Failed to stop MCP server:', error)
    },
  })
}

/**
 * Restart a running MCP server
 */
export function useRestartMcpServer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serverId: string) => {
      const response = await fetch(`/api/mcp/servers/${serverId}/restart`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restart server')
      }

      return data.data
    },
    onSuccess: (data) => {
      logger.info(`Restarted MCP server: ${data.serverId}`)
      queryClient.invalidateQueries({ queryKey: ['mcp', 'servers'] })
    },
    onError: (error) => {
      logger.error('Failed to restart MCP server:', error)
    },
  })
}

/**
 * Get server status
 */
export function useMcpServerStatus(serverId: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!serverId) throw new Error('Server ID is required')

      const response = await fetch(`/api/mcp/servers/${serverId}/status`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get server status')
      }

      return data.data
    },
  })
}
