/**
 * MCP Server Launcher
 * Handles launching and managing local MCP servers (npm, python, node, docker)
 */

import { spawn, type ChildProcess } from 'child_process'
import { createLogger } from '@sim/logger'
import type { McpServerConfig } from './types'

const logger = createLogger('MCPLauncher')

export interface LaunchedServer {
  process: ChildProcess
  pid: number
  startTime: Date
  config: McpServerConfig
}

/**
 * Active server processes
 */
const activeServers = new Map<string, LaunchedServer>()

/**
 * Launch an NPM-based MCP server using npx
 */
export async function launchNpmServer(config: McpServerConfig): Promise<LaunchedServer> {
  if (!config.package) {
    throw new Error('NPM package name is required')
  }

  logger.info(`Launching NPM MCP server: ${config.package}`)

  const args = config.args || []
  const env = {
    ...process.env,
    ...config.env,
  }

  // Build npx command
  const npxArgs = [config.package, ...args]
  
  const serverProcess = spawn('npx', npxArgs, {
    cwd: config.cwd || process.cwd(),
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  if (!serverProcess.pid) {
    throw new Error('Failed to start NPM server process')
  }

  const launched: LaunchedServer = {
    process: serverProcess,
    pid: serverProcess.pid,
    startTime: new Date(),
    config,
  }

  activeServers.set(config.id, launched)

  // Handle process events
  serverProcess.on('error', (error) => {
    logger.error(`NPM server ${config.id} error:`, error)
  })

  serverProcess.on('exit', (code, signal) => {
    logger.info(`NPM server ${config.id} exited with code ${code}, signal ${signal}`)
    activeServers.delete(config.id)
    
    // Auto-restart if configured
    if (config.autoRestart && code !== 0) {
      logger.info(`Auto-restarting NPM server ${config.id}`)
      setTimeout(() => launchNpmServer(config), 5000)
    }
  })

  // Log stdout/stderr
  serverProcess.stdout?.on('data', (data) => {
    logger.debug(`[${config.id}] ${data.toString()}`)
  })

  serverProcess.stderr?.on('data', (data) => {
    logger.warn(`[${config.id}] ${data.toString()}`)
  })

  return launched
}

/**
 * Launch a Python-based MCP server
 */
export async function launchPythonServer(config: McpServerConfig): Promise<LaunchedServer> {
  if (!config.command && !config.package) {
    throw new Error('Python command or package name is required')
  }

  logger.info(`Launching Python MCP server: ${config.package || config.command}`)

  const command = config.command || 'python'
  const args = config.args || []
  const env = {
    ...process.env,
    ...config.env,
    PYTHONUNBUFFERED: '1', // Disable Python output buffering
  }

  const serverProcess = spawn(command, args, {
    cwd: config.cwd || process.cwd(),
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  if (!serverProcess.pid) {
    throw new Error('Failed to start Python server process')
  }

  const launched: LaunchedServer = {
    process: serverProcess,
    pid: serverProcess.pid,
    startTime: new Date(),
    config,
  }

  activeServers.set(config.id, launched)

  // Handle process events
  serverProcess.on('error', (error) => {
    logger.error(`Python server ${config.id} error:`, error)
  })

  serverProcess.on('exit', (code, signal) => {
    logger.info(`Python server ${config.id} exited with code ${code}, signal ${signal}`)
    activeServers.delete(config.id)
    
    if (config.autoRestart && code !== 0) {
      logger.info(`Auto-restarting Python server ${config.id}`)
      setTimeout(() => launchPythonServer(config), 5000)
    }
  })

  serverProcess.stdout?.on('data', (data) => {
    logger.debug(`[${config.id}] ${data.toString()}`)
  })

  serverProcess.stderr?.on('data', (data) => {
    logger.warn(`[${config.id}] ${data.toString()}`)
  })

  return launched
}

/**
 * Launch a Node.js-based MCP server
 */
export async function launchNodeServer(config: McpServerConfig): Promise<LaunchedServer> {
  if (!config.command) {
    throw new Error('Node command is required')
  }

  logger.info(`Launching Node MCP server: ${config.command}`)

  const args = config.args || []
  const env = {
    ...process.env,
    ...config.env,
  }

  const serverProcess = spawn('node', [config.command, ...args], {
    cwd: config.cwd || process.cwd(),
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  if (!serverProcess.pid) {
    throw new Error('Failed to start Node server process')
  }

  const launched: LaunchedServer = {
    process: serverProcess,
    pid: serverProcess.pid,
    startTime: new Date(),
    config,
  }

  activeServers.set(config.id, launched)

  serverProcess.on('error', (error) => {
    logger.error(`Node server ${config.id} error:`, error)
  })

  serverProcess.on('exit', (code, signal) => {
    logger.info(`Node server ${config.id} exited with code ${code}, signal ${signal}`)
    activeServers.delete(config.id)
    
    if (config.autoRestart && code !== 0) {
      logger.info(`Auto-restarting Node server ${config.id}`)
      setTimeout(() => launchNodeServer(config), 5000)
    }
  })

  serverProcess.stdout?.on('data', (data) => {
    logger.debug(`[${config.id}] ${data.toString()}`)
  })

  serverProcess.stderr?.on('data', (data) => {
    logger.warn(`[${config.id}] ${data.toString()}`)
  })

  return launched
}

/**
 * Stop a running MCP server
 */
export async function stopServer(serverId: string): Promise<void> {
  const server = activeServers.get(serverId)
  if (!server) {
    logger.warn(`Server ${serverId} not found in active servers`)
    return
  }

  logger.info(`Stopping MCP server: ${serverId}`)

  return new Promise((resolve) => {
    server.process.once('exit', () => {
      activeServers.delete(serverId)
      resolve()
    })

    // Try graceful shutdown first
    server.process.kill('SIGTERM')

    // Force kill after timeout
    setTimeout(() => {
      if (activeServers.has(serverId)) {
        logger.warn(`Force killing server ${serverId}`)
        server.process.kill('SIGKILL')
      }
    }, 5000)
  })
}

/**
 * Get active server info
 */
export function getActiveServer(serverId: string): LaunchedServer | undefined {
  return activeServers.get(serverId)
}

/**
 * Get all active servers
 */
export function getAllActiveServers(): Map<string, LaunchedServer> {
  return new Map(activeServers)
}

/**
 * Check if server is running
 */
export function isServerRunning(serverId: string): boolean {
  return activeServers.has(serverId)
}

/**
 * Get server uptime in seconds
 */
export function getServerUptime(serverId: string): number | undefined {
  const server = activeServers.get(serverId)
  if (!server) return undefined
  
  return Math.floor((Date.now() - server.startTime.getTime()) / 1000)
}

/**
 * Restart a server
 */
export async function restartServer(serverId: string): Promise<LaunchedServer> {
  const server = activeServers.get(serverId)
  if (!server) {
    throw new Error(`Server ${serverId} not found`)
  }

  const config = server.config
  await stopServer(serverId)

  // Wait a bit before restarting
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Launch based on source type
  switch (config.source) {
    case 'npm':
      return launchNpmServer(config)
    case 'python':
      return launchPythonServer(config)
    case 'node':
      return launchNodeServer(config)
    default:
      throw new Error(`Cannot restart server with source type: ${config.source}`)
  }
}

/**
 * Stop all active servers
 */
export async function stopAllServers(): Promise<void> {
  const serverIds = Array.from(activeServers.keys())
  await Promise.all(serverIds.map((id) => stopServer(id)))
}

/**
 * Launch a server based on its source type
 */
export async function launchServer(config: McpServerConfig): Promise<LaunchedServer> {
  switch (config.source) {
    case 'npm':
      return launchNpmServer(config)
    case 'python':
      return launchPythonServer(config)
    case 'node':
      return launchNodeServer(config)
    default:
      throw new Error(`Unsupported server source type: ${config.source}`)
  }
}
