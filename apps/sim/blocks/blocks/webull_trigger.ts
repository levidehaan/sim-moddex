import { createElement } from 'react'
import type { SVGProps } from 'react'
import { TrendingUp } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const WebullTriggerIcon = (props: SVGProps<SVGSVGElement>) => createElement(TrendingUp, props)

export const WebullTriggerBlock: BlockConfig = {
  type: 'webull_trigger',
  name: 'Webull Price Trigger',
  description: 'Monitor stock/option prices and trigger workflows',
  longDescription:
    'Monitor Webull stock and option prices in real-time. Trigger workflows when price conditions are met, such as crossing thresholds, percentage changes, or specific option strike prices.',
  docsLink: 'https://developer.webull.com/api-doc/',
  authMode: AuthMode.ApiKey,
  category: 'triggers',
  bgColor: '#1E88E5',
  icon: WebullTriggerIcon,
  subBlocks: [
    {
      id: 'monitorType',
      title: 'Monitor Type',
      type: 'dropdown',
      options: [
        { label: 'Stock Price', id: 'stock' },
        { label: 'Option Price', id: 'option' },
      ],
      value: () => 'stock',
    },
    {
      id: 'symbol',
      title: 'Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL',
      required: true,
    },
    {
      id: 'condition',
      title: 'Trigger Condition',
      type: 'dropdown',
      options: [
        { label: 'Price Above', id: 'above' },
        { label: 'Price Below', id: 'below' },
        { label: 'Price Equals', id: 'equals' },
        { label: 'Percentage Change Above', id: 'pct_above' },
        { label: 'Percentage Change Below', id: 'pct_below' },
      ],
      required: true,
    },
    {
      id: 'targetPrice',
      title: 'Target Price',
      type: 'short-input',
      placeholder: 'e.g., 150.00',
      condition: {
        field: 'condition',
        value: ['above', 'below', 'equals'],
      },
    },
    {
      id: 'targetPercentage',
      title: 'Target Percentage',
      type: 'short-input',
      placeholder: 'e.g., 5 for 5%',
      condition: {
        field: 'condition',
        value: ['pct_above', 'pct_below'],
      },
    },
    {
      id: 'checkInterval',
      title: 'Check Interval (seconds)',
      type: 'short-input',
      placeholder: '60',
      value: () => '60',
    },
    {
      id: 'accessToken',
      title: 'Access Token',
      type: 'short-input',
      placeholder: 'Your Webull OAuth access token',
      password: true,
      required: true,
    },
    {
      id: 'deviceId',
      title: 'Device ID',
      type: 'short-input',
      placeholder: 'Your Webull device ID',
      required: true,
    },
  ],
  tools: {
    access: ['webull_price_monitor'],
  },
  inputs: {
    monitorType: { type: 'string', description: 'Type of asset to monitor' },
    symbol: { type: 'string', description: 'Stock symbol' },
    condition: { type: 'string', description: 'Trigger condition' },
    targetPrice: { type: 'number', description: 'Target price threshold' },
    targetPercentage: { type: 'number', description: 'Target percentage change' },
    checkInterval: { type: 'number', description: 'Check interval in seconds' },
    accessToken: { type: 'string', description: 'Webull OAuth access token' },
    deviceId: { type: 'string', description: 'Webull device ID' },
  },
  outputs: {
    triggered: { type: 'boolean', description: 'Whether condition was met' },
    currentPrice: { type: 'number', description: 'Current price when triggered' },
    symbol: { type: 'string', description: 'Symbol that triggered' },
    timestamp: { type: 'string', description: 'Trigger timestamp' },
  },
}
