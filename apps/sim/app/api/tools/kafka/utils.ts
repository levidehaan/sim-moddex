import {
  type EachMessagePayload,
  Kafka,
  type KafkaConfig,
  logLevel,
  type SASLOptions,
  CompressionTypes,
  CompressionCodecs,
} from 'kafkajs'
import SnappyCodec from 'kafkajs-snappy'
import type { KafkaConnectionConfig, KafkaConsumedMessage, KafkaMessage } from '@/tools/kafka/types'

// Register Snappy Codec
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec

/**
 * Creates a Kafka client with the given configuration
 */
export function createKafkaClient(config: KafkaConnectionConfig): Kafka {
  const brokerList = config.brokers
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b.length > 0)

  const kafkaConfig: KafkaConfig = {
    clientId: config.clientId || 'sim-kafka-client',
    brokers: brokerList,
    logLevel: logLevel.WARN,
  }

  if (config.ssl) {
    kafkaConfig.ssl = true
  }

  if (config.saslMechanism && config.saslUsername && config.saslPassword) {
    const saslOptions: SASLOptions = {
      mechanism: config.saslMechanism,
      username: config.saslUsername,
      password: config.saslPassword,
    }
    kafkaConfig.sasl = saslOptions
  }

  return new Kafka(kafkaConfig)
}

/**
 * Produce messages to a Kafka topic
 */
export async function produceMessages(
  kafka: Kafka,
  topic: string,
  messages: KafkaMessage[],
  acks?: number,
  timeout?: number
): Promise<{
  topic: string
  messageCount: number
  offsets: Array<{ partition: number; offset: string }>
}> {
  const producer = kafka.producer()

  try {
    await producer.connect()

    const kafkaMessages = messages.map((msg) => ({
      key: msg.key || undefined,
      value: typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value),
      headers: msg.headers,
      partition: msg.partition,
    }))

    const result = await producer.send({
      topic,
      messages: kafkaMessages,
      acks: acks ?? -1,
      timeout: timeout ?? 30000,
    })

    const offsets: Array<{ partition: number; offset: string }> = []
    for (const record of result) {
      if (record.baseOffset) {
        offsets.push({
          partition: record.partition,
          offset: record.baseOffset,
        })
      }
    }

    return {
      topic,
      messageCount: messages.length,
      offsets,
    }
  } finally {
    await producer.disconnect()
  }
}

/**
 * Evaluates a condition expression against a message value
 * @param condition - JavaScript expression to evaluate (e.g., "value.status === 'error'")
 * @param value - The message value to evaluate against
 * @returns true if the condition matches, false otherwise
 */
export function evaluateCondition(condition: string, value: unknown): boolean {
  if (!condition || condition.trim() === '') {
    return true
  }

  try {
    // Create a safe evaluation context
    const safeValue = typeof value === 'object' ? value : { _value: value }

    // Build evaluation function with value in scope
    const evalFn = new Function(
      'value',
      `
      try {
        return Boolean(${condition});
      } catch (e) {
        return false;
      }
    `
    )

    return evalFn(safeValue)
  } catch {
    return false
  }
}

/**
 * Consume messages from a Kafka topic with advanced filtering
 */
