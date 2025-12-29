import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, parseTermuxOutput, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidLocationAPI')

const LocationSchema = z.object({
  provider: z.enum(['gps', 'network', 'passive']).optional(),
  request: z.enum(['once', 'last', 'updates']).optional(),
})

interface LocationData {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  bearing?: number
  speed?: number
  provider: string
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = LocationSchema.parse(body)

    logger.info(`[${requestId}] Getting location with provider: ${params.provider || 'gps'}`)

    const args: string[] = []

    if (params.provider) {
      args.push('-p', params.provider)
    }
    if (params.request) {
      args.push('-r', params.request)
    }

    const { stdout } = await executeTermuxApi('location', args)
    const location = parseTermuxOutput<LocationData>(stdout)

    logger.info(`[${requestId}] Location retrieved: ${location.latitude}, ${location.longitude}`)

    return NextResponse.json({
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      accuracy: location.accuracy,
      bearing: location.bearing,
      speed: location.speed,
      provider: location.provider || params.provider || 'gps',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`[${requestId}] Invalid request data`, { errors: error.errors })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.error(`[${requestId}] Android location failed:`, error)

    return NextResponse.json({ error: `Location failed: ${errorMessage}` }, { status: 500 })
  }
}
