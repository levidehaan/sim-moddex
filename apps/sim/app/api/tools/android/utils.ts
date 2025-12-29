import { exec } from 'child_process'
import { promisify } from 'util'
import { createLogger } from '@sim/logger'
import type { AndroidEnvironment } from '@/tools/android/types'

const execAsync = promisify(exec)
const logger = createLogger('AndroidUtils')

/**
 * Check if we're running in a Termux environment
 */
export async function detectAndroidEnvironment(): Promise<AndroidEnvironment> {
  const env: AndroidEnvironment = {
    isTermux: false,
    hasTermuxApi: false,
    hasAdb: false,
  }

  try {
    // Check for Termux environment variables
    if (process.env.TERMUX_VERSION || process.env.PREFIX?.includes('com.termux')) {
      env.isTermux = true
      env.termuxVersion = process.env.TERMUX_VERSION
    }

    // Check for termux-api availability
    try {
      await execAsync('which termux-battery-status')
      env.hasTermuxApi = true
    } catch {
      // termux-api not installed
    }

    // Check for adb availability
    try {
      await execAsync('which adb')
      env.hasAdb = true
    } catch {
      // adb not available
    }

    // Try to get Android version if in Termux
    if (env.isTermux) {
      try {
        const { stdout } = await execAsync('getprop ro.build.version.release')
        env.androidVersion = stdout.trim()
      } catch {
        // Could not get Android version
      }

      try {
        const { stdout } = await execAsync('getprop ro.product.model')
        env.deviceModel = stdout.trim()
      } catch {
        // Could not get device model
      }
    }
  } catch (error) {
    logger.warn('Error detecting Android environment:', error)
  }

  return env
}

/**
 * Execute a Termux:API command
 */
export async function executeTermuxApi(
  command: string,
  args: string[] = [],
  input?: string
): Promise<{ stdout: string; stderr: string }> {
  const fullCommand = `termux-${command} ${args.join(' ')}`

  logger.info(`Executing Termux:API command: ${fullCommand}`)

  try {
    const options: { timeout: number; input?: string } = {
      timeout: 30000,
    }

    if (input) {
      options.input = input
    }

    const { stdout, stderr } = await execAsync(fullCommand, options)
    return { stdout: stdout.trim(), stderr: stderr.trim() }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Termux:API command failed: ${errorMessage}`)
    throw new Error(`Termux:API command failed: ${errorMessage}`)
  }
}

/**
 * Execute an ADB command
 */
export async function executeAdb(
  command: string,
  serial?: string
): Promise<{ stdout: string; stderr: string }> {
  const serialArg = serial ? `-s ${serial}` : ''
  const fullCommand = `adb ${serialArg} ${command}`

  logger.info(`Executing ADB command: ${fullCommand}`)

  try {
    const { stdout, stderr } = await execAsync(fullCommand, { timeout: 30000 })
    return { stdout: stdout.trim(), stderr: stderr.trim() }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`ADB command failed: ${errorMessage}`)
    throw new Error(`ADB command failed: ${errorMessage}`)
  }
}

/**
 * Parse JSON output from Termux:API commands
 */
export function parseTermuxOutput<T>(stdout: string): T {
  try {
    return JSON.parse(stdout) as T
  } catch {
    throw new Error(`Failed to parse Termux:API output: ${stdout}`)
  }
}

/**
 * Check if Termux:API is available
 */
export async function checkTermuxApi(): Promise<boolean> {
  try {
    await execAsync('which termux-battery-status')
    return true
  } catch {
    return false
  }
}

/**
 * Verify that we're in a Termux environment or throw an error
 */
export async function requireTermuxEnvironment(): Promise<void> {
  const env = await detectAndroidEnvironment()

  if (!env.isTermux) {
    throw new Error(
      'This endpoint requires a Termux environment. Please run the server on an Android device with Termux.'
    )
  }

  if (!env.hasTermuxApi) {
    throw new Error(
      'Termux:API is not installed. Please install Termux:API from F-Droid and run: pkg install termux-api'
    )
  }
}
