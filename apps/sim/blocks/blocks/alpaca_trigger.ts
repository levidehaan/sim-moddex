import { createElement } from 'react'
import type { SVGProps } from 'react'
import { TrendingUp } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const AlpacaTriggerIcon = (props: SVGProps<SVGSVGElement>) => createElement(TrendingUp, props)

export const AlpacaTriggerBlock: BlockConfig = {
  type: 'alpaca_trigger',
  name: 'Alpaca Price Trigger',
  description: 'Monitor stock/option prices and trigger workflows',
  longDescription:
    'Monitor Alpaca stock and option prices in real-time. Trigger workflows when price conditions are met, such as crossing thresholds, percentage changes, or specific option strike prices.',
  docsLink: 'https://docs.alpaca.markets/',
  authMode: AuthMode.ApiKey,
  category: 'triggers',
  bgColor: '#FFCC00',
  icon: AlpacaTriggerIcon,
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
      condition: {
        field: 'monitorType',
        value: ['stock'],
      },
    },
    {
      id: 'optionSymbol',
      title: 'Option Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL240119C00150000',
      required: true,
      condition: {
        field: 'monitorType',
        value: ['option'],
      },
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
      id: 'apiKey',
      title: 'API Key ID',
      type: 'short-input',
      placeholder: 'Your Alpaca API Key ID',
      password: true,
      required: true,
    },
    {
      id: 'apiSecret',
      title: 'API Secret',
      type: 'short-input',
      placeholder: 'Your Alpaca API Secret Key',
      password: true,
      required: true,
    },
  ],
  tools: {
    access: ['alpaca_price_monitor'],
  },
  inputs: {
    monitorType: { type: 'string', description: 'Type of asset to monitor' },
    symbol: { type: 'string', description: 'Stock symbol' },
    optionSymbol: { type: 'string', description: 'Option symbol' },
    condition: { type: 'string', description: 'Trigger condition' },
    targetPrice: { type: 'number', description: 'Target price threshold' },
    targetPercentage: { type: 'number', description: 'Target percentage change' },
    checkInterval: { type: 'number', description: 'Check interval in seconds' },
    apiKey: { type: 'string', description: 'Alpaca API Key ID' },
    apiSecret: { type: 'string', description: 'Alpaca API Secret Key' },
  },
  outputs: {
    triggered: { type: 'boolean', description: 'Whether condition was met' },
    currentPrice: { type: 'number', description: 'Current price when triggered' },
    symbol: { type: 'string', description: 'Symbol that triggered' },
    timestamp: { type: 'string', description: 'Trigger timestamp' },
  },
}
