import { KafkaIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { KafkaConsumeResponse, KafkaProduceResponse } from '@/tools/kafka/types'

type KafkaResponse = KafkaProduceResponse | KafkaConsumeResponse

export const KafkaBlock: BlockConfig<KafkaResponse> = {
  type: 'kafka',
  name: 'Apache Kafka',
  description: 'Connect to Apache Kafka',
  longDescription:
    'Integrate Apache Kafka into the workflow. Produce and consume messages from Kafka topics with optional value-based filtering.',
  docsLink: 'https://docs.sim.ai/tools/kafka',
  category: 'tools',
  bgColor: 'linear-gradient(45deg, #231F20 0%, #4A4A4A 100%)',
  icon: KafkaIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Produce Messages', id: 'produce' },
        { label: 'Consume Messages', id: 'consume' },
      ],
      value: () => 'produce',
    },
    {
      id: 'brokers',
      title: 'Kafka Brokers',
      type: 'short-input',
      placeholder: 'localhost:9092,localhost:9093',
      description: 'Comma-separated list of Kafka broker addresses',
      required: true,
    },
    {
      id: 'clientId',
      title: 'Client ID',
      type: 'short-input',
      placeholder: 'sim-kafka-client',
      description: 'Client identifier (optional)',
      required: false,
    },
    {
      id: 'ssl',
      title: 'Enable SSL',
      type: 'switch',
      defaultValue: false,
      description: 'Enable SSL/TLS connection',
      required: false,
    },
    {
      id: 'saslMechanism',
      title: 'SASL Mechanism',
      type: 'dropdown',
      options: [
        { label: 'None', id: '' },
        { label: 'PLAIN', id: 'plain' },
        { label: 'SCRAM-SHA-256', id: 'scram-sha-256' },
        { label: 'SCRAM-SHA-512', id: 'scram-sha-512' },
      ],
      defaultValue: '',
      description: 'SASL authentication mechanism',
      required: false,
    },
    {
      id: 'saslUsername',
      title: 'SASL Username',
      type: 'short-input',
      placeholder: 'username',
      password: false,
      condition: { field: 'saslMechanism', value: ['plain', 'scram-sha-256', 'scram-sha-512'] },
      required: false,
    },
    {
      id: 'saslPassword',
      title: 'SASL Password',
      type: 'short-input',
      placeholder: 'password',
      password: true,
      condition: { field: 'saslMechanism', value: ['plain', 'scram-sha-256', 'scram-sha-512'] },
      required: false,
    },
    {
      id: 'topic',
      title: 'Topic',
      type: 'short-input',
      placeholder: 'my-topic',
      description: 'Kafka topic name',
      required: true,
    },
    // Produce-specific fields
    {
      id: 'messages',
      title: 'Messages (JSON Array)',
      type: 'code',
      placeholder:
        '[\n  {\n    "key": "key1",\n    "value": {"event": "user_created", "userId": "123"}\n  }\n]',
      description: 'Array of messages to produce. Each message can have key, value, and headers.',
      condition: { field: 'operation', value: 'produce' },
      required: true,
    },
    {
      id: 'acks',
      title: 'Acknowledgments',
      type: 'dropdown',
      options: [
        { label: 'All (-1)', id: '-1' },
        { label: 'Leader Only (1)', id: '1' },
        { label: 'None (0)', id: '0' },
      ],
      defaultValue: '-1',
      description: 'Number of acknowledgments required',
      condition: { field: 'operation', value: 'produce' },
      required: false,
    },
    // Consume-specific fields
    {
      id: 'groupId',
      title: 'Consumer Group ID',
      type: 'short-input',
      placeholder: 'my-consumer-group',
      description: 'Consumer group identifier',
      condition: { field: 'operation', value: 'consume' },
      required: true,
    },
    {
      id: 'fromBeginning',
      title: 'From Beginning',
      type: 'switch',
      defaultValue: false,
      description: 'Start consuming from the beginning of the topic',
      condition: { field: 'operation', value: 'consume' },
      required: false,
    },
    {
      id: 'maxMessages',
      title: 'Max Messages',
      type: 'short-input',
      placeholder: '100',
      description: 'Maximum number of messages to consume (default: 100)',
      condition: { field: 'operation', value: 'consume' },
      required: false,
    },
    {
      id: 'timeout',
      title: 'Timeout (ms)',
      type: 'short-input',
      placeholder: '5000',
      description: 'Timeout in milliseconds to wait for messages',
      condition: { field: 'operation', value: 'consume' },
      required: false,
    },
    {
      id: 'condition',
      title: 'Filter Condition',
      type: 'short-input',
      placeholder: 'value.status === "error" || value.amount > 100',
      description:
        'JavaScript expression to filter messages by value (e.g., "value.eventType === \'order_placed\'")',
      condition: { field: 'operation', value: 'consume' },
      required: false,
    },
  ],
  tools: {
    access: ['kafka_produce', 'kafka_consume'],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'produce':
            return 'kafka_produce'
          case 'consume':
            return 'kafka_consume'
          default:
            throw new Error(`Invalid Kafka operation: ${params.operation}`)
        }
      },
      params: (params) => {
        const {
          operation,
          messages,
          acks,
          groupId,
          fromBeginning,
          maxMessages,
          timeout,
          condition,
          saslMechanism,
          ...rest
        } = params

        // Parse JSON fields
        const parseJson = (value: unknown, fieldName: string) => {
          if (!value) return undefined
          if (typeof value === 'object') return value
          if (typeof value === 'string' && value.trim()) {
            try {
              return JSON.parse(value)
            } catch (parseError) {
              const errorMsg =
                parseError instanceof Error ? parseError.message : 'Unknown JSON error'
              throw new Error(`Invalid JSON in ${fieldName}: ${errorMsg}`)
            }
          }
          return undefined
        }

        // Build connection config
        const connectionConfig: Record<string, unknown> = {
          brokers: rest.brokers,
          clientId: rest.clientId,
          ssl: rest.ssl,
        }

        // Only include SASL config if mechanism is set
        if (saslMechanism && saslMechanism !== '') {
          connectionConfig.saslMechanism = saslMechanism
          connectionConfig.saslUsername = rest.saslUsername
          connectionConfig.saslPassword = rest.saslPassword
        }

        const result: Record<string, unknown> = {
          ...connectionConfig,
          topic: rest.topic,
        }

        if (operation === 'produce') {
          const parsedMessages = parseJson(messages, 'messages')
          if (parsedMessages !== undefined) result.messages = parsedMessages
          if (acks !== undefined) result.acks = Number.parseInt(acks as string, 10)
        } else if (operation === 'consume') {
          result.groupId = groupId
          if (fromBeginning !== undefined) result.fromBeginning = fromBeginning
          if (maxMessages !== undefined)
            result.maxMessages = Number.parseInt(maxMessages as string, 10)
          if (timeout !== undefined) result.timeout = Number.parseInt(timeout as string, 10)
          if (condition) result.condition = condition
        }

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Kafka operation to perform (produce/consume)' },
    brokers: { type: 'string', description: 'Comma-separated list of Kafka broker addresses' },
    clientId: { type: 'string', description: 'Client identifier' },
    ssl: { type: 'boolean', description: 'Enable SSL/TLS connection' },
    saslMechanism: { type: 'string', description: 'SASL authentication mechanism' },
    saslUsername: { type: 'string', description: 'SASL username' },
    saslPassword: { type: 'string', description: 'SASL password' },
    topic: { type: 'string', description: 'Kafka topic name' },
    messages: { type: 'json', description: 'Array of messages to produce' },
    acks: { type: 'number', description: 'Acknowledgments required' },
    groupId: { type: 'string', description: 'Consumer group ID' },
    fromBeginning: { type: 'boolean', description: 'Start consuming from beginning' },
    maxMessages: { type: 'number', description: 'Maximum messages to consume' },
    timeout: { type: 'number', description: 'Timeout in milliseconds' },
    condition: { type: 'string', description: 'JavaScript filter expression for messages' },
  },
  outputs: {
    message: {
      type: 'string',
      description: 'Operation status message',
    },
    topic: {
      type: 'string',
      description: 'Kafka topic',
    },
    messageCount: {
      type: 'number',
      description: 'Number of messages produced or consumed',
    },
    offsets: {
      type: 'array',
      description: 'Partition offsets (produce operation)',
    },
    messages: {
      type: 'array',
      description: 'Consumed messages with key, value, headers, partition, offset, and timestamp',
    },
    groupId: {
      type: 'string',
      description: 'Consumer group ID (consume operation)',
    },
  },
}
