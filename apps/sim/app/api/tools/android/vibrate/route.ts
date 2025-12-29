import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidVibrateAPI')

const VibrateSchema = z.object({
  duration: z.number().min(1).max(10000).optional(),
  pattern: z.array(z.number()).optional(),
  force: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = VibrateSchema.parse(body)

    logger.info(`[${requestId}] Vibrating device`)

    const args: string[] = []

    if (params.duration) {
      args.push('-d', String(params.duration))
    }
    if (params.force) {
      args.push('-f')
    }

    await executeTermuxApi('vibrate', args)

    logger.info(`[${requestId}] Device vibrated`)

    return NextResponse.json({
      message: 'Device vibrated successfully',
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
    logger.error(`[${requestId}] Android vibrate failed:`, error)

    return NextResponse.json({ error: `Vibrate failed: ${errorMessage}` }, { status: 500 })
  }
}
