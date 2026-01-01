import {
  type EachMessagePayload,
  Kafka,
  type KafkaConfig,
  logLevel,
  type SASLOptions,
} from 'kafkajs'
import type { KafkaConnectionConfig, KafkaConsumedMessage, KafkaMessage } from '@/tools/kafka/types'

/**
 * Creates a Kafka client with the given configuration
 */
export function createKafkaClient(config: KafkaConnectionConfig): Kafka {
  const brokerList = config.brokers.split(',').map((b) => b.trim())

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
 * Consume messages from a Kafka topic with optional condition filtering
 */
export async function consumeMessages(
  kafka: Kafka,
  topic: string,
  groupId: string,
  options?: {
    fromBeginning?: boolean
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

  try {
    await consumer.connect()
    await consumer.subscribe({ topic, fromBeginning: options?.fromBeginning ?? false })

    let resolvePromise: () => void
    let timeoutId: ReturnType<typeof setTimeout>

    const consumePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve

      timeoutId = setTimeout(() => {
        resolve()
      }, timeout)
    })

    await consumer.run({
      eachMessage: async ({ topic: msgTopic, partition, message }: EachMessagePayload) => {
        const valueStr = message.value?.toString() || ''
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
