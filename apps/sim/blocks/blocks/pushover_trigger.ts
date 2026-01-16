import { createElement } from 'react'
import type { SVGProps } from 'react'
import { BellRing } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const PushoverTriggerIcon = (props: SVGProps<SVGSVGElement>) => createElement(BellRing, props)

export const PushoverTriggerBlock: BlockConfig = {
  type: 'pushover_trigger',
  name: 'Pushover Trigger',
  description: 'Trigger workflow on new Pushover messages',
  longDescription:
    'Monitor your Pushover account for new messages and trigger the workflow. Requires an Open Client device registration.',
  authMode: AuthMode.None,
  category: 'triggers',
  bgColor: '#249DF1',
  icon: PushoverTriggerIcon,
  subBlocks: [
    {
      id: 'secret',
      title: 'User Secret',
      type: 'short-input',
      placeholder: 'Your User Secret (from Registration)',
      password: true,
      required: true,
    },
    {
      id: 'deviceId',
      title: 'Device ID',
      type: 'short-input',
      placeholder: 'Your Device ID (from Registration)',
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
       id: 'filterText',
       title: 'Filter: Message Text',
       type: 'short-input',
       placeholder: 'Trigger only if message contains this text',
    },
    {
       id: 'filterTitle',
       title: 'Filter: Message Title',
       type: 'short-input',
       placeholder: 'Trigger only if title contains this text',
    },
    {
       id: 'filterPriority',
       title: 'Filter: Min Priority',
       type: 'dropdown',
       options: [
         { label: 'Any', id: '' },
         { label: 'Low (-1) or higher', id: '-1' },
         { label: 'Normal (0) or higher', id: '0' },
         { label: 'High (1) or higher', id: '1' },
         { label: 'Emergency (2)', id: '2' },
       ]
    }
  ],
  tools: {
    // Helper tool to generate credentials
    access: ['pushover_register_device'],
  },
  inputs: {
    secret: { type: 'string' },
    deviceId: { type: 'string' },
    checkInterval: { type: 'number' },
    filterText: { type: 'string' },
    filterTitle: { type: 'string' },
    filterPriority: { type: 'number' },
  },
  outputs: {
    triggered: { type: 'boolean', description: 'True if messages were found' },
    count: { type: 'number', description: 'Number of new messages' },
    messages: { type: 'array', description: 'List of message objects' },
  },
  triggers: {
    enabled: true,
    available: ['schedule'], // Utilizes the schedule engine
  },
}
