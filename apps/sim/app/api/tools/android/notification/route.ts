import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { executeTermuxApi, requireTermuxEnvironment } from '../utils'

const logger = createLogger('AndroidNotificationAPI')

const NotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  id: z.string().optional(),
  priority: z.enum(['high', 'default', 'low', 'min', 'max']).optional(),
  sound: z.boolean().optional(),
  vibrate: z.boolean().optional(),
  led: z.boolean().optional(),
  ledColor: z.string().optional(),
  ledOnMs: z.number().optional(),
  ledOffMs: z.number().optional(),
  group: z.string().optional(),
  imageUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  actionCommand: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    // Verify Termux environment
    await requireTermuxEnvironment()

    const body = await request.json()
    const params = NotificationSchema.parse(body)

    logger.info(`[${requestId}] Sending notification: ${params.title}`)

    const args: string[] = ['-t', params.title, '-c', params.content]

    if (params.id) {
      args.push('-i', params.id)
    }
    if (params.priority) {
      args.push('--priority', params.priority)
    }
    if (params.sound) {
      args.push('--sound')
    }
    if (params.vibrate) {
      args.push('--vibrate', '500')
    }
    if (params.led) {
      args.push('--led-on', String(params.ledOnMs || 500))
      args.push('--led-off', String(params.ledOffMs || 500))
      if (params.ledColor) {
        args.push('--led-color', params.ledColor)
      }
    }
    if (params.group) {
      args.push('--group', params.group)
    }
    if (params.imageUrl) {
      args.push('--image-path', params.imageUrl)
    }
    if (params.actionLabel && params.actionCommand) {
      args.push('--action', params.actionLabel)
      args.push('--on-delete', params.actionCommand)
    }

    await executeTermuxApi('notification', args)

    const notificationId = params.id || randomUUID().slice(0, 8)

    logger.info(`[${requestId}] Notification sent: ${notificationId}`)

    return NextResponse.json({
      id: notificationId,
      message: 'Notification sent successfully',
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
    logger.error(`[${requestId}] Android notification failed:`, error)

    return NextResponse.json({ error: `Notification failed: ${errorMessage}` }, { status: 500 })
  }
}
