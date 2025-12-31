import type { SVGProps } from 'react'
import { createElement } from 'react'
import { TrendingUp } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const AlpacaIcon = (props: SVGProps<SVGSVGElement>) => createElement(TrendingUp, props)

export const AlpacaBlock: BlockConfig = {
  type: 'alpaca',
  name: 'Alpaca',
  description: 'Access stock and options market data from Alpaca Markets',
  longDescription:
    'Integrate Alpaca Markets into the workflow. Get historical and real-time stock bars, quotes, snapshots, options chains, account info, and positions. Supports both JSON and CSV output formats.',
  docsLink: 'https://docs.alpaca.markets/',
  authMode: AuthMode.ApiKey,
  category: 'tools',
  bgColor: '#FFCC00',
  icon: AlpacaIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Stock Bars', id: 'get_stock_bars' },
        { label: 'Get Stock Quotes', id: 'get_stock_quotes' },
        { label: 'Get Stock Snapshot', id: 'get_stock_snapshot' },
        { label: 'Get Option Bars', id: 'get_option_bars' },
        { label: 'Get Option Chain', id: 'get_option_chain' },
        { label: 'Get Account', id: 'get_account' },
        { label: 'Get Positions', id: 'get_positions' },
      ],
      value: () => 'get_stock_bars',
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
    // Stock Bars & Quotes - symbols
    {
      id: 'symbols',
      title: 'Symbols',
      type: 'short-input',
      placeholder: 'e.g., AAPL,MSFT,GOOGL',
      required: true,
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_stock_snapshot'],
      },
    },
    // Option symbols
    {
      id: 'optionSymbols',
      title: 'Option Symbols',
      type: 'short-input',
      placeholder: 'e.g., AAPL240119C00150000',
      required: true,
      condition: { field: 'operation', value: ['get_option_bars'] },
    },
    // Underlying symbol for option chain
    {
      id: 'underlying_symbol',
      title: 'Underlying Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL',
      required: true,
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    // Timeframe for bars
    {
      id: 'timeframe',
      title: 'Timeframe',
      type: 'dropdown',
      options: [
        { label: '1 Minute', id: '1Min' },
        { label: '5 Minutes', id: '5Min' },
        { label: '15 Minutes', id: '15Min' },
        { label: '30 Minutes', id: '30Min' },
        { label: '1 Hour', id: '1Hour' },
        { label: '1 Day', id: '1Day' },
        { label: '1 Week', id: '1Week' },
        { label: '1 Month', id: '1Month' },
      ],
      required: true,
      condition: { field: 'operation', value: ['get_stock_bars', 'get_option_bars'] },
    },
    // Date range
    {
      id: 'start',
      title: 'Start Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-01 or 2024-01-01T00:00:00Z',
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_option_bars'],
      },
    },
    {
      id: 'end',
      title: 'End Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-12-31 or 2024-12-31T23:59:59Z',
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_option_bars'],
      },
    },
    // Limit
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: 'Max results (e.g., 1000)',
      condition: {
        field: 'operation',
        value: [
          'get_stock_bars',
          'get_stock_quotes',
          'get_option_bars',
          'get_option_chain',
        ],
      },
    },
    // Option chain filters
    {
      id: 'expiration_date',
      title: 'Expiration Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-19',
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    {
      id: 'expiration_date_gte',
      title: 'Min Expiration Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-01',
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    {
      id: 'expiration_date_lte',
      title: 'Max Expiration Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-06-30',
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    {
      id: 'strike_price_gte',
      title: 'Min Strike Price',
      type: 'short-input',
      placeholder: 'e.g., 100',
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    {
      id: 'strike_price_lte',
      title: 'Max Strike Price',
      type: 'short-input',
      placeholder: 'e.g., 200',
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    {
      id: 'optionType',
      title: 'Option Type',
      type: 'dropdown',
      options: [
        { label: 'All', id: '' },
        { label: 'Call', id: 'call' },
        { label: 'Put', id: 'put' },
      ],
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    // Stock data options
    {
      id: 'adjustment',
      title: 'Price Adjustment',
      type: 'dropdown',
      options: [
        { label: 'Raw', id: 'raw' },
        { label: 'Split Adjusted', id: 'split' },
        { label: 'Dividend Adjusted', id: 'dividend' },
        { label: 'All Adjustments', id: 'all' },
      ],
      condition: { field: 'operation', value: ['get_stock_bars'] },
    },
    {
      id: 'feed',
      title: 'Data Feed',
      type: 'dropdown',
      options: [
        { label: 'IEX (Free)', id: 'iex' },
        { label: 'SIP (Full)', id: 'sip' },
      ],
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_stock_snapshot'],
      },
    },
    {
      id: 'sort',
      title: 'Sort Order',
      type: 'dropdown',
      options: [
        { label: 'Ascending', id: 'asc' },
        { label: 'Descending', id: 'desc' },
      ],
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_option_bars'],
      },
    },
    // Output format
    {
      id: 'format',
      title: 'Output Format',
      type: 'dropdown',
      options: [
        { label: 'JSON', id: 'json' },
        { label: 'CSV', id: 'csv' },
      ],
      condition: { field: 'operation', value: ['get_stock_bars', 'get_option_bars'] },
    },
    // Paper trading option for account/positions
    {
      id: 'paper',
      title: 'Use Paper Trading',
      type: 'dropdown',
      options: [
        { label: 'No (Live)', id: '' },
        { label: 'Yes (Paper)', id: 'true' },
      ],
      condition: { field: 'operation', value: ['get_account', 'get_positions'] },
    },
  ],
  tools: {
    access: [
      'alpaca_get_stock_bars',
      'alpaca_get_stock_quotes',
      'alpaca_get_stock_snapshot',
      'alpaca_get_option_bars',
      'alpaca_get_option_chain',
      'alpaca_get_account',
      'alpaca_get_positions',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'get_stock_bars':
            return 'alpaca_get_stock_bars'
          case 'get_stock_quotes':
            return 'alpaca_get_stock_quotes'
          case 'get_stock_snapshot':
            return 'alpaca_get_stock_snapshot'
          case 'get_option_bars':
            return 'alpaca_get_option_bars'
          case 'get_option_chain':
            return 'alpaca_get_option_chain'
          case 'get_account':
            return 'alpaca_get_account'
          case 'get_positions':
            return 'alpaca_get_positions'
          default:
            return 'alpaca_get_stock_bars'
        }
      },
      params: (params) => {
        const {
          operation,
          optionSymbols,
          optionType,
          paper,
          limit,
          strike_price_gte,
          strike_price_lte,
          ...rest
        } = params
        const cleanParams: Record<string, any> = {}

        // Map optionSymbols to symbols for option_bars
        if (operation === 'get_option_bars' && optionSymbols) {
          cleanParams.symbols = optionSymbols
        }

        // Map optionType to type for option_chain
        if (operation === 'get_option_chain' && optionType) {
          cleanParams.type = optionType
        }

        // Convert paper to boolean
        if ((operation === 'get_account' || operation === 'get_positions') && paper === 'true') {
          cleanParams.paper = true
        }

        // Convert numeric fields
        if (limit) cleanParams.limit = parseInt(limit, 10)
        if (strike_price_gte) cleanParams.strike_price_gte = parseFloat(strike_price_gte)
        if (strike_price_lte) cleanParams.strike_price_lte = parseFloat(strike_price_lte)

        Object.entries(rest).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanParams[key] = value
          }
        })

        return cleanParams
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'Alpaca API Key ID' },
    apiSecret: { type: 'string', description: 'Alpaca API Secret Key' },
    symbols: { type: 'string', description: 'Comma-separated stock symbols' },
    timeframe: { type: 'string', description: 'Bar timeframe' },
    start: { type: 'string', description: 'Start date/time' },
    end: { type: 'string', description: 'End date/time' },
    limit: { type: 'number', description: 'Maximum results' },
    underlying_symbol: { type: 'string', description: 'Underlying symbol for options' },
    expiration_date: { type: 'string', description: 'Option expiration date' },
    strike_price_gte: { type: 'number', description: 'Minimum strike price' },
    strike_price_lte: { type: 'number', description: 'Maximum strike price' },
    type: { type: 'string', description: 'Option type (call/put)' },
    format: { type: 'string', description: 'Output format (json/csv)' },
    paper: { type: 'boolean', description: 'Use paper trading' },
  },
  outputs: {
    bars: { type: 'json', description: 'Bar data (OHLCV) keyed by symbol' },
    quotes: { type: 'json', description: 'Quote data (bid/ask) keyed by symbol' },
    snapshots: { type: 'json', description: 'Current market snapshots' },
    option_contracts: { type: 'json', description: 'List of option contracts' },
    account: { type: 'json', description: 'Account information' },
    positions: { type: 'json', description: 'Open positions' },
    csv: { type: 'string', description: 'CSV formatted data' },
    next_page_token: { type: 'string', description: 'Pagination token' },
  },
}
