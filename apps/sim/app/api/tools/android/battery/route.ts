import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import { executeTermuxApi, parseTermuxOutput, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidBatteryAPI')

interface BatteryStatus {
  health: string
  percentage: number
  plugged: string
  status: string
  temperature: number
  current: number
}

export async function GET() {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    logger.info(`[${requestId}] Getting battery status`)

    const { stdout } = await executeTermuxApi('battery-status')
    const battery = parseTermuxOutput<BatteryStatus>(stdout)

    logger.info(`[${requestId}] Battery status retrieved: ${battery.percentage}%`)

    return NextResponse.json({
      health: battery.health,
      percentage: battery.percentage,
      plugged: battery.plugged,
      status: battery.status,
      temperature: battery.temperature,
      current: battery.current,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.error(`[${requestId}] Android battery status failed:`, error)

    return NextResponse.json({ error: `Battery status failed: ${errorMessage}` }, { status: 500 })
  }
}
