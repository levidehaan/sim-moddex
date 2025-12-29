import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, parseTermuxOutput, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidSensorAPI')

const SensorSchema = z.object({
  sensor: z.string().min(1, 'Sensor type is required'),
  delay: z.enum(['fastest', 'game', 'ui', 'normal']).optional(),
  duration: z.number().min(100).max(30000).optional(),
})

interface SensorReading {
  values: number[]
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = SensorSchema.parse(body)

    logger.info(`[${requestId}] Reading sensor: ${params.sensor}`)

    const args: string[] = ['-s', params.sensor]

    if (params.delay) {
      args.push('-d', params.delay)
    }

    // For duration-based readings, we'd need to implement streaming
    // For now, we get a single reading
    args.push('-n', '1')

    const { stdout } = await executeTermuxApi('sensor', args)
    const reading = parseTermuxOutput<SensorReading>(stdout)

    logger.info(`[${requestId}] Sensor reading complete for ${params.sensor}`)

    return NextResponse.json({
      sensor: params.sensor,
      readings: [
        {
          name: params.sensor,
          values: reading.values,
          timestamp: Date.now(),
        },
      ],
      message: `Sensor ${params.sensor} read successfully`,
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
    logger.error(`[${requestId}] Android sensor read failed:`, error)

    return NextResponse.json({ error: `Sensor read failed: ${errorMessage}` }, { status: 500 })
  }
}
