import type { KafkaConsumeParams, KafkaConsumeResponse } from '@/tools/kafka/types'
import type { ToolConfig } from '@/tools/types'

export const consumeTool: ToolConfig<KafkaConsumeParams, KafkaConsumeResponse> = {
  id: 'kafka_consume',
  name: 'Kafka Consume',
  description: 'Consume messages from a Kafka topic with optional value-based filtering',
  version: '1.0',

  params: {
    brokers: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description:
        'Comma-separated list of Kafka broker addresses (e.g., localhost:9092,localhost:9093)',
    },
    clientId: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Client identifier for this consumer',
    },
    ssl: {
      type: 'boolean',
      required: false,
      visibility: 'user-only',
      description: 'Enable SSL/TLS connection',
    },
    saslMechanism: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'SASL authentication mechanism (plain, scram-sha-256, scram-sha-512)',
    },
    saslUsername: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'SASL username for authentication',
    },
    saslPassword: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'SASL password for authentication',
    },
    topic: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Topic to consume messages from',
    },
    groupId: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Consumer group ID',
    },
    fromBeginning: {
      type: 'boolean',
      required: false,
      visibility: 'user-only',
      description: 'Start consuming from the beginning of the topic',
    },
    maxMessages: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Maximum number of messages to consume (default: 100)',
    },
    timeout: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Timeout in milliseconds to wait for messages (default: 5000)',
    },
    condition: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'JavaScript condition expression to filter messages (e.g., "value.status === \'error\'" or "value.amount > 100")',
    },
  },

  request: {
    url: '/api/tools/kafka/consume',
    method: 'POST',
    headers: () => ({ 'Content-Type': 'application/json' }),
    body: (params) => ({
      brokers: params.brokers,
      clientId: params.clientId,
      ssl: params.ssl,
      saslMechanism: params.saslMechanism,
      saslUsername: params.saslUsername,
      saslPassword: params.saslPassword,
      topic: params.topic,
      groupId: params.groupId,
      fromBeginning: params.fromBeginning,
      maxMessages: params.maxMessages,
      timeout: params.timeout,
      condition: params.condition,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Kafka consume failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Messages consumed successfully',
        topic: data.topic,
        groupId: data.groupId,
        messageCount: data.messageCount,
        messages: data.messages,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    topic: { type: 'string', description: 'Topic messages were consumed from' },
    groupId: { type: 'string', description: 'Consumer group ID' },
    messageCount: { type: 'number', description: 'Number of messages consumed' },
    messages: { type: 'array', description: 'Array of consumed messages' },
  },
}
