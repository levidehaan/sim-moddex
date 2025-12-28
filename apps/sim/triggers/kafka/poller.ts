import { createLogger } from '@sim/logger'
import { KafkaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'

const logger = createLogger('KafkaPollingTrigger')

export const kafkaPollingTrigger: TriggerConfig = {
  id: 'kafka_poller',
  name: 'Kafka Message Trigger',
  provider: 'kafka',
  description:
    'Triggers when new messages are received from a Kafka topic with optional value-based filtering',
  version: '1.0.0',
  icon: KafkaIcon,

  subBlocks: [
    {
      id: 'brokers',
      title: 'Kafka Brokers',
      type: 'short-input',
      placeholder: 'localhost:9092,localhost:9093',
      description: 'Comma-separated list of Kafka broker addresses',
      required: true,
      mode: 'trigger',
    },
    {
      id: 'clientId',
      title: 'Client ID',
      type: 'short-input',
      placeholder: 'sim-kafka-trigger',
      description: 'Client identifier',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'ssl',
      title: 'Enable SSL',
      type: 'switch',
      defaultValue: false,
      description: 'Enable SSL/TLS connection',
      required: false,
      mode: 'trigger',
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
      mode: 'trigger',
    },
    {
      id: 'saslUsername',
      title: 'SASL Username',
      type: 'short-input',
      placeholder: 'username',
      condition: { field: 'saslMechanism', value: ['plain', 'scram-sha-256', 'scram-sha-512'] },
      required: false,
      mode: 'trigger',
    },
    {
      id: 'saslPassword',
      title: 'SASL Password',
      type: 'short-input',
      placeholder: 'password',
      password: true,
      condition: { field: 'saslMechanism', value: ['plain', 'scram-sha-256', 'scram-sha-512'] },
      required: false,
      mode: 'trigger',
    },
    {
      id: 'topic',
      title: 'Topic',
      type: 'short-input',
      placeholder: 'my-topic',
      description: 'Kafka topic to consume from',
      required: true,
      mode: 'trigger',
    },
    {
      id: 'groupId',
      title: 'Consumer Group ID',
      type: 'short-input',
      placeholder: 'sim-trigger-group',
      description: 'Consumer group identifier for this trigger',
      required: true,
      mode: 'trigger',
    },
    {
      id: 'fromBeginning',
      title: 'From Beginning',
      type: 'switch',
      defaultValue: false,
      description: 'Start consuming from the beginning of the topic on first run',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'condition',
      title: 'Filter Condition',
      type: 'long-input',
      placeholder: 'value.eventType === "order_placed" && value.amount > 100',
      description:
        'JavaScript expression to filter messages. Only messages matching this condition will trigger the workflow. Use "value" to access message content (e.g., "value.status === \'error\'" or "value.userId !== null").',
      required: false,
      mode: 'trigger',
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      hideFromPreview: true,
      type: 'text',
      defaultValue: [
        'Enter your Kafka broker addresses (comma-separated)',
        'Specify the topic to consume from and a unique consumer group ID',
        'Optionally add a filter condition to only trigger on specific message values',
        'The system will poll for new messages and trigger your workflow when conditions match',
      ]
        .map(
          (instruction, index) =>
            `<div class="mb-3"><strong>${index + 1}.</strong> ${instruction}</div>`
        )
        .join(''),
      mode: 'trigger',
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'kafka_poller',
    },
  ],

  outputs: {
    message: {
      key: {
        type: 'string',
        description: 'Message key (if set)',
      },
      value: {
        type: 'object',
        description: 'Message value/payload (parsed JSON or raw string)',
      },
      headers: {
        type: 'object',
        description: 'Message headers',
      },
      partition: {
        type: 'number',
        description: 'Kafka partition number',
      },
      offset: {
        type: 'string',
        description: 'Message offset in the partition',
      },
      timestamp: {
        type: 'string',
        description: 'Message timestamp',
      },
      topic: {
        type: 'string',
        description: 'Topic the message was consumed from',
      },
    },
    metadata: {
      messageCount: {
        type: 'number',
        description: 'Total number of messages consumed in this batch',
      },
      groupId: {
        type: 'string',
        description: 'Consumer group ID',
      },
    },
    timestamp: {
      type: 'string',
      description: 'Event trigger timestamp',
    },
  },
}
