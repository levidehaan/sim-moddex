/**
 * MCP Auto-Deploy System
 * Automatically launches and manages MCP servers on workspace initialization
 */

import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import { mcpServers } from '@sim/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { launchNpmServer, launchPythonServer, launchNodeServer, isServerRunning } from './launcher'
import type { McpServerConfig } from './types'

const logger = createLogger('MCPAutoDeploy')

/**
 * Auto-deploy all enabled servers for a workspace
 */
export async function autoDeployWorkspaceServers(workspaceId: string): Promise<void> {
  try {
    logger.info(`Auto-deploying MCP servers for workspace: ${workspaceId}`)

    // Get all enabled servers with autoDeploy=true
    const servers = await db
      .select()
      .from(mcpServers)
      .where(
        and(
          eq(mcpServers.workspaceId, workspaceId),
          eq(mcpServers.enabled, true),
          isNull(mcpServers.deletedAt)
        )
      )

    const autoDeployServers = servers.filter((server) => {
      const config = server.configValues as any
      return config?.autoDeploy === true
    })

    logger.info(`Found ${autoDeployServers.length} servers to auto-deploy`)

    for (const server of autoDeployServers) {
      try {
        // Skip if already running
        if (isServerRunning(server.id)) {
          logger.info(`Server ${server.id} already running, skipping`)
          continue
        }

        const config: McpServerConfig = {
          id: server.id,
          name: server.name,
          source: server.source as any,
          transport: server.transport as any,
          package: server.package || undefined,
          command: server.command || undefined,
          args: (server.args as string[]) || undefined,
          env: (server.env as Record<string, string>) || undefined,
          cwd: server.cwd || undefined,
          autoRestart: (server.configValues as any)?.autoRestart || false,
          sandboxed: (server.configValues as any)?.sandboxed || false,
          allowedPaths: (server.configValues as any)?.allowedPaths || undefined,
          allowedHosts: (server.configValues as any)?.allowedHosts || undefined,
          maxMemory: (server.configValues as any)?.maxMemory || undefined,
          maxCpu: (server.configValues as any)?.maxCpu || undefined,
        }

        await launchServerBySource(config)
        logger.info(`Successfully auto-deployed server: ${server.name}`)
      } catch (error) {
        logger.error(`Failed to auto-deploy server ${server.name}:`, error)
      }
    }
  } catch (error) {
    logger.error(`Failed to auto-deploy workspace servers:`, error)
  }
}

/**
 * Launch a server based on its source type
 */
async function launchServerBySource(config: McpServerConfig): Promise<void> {
  switch (config.source) {
    case 'npm':
      await launchNpmServer(config)
      break
    case 'python':
      await launchPythonServer(config)
      break
    case 'node':
      await launchNodeServer(config)
      break
    case 'remote':
      // Remote servers don't need launching
      logger.info(`Server ${config.id} is remote, no launch needed`)
      break
    default:
      logger.warn(`Unsupported server source for auto-deploy: ${config.source}`)
  }
}

/**
 * Health check for a server
 */
export async function healthCheckServer(serverId: string, healthCheckUrl?: string): Promise<boolean> {
  if (!healthCheckUrl) {
    // If no health check URL, just check if process is running
    return isServerRunning(serverId)
  }

  try {
    const response = await fetch(healthCheckUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch (error) {
    logger.warn(`Health check failed for server ${serverId}:`, error)
    return false
  }
}

/**
 * Start health check monitoring for a server
 */
export function startHealthCheckMonitoring(
  serverId: string,
  healthCheckUrl: string,
  intervalMs: number = 60000
): NodeJS.Timeout {
  logger.info(`Starting health check monitoring for server ${serverId}`)

  return setInterval(async () => {
    const isHealthy = await healthCheckServer(serverId, healthCheckUrl)
    if (!isHealthy) {
      logger.warn(`Server ${serverId} failed health check`)
      // Health check failure is logged, auto-restart is handled by launcher
    }
  }, intervalMs)
}

/**
 * Stop health check monitoring
 */
export function stopHealthCheckMonitoring(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId)
}
