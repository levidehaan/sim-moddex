import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { consumeMessages, createKafkaClient } from '../utils'

const logger = createLogger('KafkaConsumeAPI')

const ConsumeSchema = z.object({
  brokers: z.string().min(1, 'Kafka brokers are required'),
  clientId: z.string().optional(),
  ssl: z.boolean().optional(),
  saslMechanism: z.enum(['plain', 'scram-sha-256', 'scram-sha-512']).nullish(),
  saslUsername: z.string().nullish(),
  saslPassword: z.string().nullish(),
  topic: z.string().min(1, 'Topic is required'),
  groupId: z.string().min(1, 'Consumer group ID is required'),
  fromBeginning: z.boolean().optional(),
  maxMessages: z.number().min(1).max(1000).optional(),
  timeout: z.number().min(100).max(60000).optional(),
  condition: z.string().nullish(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    const body = await request.json()
    const params = ConsumeSchema.parse(body)

    logger.info(`[${requestId}] Consuming from topic ${params.topic} with group ${params.groupId}`)

    const kafka = createKafkaClient({
      brokers: params.brokers,
      clientId: params.clientId,
      ssl: params.ssl,
      saslMechanism: params.saslMechanism,
      saslUsername: params.saslUsername,
      saslPassword: params.saslPassword,
    })

    const result = await consumeMessages(kafka, params.topic, params.groupId, {
      fromBeginning: params.fromBeginning,
      maxMessages: params.maxMessages,
      timeout: params.timeout,
      condition: params.condition,
    })

    logger.info(
      `[${requestId}] Consumed ${result.messageCount} messages from topic ${params.topic}`
    )

    return NextResponse.json({
      message: `Consumed ${result.messageCount} messages from topic ${params.topic}`,
      topic: result.topic,
      groupId: result.groupId,
      messageCount: result.messageCount,
      messages: result.messages,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`[${requestId}] Invalid request data`, {
        errors: error.errors,
      })
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.error(`[${requestId}] Kafka consume failed:`, error)

    return NextResponse.json({ error: `Kafka consume failed: ${errorMessage}` }, { status: 500 })
  }
}