export async function consumeMessages(
  kafka: Kafka,
  topic: string,
  groupId: string,
  options?: {
    fromBeginning?: boolean
    readMode?: 'latest' | 'earliest' | 'last_n' | 'time_range'
    startOffset?: number
    startDate?: string
    endDate?: string
    searchPatterns?: string[]
    maxMessages?: number
    timeout?: number
    condition?: string | null
  }
): Promise<{
  topic: string
  groupId: string
  messageCount: number
  messages: KafkaConsumedMessage[]
}> {
  const consumer = kafka.consumer({ groupId })
  const messages: KafkaConsumedMessage[] = []
  const maxMessages = options?.maxMessages ?? 100
  const timeout = options?.timeout ?? 5000
  const condition = options?.condition
  const readMode = options?.readMode || (options?.fromBeginning ? 'earliest' : 'latest')
  
  // Parse dates
  const startDateMs = options?.startDate ? new Date(options.startDate).getTime() : 0
  const endDateMs = options?.endDate ? new Date(options.endDate).getTime() : undefined

  // Pre-fetch offsets if needed
  const partitionsToSeek: Record<number, string> = {}
  
  if (readMode === 'last_n' && options?.startOffset) {
    const admin = kafka.admin()
    try {
      await admin.connect()
      const offsets = await admin.fetchTopicOffsets(topic)
      for (const item of offsets) {
        const high = BigInt(item.high)
        const start = high - BigInt(options.startOffset)
        partitionsToSeek[item.partition] = (start > 0n ? start : 0n).toString()
      }
    } catch (err) {
      console.warn('Failed to fetch topic offsets for seek:', err)
    } finally {
      try { await admin.disconnect() } catch {}
    }
  } else if (readMode === 'time_range' && startDateMs > 0) {
    // ... (keep existing time_range logic, maybe add logs if needed later)
    const admin = kafka.admin()
    try {
      await admin.connect()
      const offsets = await admin.fetchTopicOffsetsByTimestamp(topic, startDateMs)
      for (const item of offsets) {
        if (item.offset) {
          partitionsToSeek[item.partition] = item.offset
        }
      }
    } catch (err) {
      console.warn('Failed to fetch timestamp offsets:', err)
    } finally {
      try { await admin.disconnect() } catch {}
    }
  }

  try {
    await consumer.connect()
    
    // Determine initial subscription mode
    const fromBeginning = readMode === 'earliest'
    await consumer.subscribe({ topic, fromBeginning })

    let resolvePromise: () => void
    let timeoutId: ReturnType<typeof setTimeout>
    let isSeeking = Object.keys(partitionsToSeek).length > 0

    // Handle seeking on join
    if (isSeeking) {
      consumer.on(consumer.events.GROUP_JOIN, ({ payload }) => {
        // We need to verify we are assigned the partitions we want to seek
        // But seek() works on currently assigned partitions.
        // We can just try to seek all we calculated.
        for (const [partitionStr, offset] of Object.entries(partitionsToSeek)) {
           const p = Number(partitionStr)
           try {
             consumer.seek({ topic, partition: p, offset })
           } catch (e) {
             // Ignore if not assigned
           }
        }
      })
    }

    const consumePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve

      timeoutId = setTimeout(() => {
        resolve()
      }, timeout)
    })

    await consumer.run({
      eachMessage: async ({ topic: msgTopic, partition, message }: EachMessagePayload) => {
        // Date filtering (End Date)
        const msgTime = Number(message.timestamp)
        if (endDateMs !== undefined && msgTime > endDateMs) {
            // We reached the end date. 
            // Ideally we should stop consuming from this partition, but for now we just skip.
            // If all partitions pass end date, we could stop, but that's complex to track.
            return
        }

        // Search Pattern Filtering
        const valueStr = message.value?.toString() || ''
        if (options?.searchPatterns && options.searchPatterns.length > 0) {
            const hasMatch = options.searchPatterns.some(pattern => 
                valueStr.toLowerCase().includes(pattern.toLowerCase())
            )
            if (!hasMatch) return
        }

        let parsedValue: unknown
        try {
          parsedValue = JSON.parse(valueStr)
        } catch {
          parsedValue = valueStr
        }

        // Apply condition filter if specified
        if (condition && !evaluateCondition(condition, parsedValue)) {
          return
        }

        const headers: Record<string, string> = {}
        if (message.headers) {
          for (const [key, val] of Object.entries(message.headers)) {
            headers[key] = val?.toString() || ''
          }
        }

        messages.push({
          key: message.key?.toString() || null,
          value: parsedValue,
          headers,
          partition,
          offset: message.offset,
          timestamp: message.timestamp,
          topic: msgTopic,
        })

        if (messages.length >= maxMessages) {
          clearTimeout(timeoutId)
          resolvePromise()
        }
      },
    })

    await consumePromise
    await consumer.stop()

    return {
      topic,
      groupId,
      messageCount: messages.length,
      messages,
    }
  } finally {
    await consumer.disconnect()
  }
}
