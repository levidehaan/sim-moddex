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
      id: 'readMode',
      title: 'Read Mode',
      type: 'dropdown',
      options: [
        { label: 'New Messages Only (Latest)', id: 'latest' },
        { label: 'From Beginning (Earliest)', id: 'earliest' },
        { label: 'Last N Messages', id: 'last_n' },
        { label: 'Time Range', id: 'time_range' },
      ],
      defaultValue: 'latest',
      description: 'Where to start consuming messages from',
      condition: { field: 'operation', value: 'consume' },
      required: true,
    },
    {
      id: 'startOffset',
      title: 'Last N Messages',
      type: 'short-input',
      placeholder: '10',
      description: 'Number of recent messages to read per partition',
      condition: { field: 'readMode', value: 'last_n' },
      required: true,
    },
    {
      id: 'startDate',
      title: 'Start Date (ISO)',
      type: 'short-input',
      placeholder: '2024-01-01T00:00:00Z',
      description: 'Start consuming from this date',
      condition: { field: 'readMode', value: 'time_range' },
      required: true,
    },
    {
      id: 'endDate',
      title: 'End Date (ISO)',
      type: 'short-input',
      placeholder: '2024-01-02T00:00:00Z',
      description: 'Stop consuming at this date (optional)',
      condition: { field: 'readMode', value: 'time_range' },
      required: false,
    },
    {
      id: 'searchPatterns',
      title: 'Search Keywords',
      type: 'short-input',
      placeholder: 'error, critical, payment',
      description: 'Comma-separated keywords to filter messages (case-insensitive)',
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
    {
      id: 'extractFields',
      title: 'Extract Fields',
      type: 'code',
      placeholder: '[{"name": "userId", "path": "value.user.id"}, {"name": "amount", "path": "value.transaction.amount"}]',
      description: 'JSON array of fields to extract from messages. Each field has a name and JSONPath.',
      condition: { field: 'operation', value: 'consume' },
      required: false,
    },
    {
      id: 'transformations',
      title: 'Transformations',
      type: 'code',
      placeholder: '[{"field": "amount", "operation": "multiply", "value": 1.1}, {"field": "name", "operation": "uppercase"}]',
      description: 'JSON array of transformations to apply to extracted fields (math: add, subtract, multiply, divide; text: uppercase, lowercase, trim, substring)',
      condition: { field: 'operation', value: 'consume' },
      required: false,
    },
    {
      id: 'aggregations',
      title: 'Aggregations',
      type: 'code',
      placeholder: '[{"field": "amount", "operation": "sum"}, {"field": "amount", "operation": "avg"}]',
      description: 'JSON array of aggregations to compute across all messages (sum, avg, min, max, count)',
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
          extractFields,
          transformations,
          aggregations,
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
          if (params.readMode) result.readMode = params.readMode
          if (params.startOffset) result.startOffset = Number.parseInt(params.startOffset as string, 10)
          if (params.startDate) result.startDate = params.startDate
          if (params.endDate) result.endDate = params.endDate
          if (params.searchPatterns) {
             const patterns = (params.searchPatterns as string).split(',').map(s => s.trim()).filter(s => s.length > 0)
             if (patterns.length > 0) result.searchPatterns = patterns
          }

          if (maxMessages !== undefined)
            result.maxMessages = Number.parseInt(maxMessages as string, 10)
          if (timeout !== undefined) result.timeout = Number.parseInt(timeout as string, 10)
          if (condition) result.condition = condition
          
          const parsedExtractFields = parseJson(extractFields, 'extractFields')
          if (parsedExtractFields !== undefined) result.extractFields = parsedExtractFields
          
          const parsedTransformations = parseJson(transformations, 'transformations')
          if (parsedTransformations !== undefined) result.transformations = parsedTransformations
          
          const parsedAggregations = parseJson(aggregations, 'aggregations')
          if (parsedAggregations !== undefined) result.aggregations = parsedAggregations
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
    groupId: { type: 'string', description: 'Consumer group ID' },
    // fromBeginning removed from inputs block as it is simulated by readMode
    maxMessages: { type: 'number', description: 'Maximum messages to consume' },
    timeout: { type: 'number', description: 'Timeout in milliseconds' },
    readMode: { type: 'string', description: 'Consumption mode (latest, earliest, last_n, time_range)' },
    startOffset: { type: 'number', description: 'Number of messages to read from end' },
    startDate: { type: 'string', description: 'Start date for time range consumption' },
    endDate: { type: 'string', description: 'End date for time range consumption' },
    searchPatterns: { type: 'string', description: 'Keywords to filter messages' },
    condition: { type: 'string', description: 'JavaScript filter expression for messages' },
    extractFields: { type: 'json', description: 'Fields to extract from messages' },
    transformations: { type: 'json', description: 'Transformations to apply to extracted fields' },
    aggregations: { type: 'json', description: 'Aggregations to compute across messages' },
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
    extractedData: {
      type: 'array',
      description: 'Extracted and transformed fields from messages',
    },
    aggregations: {
      type: 'json',
      description: 'Computed aggregations across all messages',
    },
    groupId: {
      type: 'string',
      description: 'Consumer group ID (consume operation)',
    },
  },
}
