import type { SVGProps } from 'react'
import { createElement } from 'react'
import { TrendingUp } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

const AlpacaIcon = (props: SVGProps<SVGSVGElement>) => createElement(TrendingUp, props)

export const AlpacaBlock: BlockConfig = {
  type: 'alpaca',
  name: 'Alpaca',
  description: 'Trade stocks and options with Alpaca Markets',
  longDescription:
    'Full Alpaca Markets integration. Get market data, submit orders (market, limit, stop, trailing stop, bracket, OCO), trade options, manage positions, and access account info. Supports both live and paper trading.',
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
        // Market Data
        { label: '📊 Get Stock Bars', id: 'get_stock_bars' },
        { label: '📊 Get Stock Quotes', id: 'get_stock_quotes' },
        { label: '📊 Get Stock Snapshot', id: 'get_stock_snapshot' },
        { label: '📊 Get Option Bars', id: 'get_option_bars' },
        { label: '📊 Get Option Chain', id: 'get_option_chain' },
        // Account & Positions
        { label: '👤 Get Account', id: 'get_account' },
        { label: '📈 Get All Positions', id: 'get_positions' },
        { label: '📈 Get Position', id: 'get_position' },
        // Stock Orders
        { label: '🛒 Submit Stock Order', id: 'submit_order' },
        { label: '📋 List Orders', id: 'list_orders' },
        { label: '🔍 Get Order', id: 'get_order' },
        { label: '✏️ Replace Order', id: 'replace_order' },
        { label: '❌ Cancel Order', id: 'cancel_order' },
        { label: '❌ Cancel All Orders', id: 'cancel_all_orders' },
        // Options Orders
        { label: '🎯 Submit Option Order', id: 'submit_option_order' },
        { label: '💪 Exercise Option', id: 'exercise_option' },
        // Position Management
        { label: '🚪 Close Position', id: 'close_position' },
        { label: '🚪 Close All Positions', id: 'close_all_positions' },
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
    // Paper trading toggle (for trading operations)
    {
      id: 'paper',
      title: 'Paper Trading',
      type: 'dropdown',
      options: [
        { label: 'Yes (Paper)', id: 'true' },
        { label: 'No (Live)', id: 'false' },
      ],
      value: () => 'true',
      condition: {
        field: 'operation',
        value: [
          'get_account',
          'get_positions',
          'get_position',
          'submit_order',
          'submit_option_order',
          'list_orders',
          'get_order',
          'replace_order',
          'cancel_order',
          'cancel_all_orders',
          'close_position',
          'close_all_positions',
          'exercise_option',
        ],
      },
    },
    // === MARKET DATA FIELDS ===
    // Stock symbols for bars/quotes/snapshot
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
    // Option symbols for bars
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
      placeholder: 'e.g., 2024-01-01',
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_option_bars'],
      },
    },
    {
      id: 'end',
      title: 'End Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-12-31',
      condition: {
        field: 'operation',
        value: ['get_stock_bars', 'get_stock_quotes', 'get_option_bars'],
      },
    },
    // Limit for data queries
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
          'list_orders',
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

    // === ORDER FIELDS ===
    // Symbol for orders
    {
      id: 'symbol',
      title: 'Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL',
      required: true,
      condition: {
        field: 'operation',
        value: ['submit_order', 'get_position', 'close_position'],
      },
    },
    // Option symbol for option orders
    {
      id: 'option_symbol',
      title: 'Option Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL240119C00150000',
      required: true,
      condition: { field: 'operation', value: ['submit_option_order', 'exercise_option'] },
    },
    // Order side
    {
      id: 'side',
      title: 'Side',
      type: 'dropdown',
      options: [
        { label: 'Buy', id: 'buy' },
        { label: 'Sell', id: 'sell' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_order', 'submit_option_order'] },
    },
    // Quantity
    {
      id: 'qty',
      title: 'Quantity',
      type: 'short-input',
      placeholder: 'Number of shares/contracts',
      condition: {
        field: 'operation',
        value: ['submit_order', 'submit_option_order', 'replace_order', 'close_position'],
      },
    },
    // Notional (dollar amount)
    {
      id: 'notional',
      title: 'Dollar Amount',
      type: 'short-input',
      placeholder: 'e.g., 1000 (mutually exclusive with qty)',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Order type
    {
      id: 'order_type',
      title: 'Order Type',
      type: 'dropdown',
      options: [
        { label: 'Market', id: 'market' },
        { label: 'Limit', id: 'limit' },
        { label: 'Stop', id: 'stop' },
        { label: 'Stop Limit', id: 'stop_limit' },
        { label: 'Trailing Stop', id: 'trailing_stop' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Option order type (no trailing stop)
    {
      id: 'option_order_type',
      title: 'Order Type',
      type: 'dropdown',
      options: [
        { label: 'Market', id: 'market' },
        { label: 'Limit', id: 'limit' },
        { label: 'Stop', id: 'stop' },
        { label: 'Stop Limit', id: 'stop_limit' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_option_order'] },
    },
    // Time in force
    {
      id: 'time_in_force',
      title: 'Time in Force',
      type: 'dropdown',
      options: [
        { label: 'Day', id: 'day' },
        { label: 'Good Til Canceled', id: 'gtc' },
        { label: 'Immediate or Cancel', id: 'ioc' },
        { label: 'Fill or Kill', id: 'fok' },
        { label: 'Market Open', id: 'opg' },
        { label: 'Market Close', id: 'cls' },
      ],
      required: true,
      condition: {
        field: 'operation',
        value: ['submit_order', 'submit_option_order', 'replace_order'],
      },
    },
    // Limit price
    {
      id: 'limit_price',
      title: 'Limit Price',
      type: 'short-input',
      placeholder: 'Price for limit orders',
      condition: {
        field: 'operation',
        value: ['submit_order', 'submit_option_order', 'replace_order'],
      },
    },
    // Stop price
    {
      id: 'stop_price',
      title: 'Stop Price',
      type: 'short-input',
      placeholder: 'Trigger price for stop orders',
      condition: {
        field: 'operation',
        value: ['submit_order', 'submit_option_order', 'replace_order'],
      },
    },
    // Trailing stop parameters
    {
      id: 'trail_price',
      title: 'Trail Price ($)',
      type: 'short-input',
      placeholder: 'Dollar offset from high water mark',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    {
      id: 'trail_percent',
      title: 'Trail Percent (%)',
      type: 'short-input',
      placeholder: 'Percent offset (e.g., 5 for 5%)',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Order class for bracket/OCO
    {
      id: 'order_class',
      title: 'Order Class',
      type: 'dropdown',
      options: [
        { label: 'Simple', id: 'simple' },
        { label: 'Bracket (Entry + Take Profit + Stop Loss)', id: 'bracket' },
        { label: 'OCO (Take Profit OR Stop Loss)', id: 'oco' },
        { label: 'OTO (One Triggers Other)', id: 'oto' },
      ],
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Bracket order - take profit
    {
      id: 'take_profit_limit_price',
      title: 'Take Profit Price',
      type: 'short-input',
      placeholder: 'Target price to take profit',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Bracket order - stop loss
    {
      id: 'stop_loss_stop_price',
      title: 'Stop Loss Price',
      type: 'short-input',
      placeholder: 'Stop loss trigger price',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    {
      id: 'stop_loss_limit_price',
      title: 'Stop Loss Limit Price',
      type: 'short-input',
      placeholder: 'Stop loss limit (for stop_limit)',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Extended hours
    {
      id: 'extended_hours',
      title: 'Extended Hours',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Order ID for get/cancel/replace
    {
      id: 'order_id',
      title: 'Order ID',
      type: 'short-input',
      placeholder: 'UUID of the order',
      required: true,
      condition: { field: 'operation', value: ['get_order', 'cancel_order', 'replace_order'] },
    },
    // List orders status filter
    {
      id: 'order_status',
      title: 'Status Filter',
      type: 'dropdown',
      options: [
        { label: 'Open', id: 'open' },
        { label: 'Closed', id: 'closed' },
        { label: 'All', id: 'all' },
      ],
      condition: { field: 'operation', value: ['list_orders'] },
    },
    // Close position percentage
    {
      id: 'close_percentage',
      title: 'Close Percentage',
      type: 'short-input',
      placeholder: 'e.g., 50 for 50% (leave empty for all)',
      condition: { field: 'operation', value: ['close_position'] },
    },
    // Cancel orders when closing all positions
    {
      id: 'cancel_orders',
      title: 'Cancel Orders First',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      condition: { field: 'operation', value: ['close_all_positions'] },
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
      'alpaca_get_position',
      'alpaca_submit_order',
      'alpaca_submit_option_order',
      'alpaca_list_orders',
      'alpaca_get_order',
      'alpaca_replace_order',
      'alpaca_cancel_order',
      'alpaca_cancel_all_orders',
      'alpaca_close_position',
      'alpaca_close_all_positions',
      'alpaca_exercise_option',
    ],
    config: {
      tool: (params) => {
        const toolMap: Record<string, string> = {
          get_stock_bars: 'alpaca_get_stock_bars',
          get_stock_quotes: 'alpaca_get_stock_quotes',
          get_stock_snapshot: 'alpaca_get_stock_snapshot',
          get_option_bars: 'alpaca_get_option_bars',
          get_option_chain: 'alpaca_get_option_chain',
          get_account: 'alpaca_get_account',
          get_positions: 'alpaca_get_positions',
          get_position: 'alpaca_get_position',
          submit_order: 'alpaca_submit_order',
          submit_option_order: 'alpaca_submit_option_order',
          list_orders: 'alpaca_list_orders',
          get_order: 'alpaca_get_order',
          replace_order: 'alpaca_replace_order',
          cancel_order: 'alpaca_cancel_order',
          cancel_all_orders: 'alpaca_cancel_all_orders',
          close_position: 'alpaca_close_position',
          close_all_positions: 'alpaca_close_all_positions',
          exercise_option: 'alpaca_exercise_option',
        }
        return toolMap[params.operation] || 'alpaca_get_stock_bars'
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
          option_symbol,
          option_order_type,
          order_status,
          close_percentage,
          cancel_orders,
          extended_hours,
          ...rest
        } = params
        const cleanParams: Record<string, any> = {}

        // Convert paper trading to boolean
        if (paper === 'true') cleanParams.paper = true

        // Map optionSymbols to symbols for option_bars
        if (operation === 'get_option_bars' && optionSymbols) {
          cleanParams.symbols = optionSymbols
        }

        // Map optionType to type for option_chain
        if (operation === 'get_option_chain' && optionType) {
          cleanParams.type = optionType
        }

        // Map option_symbol for option orders
        if (
          (operation === 'submit_option_order' || operation === 'exercise_option') &&
          option_symbol
        ) {
          if (operation === 'submit_option_order') {
            cleanParams.symbol = option_symbol
          } else {
            cleanParams.symbol_or_contract_id = option_symbol
          }
        }

        // Map option order type
        if (operation === 'submit_option_order' && option_order_type) {
          cleanParams.type = option_order_type
        }

        // Map order status for list_orders
        if (operation === 'list_orders' && order_status) {
          cleanParams.status = order_status
        }

        // Map close percentage
        if (operation === 'close_position' && close_percentage) {
          cleanParams.percentage = close_percentage
        }

        // Map cancel_orders
        if (operation === 'close_all_positions' && cancel_orders === 'true') {
          cleanParams.cancel_orders = true
        }

        // Map extended_hours
        if (extended_hours === 'true') {
          cleanParams.extended_hours = true
        }

        // Convert numeric fields
        if (limit) cleanParams.limit = Number.parseInt(limit, 10)
        if (strike_price_gte) cleanParams.strike_price_gte = Number.parseFloat(strike_price_gte)
        if (strike_price_lte) cleanParams.strike_price_lte = Number.parseFloat(strike_price_lte)

        // Copy remaining params
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
    paper: { type: 'boolean', description: 'Use paper trading' },
    symbols: { type: 'string', description: 'Comma-separated stock symbols' },
    symbol: { type: 'string', description: 'Stock symbol' },
    option_symbol: { type: 'string', description: 'OCC option symbol' },
    qty: { type: 'string', description: 'Quantity of shares/contracts' },
    notional: { type: 'string', description: 'Dollar amount to trade' },
    side: { type: 'string', description: 'Order side (buy/sell)' },
    order_type: { type: 'string', description: 'Order type' },
    time_in_force: { type: 'string', description: 'Time in force' },
    limit_price: { type: 'string', description: 'Limit price' },
    stop_price: { type: 'string', description: 'Stop price' },
    trail_price: { type: 'string', description: 'Trail price in dollars' },
    trail_percent: { type: 'string', description: 'Trail percent' },
    order_class: { type: 'string', description: 'Order class (simple/bracket/oco/oto)' },
    take_profit_limit_price: { type: 'string', description: 'Take profit limit price' },
    stop_loss_stop_price: { type: 'string', description: 'Stop loss stop price' },
    stop_loss_limit_price: { type: 'string', description: 'Stop loss limit price' },
    order_id: { type: 'string', description: 'Order ID' },
    timeframe: { type: 'string', description: 'Bar timeframe' },
    start: { type: 'string', description: 'Start date/time' },
    end: { type: 'string', description: 'End date/time' },
    limit: { type: 'number', description: 'Maximum results' },
  },
  outputs: {
    order: { type: 'json', description: 'Order details' },
    orders: { type: 'json', description: 'List of orders' },
    position: { type: 'json', description: 'Position details' },
    positions: { type: 'json', description: 'Open positions' },
    account: { type: 'json', description: 'Account information' },
    bars: { type: 'json', description: 'Bar data (OHLCV)' },
    quotes: { type: 'json', description: 'Quote data (bid/ask)' },
    snapshots: { type: 'json', description: 'Market snapshots' },
    option_contracts: { type: 'json', description: 'Option contracts' },
    message: { type: 'string', description: 'Operation result message' },
  },
}
