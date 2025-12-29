import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidClipboardAPI')

const ClipboardSchema = z.object({
  operation: z.enum(['get', 'set']),
  text: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = ClipboardSchema.parse(body)

    logger.info(`[${requestId}] Clipboard operation: ${params.operation}`)

    if (params.operation === 'get') {
      const { stdout } = await executeTermuxApi('clipboard-get')

      return NextResponse.json({
        text: stdout,
        message: 'Clipboard content retrieved',
      })
    } else {
      if (!params.text) {
        return NextResponse.json({ error: 'Text is required for set operation' }, { status: 400 })
      }

      await executeTermuxApi('clipboard-set', [], params.text)

      return NextResponse.json({
        text: params.text,
        message: 'Clipboard content set',
      })
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
    logger.error(`[${requestId}] Android clipboard failed:`, error)

    return NextResponse.json({ error: `Clipboard failed: ${errorMessage}` }, { status: 500 })
  }
}
