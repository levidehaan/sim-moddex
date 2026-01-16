import type { ToolResponse } from '@/tools/types'

/**
 * Kafka connection configuration
 */
export interface KafkaConnectionConfig {
  brokers: string // Comma-separated list of broker addresses
  clientId?: string
  ssl?: boolean
  saslMechanism?: 'plain' | 'scram-sha-256' | 'scram-sha-512' | null
  saslUsername?: string | null
  saslPassword?: string | null
}

/**
 * Kafka message structure for producing
 */
export interface KafkaMessage {
  key?: string | null
  value: string | Record<string, unknown>
  headers?: Record<string, string>
  partition?: number
}

/**
 * Kafka produce message parameters
 */
export interface KafkaProduceParams extends KafkaConnectionConfig {
  topic: string
  messages: KafkaMessage[]
  acks?: -1 | 0 | 1
  timeout?: number
}

/**
 * Field extraction configuration
 */
export interface FieldExtraction {
  name: string
  path: string
}

/**
 * Transformation configuration
 */
export interface Transformation {
  field: string
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'uppercase' | 'lowercase' | 'trim' | 'substring'
  value?: number | string
  start?: number
  end?: number
}

/**
 * Aggregation configuration
 */
export interface Aggregation {
  field: string
  operation: 'sum' | 'avg' | 'min' | 'max' | 'count'
}

/**
 * Read mode for consumption
 */
export type ReadMode = 'latest' | 'earliest' | 'last_n' | 'time_range'

/**
 * Kafka consume message parameters
 */
export interface KafkaConsumeParams extends KafkaConnectionConfig {
  topic: string
  groupId: string
  fromBeginning?: boolean // Legacy support, mapped to 'earliest'
  readMode?: ReadMode
  startOffset?: number // For last_n
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  searchPatterns?: string[] // Keywords to search for
  maxMessages?: number
  timeout?: number
  /** Optional condition expression to filter messages by value */
  condition?: string | null
  /** Fields to extract from messages */
  extractFields?: FieldExtraction[]
  /** Transformations to apply to extracted fields */
  transformations?: Transformation[]
  /** Aggregations to compute across messages */
  aggregations?: Aggregation[]
}

/**
 * Base response for Kafka operations
 */
export interface KafkaBaseResponse extends ToolResponse {
  output: {
    message: string
    [key: string]: unknown
  }
  error?: string
}

/**
 * Response from producing messages
 */
export interface KafkaProduceResponse extends KafkaBaseResponse {
  output: {
    message: string
    topic: string
    messageCount: number
    offsets?: Array<{
      partition: number
      offset: string
    }>
  }
}

/**
 * Consumed message structure
 */
export interface KafkaConsumedMessage {
  key: string | null
  value: unknown
  headers: Record<string, string>
  partition: number
  offset: string
  timestamp: string
  topic: string
}

/**
 * Response from consuming messages
 */
export interface KafkaConsumeResponse extends KafkaBaseResponse {
  output: {
    message: string
    topic: string
    groupId: string
    messageCount: number
    messages: KafkaConsumedMessage[]
    extractedData?: Record<string, unknown>[]
    aggregations?: Record<string, number>
  }
}
