import type { KafkaProduceParams, KafkaProduceResponse } from '@/tools/kafka/types'
import type { ToolConfig } from '@/tools/types'

export const produceTool: ToolConfig<KafkaProduceParams, KafkaProduceResponse> = {
  id: 'kafka_produce',
  name: 'Kafka Produce',
  description: 'Produce messages to a Kafka topic',
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
      description: 'Client identifier for this producer',
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
      description: 'Topic to produce messages to',
    },
    messages: {
      type: 'array',
      required: true,
      visibility: 'user-or-llm',
      description: 'Array of messages to produce',
    },
    acks: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Number of acknowledgments required (-1 = all, 0 = none, 1 = leader)',
    },
    timeout: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Timeout in milliseconds',
    },
  },

  request: {
    url: '/api/tools/kafka/produce',
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
      messages: params.messages,
      acks: params.acks,
      timeout: params.timeout,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Kafka produce failed')
    }

    return {
      success: true,
      output: {
        message: data.message || 'Messages produced successfully',
        topic: data.topic,
        messageCount: data.messageCount,
        offsets: data.offsets,
      },
      error: undefined,
    }
  },

  outputs: {
    message: { type: 'string', description: 'Operation status message' },
    topic: { type: 'string', description: 'Topic messages were produced to' },
    messageCount: { type: 'number', description: 'Number of messages produced' },
    offsets: { type: 'array', description: 'Partition offsets for produced messages' },
  },
}
