import { randomUUID } from 'crypto'
import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { consumeMessages, createKafkaClient } from '../utils'
import { applyTransformations, computeAggregations, extractFields } from './utils'

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
  groupId: z.string().min(1, 'Consumer group ID is required'),
  fromBeginning: z.boolean().optional(),
  readMode: z.enum(['latest', 'earliest', 'last_n', 'time_range']).optional(),
  startOffset: z.number().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  searchPatterns: z.array(z.string()).optional(),
  maxMessages: z.number().min(1).max(1000).optional(),
  timeout: z.number().min(100).max(60000).optional(),
  condition: z.string().nullish(),
  extractFields: z.array(z.object({ name: z.string(), path: z.string() })).optional(),
  transformations: z.array(z.object({
    field: z.string(),
    operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'uppercase', 'lowercase', 'trim', 'substring']),
    value: z.union([z.number(), z.string()]).optional(),
    start: z.number().optional(),
    end: z.number().optional(),
  })).optional(),
  aggregations: z.array(z.object({
    field: z.string(),
    operation: z.enum(['sum', 'avg', 'min', 'max', 'count']),
  })).optional(),
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
      readMode: params.readMode,
      startOffset: params.startOffset,
      startDate: params.startDate && params.startDate !== '' ? params.startDate : undefined,
      endDate: params.endDate && params.endDate !== '' ? params.endDate : undefined,
      searchPatterns: params.searchPatterns,
      maxMessages: params.maxMessages,
      timeout: params.timeout,
      condition: params.condition,
    })

    logger.info(
      `[${requestId}] Consumed ${result.messageCount} messages from topic ${params.topic}`
    )

    // Process field extraction and transformations if specified
    let extractedData: Record<string, unknown>[] | undefined
    let aggregationResults: Record<string, number> | undefined

    if (params.extractFields && params.extractFields.length > 0) {
      extractedData = result.messages.map((msg) => {
        let extracted = extractFields(msg, params.extractFields!)
        
        // Apply transformations if specified
        if (params.transformations && params.transformations.length > 0) {
          extracted = applyTransformations(extracted, params.transformations)
        }
        
        return extracted
      })

      logger.info(`[${requestId}] Extracted ${extractedData.length} data records`)

      // Compute aggregations if specified
      if (params.aggregations && params.aggregations.length > 0) {
        aggregationResults = computeAggregations(extractedData, params.aggregations)
        logger.info(`[${requestId}] Computed ${Object.keys(aggregationResults).length} aggregations`)
      }
    }

    return NextResponse.json({
      message: `Consumed ${result.messageCount} messages from topic ${params.topic}`,
      topic: result.topic,
      groupId: result.groupId,
      messageCount: result.messageCount,
      messages: result.messages,
      extractedData,
      aggregations: aggregationResults,
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
