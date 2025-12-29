import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidTtsAPI')

const TtsSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  language: z.string().optional(),
  pitch: z.number().min(0.25).max(4.0).optional(),
  rate: z.number().min(0.25).max(4.0).optional(),
  engine: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = TtsSchema.parse(body)

    logger.info(`[${requestId}] Speaking text: ${params.text.substring(0, 50)}...`)

    const args: string[] = []

    if (params.language) {
      args.push('-l', params.language)
    }
    if (params.pitch) {
      args.push('-p', String(params.pitch))
    }
    if (params.rate) {
      args.push('-r', String(params.rate))
    }
    if (params.engine) {
      args.push('-e', params.engine)
    }

    await executeTermuxApi('tts-speak', args, params.text)

    logger.info(`[${requestId}] Text spoken successfully`)

    return NextResponse.json({
      text: params.text,
      message: 'Text spoken successfully',
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
    logger.error(`[${requestId}] Android TTS failed:`, error)

    return NextResponse.json({ error: `TTS failed: ${errorMessage}` }, { status: 500 })
  }
}
