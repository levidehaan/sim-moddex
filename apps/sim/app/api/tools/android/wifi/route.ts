import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, parseTermuxOutput, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidWifiAPI')

const WifiSchema = z.object({
  operation: z.enum(['scan', 'info', 'enable', 'disable']),
})

interface WifiInfo {
  bssid: string
  frequency_mhz: number
  ip: string
  link_speed_mbps: number
  mac_address: string
  network_id: number
  rssi: number
  ssid: string
  ssid_hidden: boolean
  supplicant_state: string
}

interface WifiNetwork {
  bssid: string
  frequency_mhz: number
  rssi: number
  ssid: string
  timestamp: number
  channel_bandwidth_mhz?: string
  center_frequency_mhz?: number
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = WifiSchema.parse(body)

    logger.info(`[${requestId}] WiFi operation: ${params.operation}`)

    switch (params.operation) {
      case 'info': {
        const { stdout } = await executeTermuxApi('wifi-connectioninfo')
        const info = parseTermuxOutput<WifiInfo>(stdout)

        return NextResponse.json({
          connected: info.network_id !== -1,
          ssid: info.ssid,
          bssid: info.bssid,
          ipAddress: info.ip,
          linkSpeed: info.link_speed_mbps,
          message: 'WiFi info retrieved',
        })
      }

      case 'scan': {
        const { stdout } = await executeTermuxApi('wifi-scaninfo')
        const networks = parseTermuxOutput<WifiNetwork[]>(stdout)

        return NextResponse.json({
          connected: false,
          networks: networks.map((n) => ({
            ssid: n.ssid,
            bssid: n.bssid,
            frequency: n.frequency_mhz,
            level: n.rssi,
            security: 'unknown',
          })),
          message: `Found ${networks.length} networks`,
        })
      }

      case 'enable': {
        await executeTermuxApi('wifi-enable')
        return NextResponse.json({
          connected: false,
          message: 'WiFi enabled',
        })
      }

      case 'disable': {
        await executeTermuxApi('wifi-enable', ['-d'])
        return NextResponse.json({
          connected: false,
          message: 'WiFi disabled',
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`[${requestId}] Invalid request data`, { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.error(`[${requestId}] Android WiFi failed:`, error)

    return NextResponse.json({ error: `WiFi failed: ${errorMessage}` }, { status: 500 })
  }
}
