import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createKafkaClient, produceMessages } from '../utils'

const logger = createLogger('KafkaProduceAPI')

const MessageSchema = z.object({
  key: z.string().nullish(),
  value: z.union([z.string(), z.record(z.unknown())]),
  headers: z.record(z.string()).optional(),
  partition: z.number().optional(),
})

const ProduceSchema = z.object({
  brokers: z.string().min(1, 'Kafka brokers are required'),
  clientId: z.string().optional(),
  ssl: z.boolean().optional(),
  saslMechanism: z.enum(['plain', 'scram-sha-256', 'scram-sha-512']).nullish(),
  saslUsername: z.string().nullish(),
  saslPassword: z.string().nullish(),
  topic: z.string().min(1, 'Topic is required'),
  messages: z.array(MessageSchema).min(1, 'At least one message is required'),
  acks: z.union([z.literal(-1), z.literal(0), z.literal(1)]).optional(),
  timeout: z.number().optional(),
})

export async function POST(request: NextRequest) {
  const requestId = randomUUID().slice(0, 8)

  try {
    const body = await request.json()
    const params = ProduceSchema.parse(body)

    logger.info(
      `[${requestId}] Producing ${params.messages.length} messages to topic ${params.topic}`
    )

    const kafka = createKafkaClient({
      brokers: params.brokers,
      clientId: params.clientId,
      ssl: params.ssl,
      saslMechanism: params.saslMechanism,
      saslUsername: params.saslUsername,
      saslPassword: params.saslPassword,
    })

    const result = await produceMessages(
      kafka,
      params.topic,
      params.messages,
      params.acks,
      params.timeout
    )

    logger.info(
      `[${requestId}] Successfully produced ${result.messageCount} messages to topic ${params.topic}`
    )

    return NextResponse.json({
      message: `Successfully produced ${result.messageCount} messages to topic ${params.topic}`,
      topic: result.topic,
      messageCount: result.messageCount,
      offsets: result.offsets,
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
    logger.error(`[${requestId}] Kafka produce failed:`, error)

    return NextResponse.json({ error: `Kafka produce failed: ${errorMessage}` }, { status: 500 })
  }
}
