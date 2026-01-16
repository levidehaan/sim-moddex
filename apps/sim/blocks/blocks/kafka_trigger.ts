import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Radio } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const KafkaTriggerIcon = (props: SVGProps<SVGSVGElement>) => createElement(Radio, props)

export const KafkaTriggerBlock: BlockConfig = {
  type: 'kafka_trigger',
  name: 'Kafka Trigger',
  description: 'Trigger workflow on new Kafka messages',
  longDescription:
    'Monitor a Kafka topic and trigger the workflow when new messages arrive. Supports buffering and content filtering.',
  authMode: AuthMode.None,
  category: 'triggers',
  bgColor: '#E91E63',
  icon: KafkaTriggerIcon,
  subBlocks: [
    {
      id: 'brokers',
      title: 'Brokers',
      type: 'short-input',
      placeholder: 'localhost:9092',
      required: true,
    },
    {
      id: 'topic',
      title: 'Topic',
      type: 'short-input',
      placeholder: 'my-topic',
      required: true,
    },
    {
      id: 'groupId',
      title: 'Consumer Group ID',
      type: 'short-input',
      placeholder: 'sim-trigger-group',
      required: true,
    },
    {
      id: 'checkInterval',
      title: 'Check Interval (seconds)',
      type: 'short-input',
      placeholder: '60',
      value: () => '60',
    },
    {
      id: 'bufferSize',
      title: 'Buffer Size (N Messages)',
      type: 'short-input',
      placeholder: '1',
      description: 'Trigger only after N messages are available',
      value: () => '1',
    },
    {
      id: 'filterField',
      title: 'Filter: JSON Path',
      type: 'short-input',
      placeholder: 'e.g. data.status',
      description: 'Optional: Dot-notation path to field in JSON message',
    },
    {
      id: 'filterOperator',
      title: 'Filter: Operator',
      type: 'dropdown',
      options: [
        { label: 'Equals', id: 'eq' },
        { label: 'Not Equals', id: 'neq' },
        { label: 'Contains', id: 'contains' },
        { label: 'Greater Than', id: 'gt' },
        { label: 'Less Than', id: 'lt' },
      ],
      condition: {
        field: 'filterField',
        value: '',
        not: true
      }
    },
    {
      id: 'filterValue',
      title: 'Filter: Value',
      type: 'short-input',
      placeholder: 'Value to match',
      condition: {
        field: 'filterField',
        value: '',
        not: true
      }
    },
    // Discovery
    {
      id: 'fetchSchema',
      title: 'Fetch Latest Message Schema',
      type: 'switch',
      description: 'Turn on to fetch the latest message and explore structure in outputs'
    },
    // Auth
    {
      id: 'ssl',
      title: 'Use SSL?',
      type: 'switch',
      value: () => false,
    },
    {
      id: 'saslMechanism',
      title: 'SASL Mechanism',
      type: 'dropdown',
      options: [
        { label: 'None', id: '' },
        { label: 'Plain', id: 'plain' },
        { label: 'Scram-Sha-256', id: 'scram-sha-256' },
        { label: 'Scram-Sha-512', id: 'scram-sha-512' },
      ],
      value: () => '',
    },
    {
      id: 'saslUsername',
      title: 'SASL Username',
      type: 'short-input',
      condition: { field: 'saslMechanism', value: ['', null, undefined], not: true },
    },
    {
      id: 'saslPassword',
      title: 'SASL Password',
      type: 'short-input',
      password: true,
      condition: { field: 'saslMechanism', value: ['', null, undefined], not: true },
    },
  ],
  tools: {
    // We can add a discovery tool here if we want the backend to support it
    access: ['kafka_consume_latest'],
  },
  inputs: {
    brokers: { type: 'string' },
    topic: { type: 'string' },
    groupId: { type: 'string' },
    checkInterval: { type: 'number' },
    bufferSize: { type: 'number' },
    filterField: { type: 'string' },
    filterOperator: { type: 'string' },
    filterValue: { type: 'any' },
    fetchSchema: { type: 'boolean' },
    ssl: { type: 'boolean' },
    saslMechanism: { type: 'string' },
    saslUsername: { type: 'string' },
    saslPassword: { type: 'string' },
  },
  outputs: {
    triggered: { type: 'boolean', description: 'True if messages were found' },
    count: { type: 'number', description: 'Number of new messages' },
    messages: { type: 'array', description: 'List of message objects' },
    latestSchema: { type: 'json', description: 'Schema of the latest message (if fetch enabled)' },
  },
  triggers: {
    enabled: true,
    available: ['schedule'], // It uses schedule machinery
  },
}
