import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Radar } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const ScannerIcon = (props: SVGProps<SVGSVGElement>) => createElement(Radar, props)

export const AlpacaScannerBlock: BlockConfig = {
  type: 'alpaca_scanner',
  name: 'Alpaca Scanner',
  description: 'Scan markets for trading opportunities',
  longDescription:
    'Scan the market for stocks and options that meet specific criteria. Filter by price, volume, percentage change, technical indicators, and more. Perfect for finding trading opportunities automatically.',
  docsLink: 'https://docs.alpaca.markets/',
  authMode: AuthMode.ApiKey,
  category: 'tools',
  bgColor: '#9C27B0',
  icon: ScannerIcon,
  subBlocks: [
    {
      id: 'scanType',
      title: 'Scan Type',
      type: 'dropdown',
      options: [
        { label: 'Stock Scanner', id: 'stock' },
        { label: 'Option Scanner', id: 'option' },
      ],
      value: () => 'stock',
    },
    {
      id: 'symbols',
      title: 'Symbols (comma-separated)',
      type: 'short-input',
      placeholder: 'e.g., AAPL,MSFT,GOOGL or leave empty for all',
      condition: {
        field: 'scanType',
        value: ['stock'],
      },
    },
    {
      id: 'underlyingSymbols',
      title: 'Underlying Symbols',
      type: 'short-input',
      placeholder: 'e.g., AAPL,MSFT,GOOGL',
      condition: {
        field: 'scanType',
        value: ['option'],
      },
    },
    {
      id: 'minPrice',
      title: 'Min Price',
      type: 'short-input',
      placeholder: 'Minimum price',
    },
    {
      id: 'maxPrice',
      title: 'Max Price',
      type: 'short-input',
      placeholder: 'Maximum price',
    },
    {
      id: 'minVolume',
      title: 'Min Volume',
      type: 'short-input',
      placeholder: 'Minimum volume',
    },
    {
      id: 'minPercentChange',
      title: 'Min % Change',
      type: 'short-input',
      placeholder: 'e.g., 5 for 5%',
    },
    {
      id: 'maxPercentChange',
      title: 'Max % Change',
      type: 'short-input',
      placeholder: 'e.g., -5 for -5%',
    },
    {
      id: 'optionType',
      title: 'Option Type',
      type: 'dropdown',
      options: [
        { label: 'All', id: 'all' },
        { label: 'Calls', id: 'call' },
        { label: 'Puts', id: 'put' },
      ],
      condition: {
        field: 'scanType',
        value: ['option'],
      },
    },
    {
      id: 'expirationDateGte',
      title: 'Min Expiration Date',
      type: 'short-input',
      placeholder: 'YYYY-MM-DD',
      condition: {
        field: 'scanType',
        value: ['option'],
      },
    },
    {
      id: 'expirationDateLte',
      title: 'Max Expiration Date',
      type: 'short-input',
      placeholder: 'YYYY-MM-DD',
      condition: {
        field: 'scanType',
        value: ['option'],
      },
    },
    {
      id: 'minStrike',
      title: 'Min Strike Price',
      type: 'short-input',
      placeholder: 'Minimum strike',
      condition: {
        field: 'scanType',
        value: ['option'],
      },
    },
    {
      id: 'maxStrike',
      title: 'Max Strike Price',
      type: 'short-input',
      placeholder: 'Maximum strike',
      condition: {
        field: 'scanType',
        value: ['option'],
      },
    },
    {
      id: 'limit',
      title: 'Max Results',
      type: 'short-input',
      placeholder: '100',
      value: () => '100',
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
    access: ['alpaca_scanner_execute'],
  },
  inputs: {
    scanType: { type: 'string', description: 'Type of scan to perform' },
    symbols: { type: 'string', description: 'Stock symbols to scan' },
    underlyingSymbols: { type: 'string', description: 'Underlying symbols for options' },
    minPrice: { type: 'number', description: 'Minimum price filter' },
    maxPrice: { type: 'number', description: 'Maximum price filter' },
    minVolume: { type: 'number', description: 'Minimum volume filter' },
    minPercentChange: { type: 'number', description: 'Minimum percentage change' },
    maxPercentChange: { type: 'number', description: 'Maximum percentage change' },
    optionType: { type: 'string', description: 'Option type filter' },
    expirationDateGte: { type: 'string', description: 'Minimum expiration date' },
    expirationDateLte: { type: 'string', description: 'Maximum expiration date' },
    minStrike: { type: 'number', description: 'Minimum strike price' },
    maxStrike: { type: 'number', description: 'Maximum strike price' },
    limit: { type: 'number', description: 'Maximum results to return' },
    apiKey: { type: 'string', description: 'Alpaca API Key ID' },
    apiSecret: { type: 'string', description: 'Alpaca API Secret Key' },
  },
  outputs: {
    results: { type: 'json', description: 'Scan results matching criteria' },
    count: { type: 'number', description: 'Number of results found' },
  },
}
