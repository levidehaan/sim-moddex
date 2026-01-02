import { TrendingUp } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

export const WebullBlock: BlockConfig = {
  type: 'webull',
  name: 'Webull',
  description: 'Trade stocks and options with Webull',
  longDescription:
    'Webull trading integration. Submit stock and option orders, manage positions, get real-time quotes, and access option chains. Supports market, limit, stop, and stop-limit orders.',
  docsLink: 'https://developer.webull.com/api-doc/',
  authMode: AuthMode.ApiKey,
  category: 'tools',
  bgColor: '#1E88E5',
  icon: TrendingUp,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        // Account & Positions
        { label: '👤 Get Account', id: 'get_account' },
        { label: '📈 Get Positions', id: 'get_positions' },
        // Market Data
        { label: '📊 Get Quote', id: 'get_quote' },
        { label: '📊 Get Option Chain', id: 'get_option_chain' },
        // Stock Orders
        { label: '🛒 Submit Stock Order', id: 'submit_order' },
        { label: '📋 List Orders', id: 'list_orders' },
        { label: '❌ Cancel Order', id: 'cancel_order' },
        // Options Orders
        { label: '🎯 Submit Option Order', id: 'submit_option_order' },
      ],
      value: () => 'get_quote',
    },
    // Authentication
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
    {
      id: 'accountId',
      title: 'Account ID',
      type: 'short-input',
      placeholder: 'Your Webull account ID',
      required: true,
      condition: {
        field: 'operation',
        value: [
          'get_account',
          'get_positions',
          'submit_order',
          'list_orders',
          'cancel_order',
          'submit_option_order',
        ],
      },
    },
    // Symbol for quotes
    {
      id: 'symbol',
      title: 'Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL',
      required: true,
      condition: { field: 'operation', value: ['get_quote'] },
    },
    // Ticker ID for orders and option chain
    {
      id: 'tickerId',
      title: 'Ticker ID',
      type: 'short-input',
      placeholder: 'Ticker ID from Get Quote',
      required: true,
      condition: { field: 'operation', value: ['submit_order', 'get_option_chain'] },
    },
    // Order action
    {
      id: 'action',
      title: 'Action',
      type: 'dropdown',
      options: [
        { label: 'Buy', id: 'BUY' },
        { label: 'Sell', id: 'SELL' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_order', 'submit_option_order'] },
    },
    // Stock order type
    {
      id: 'orderType',
      title: 'Order Type',
      type: 'dropdown',
      options: [
        { label: 'Market', id: 'MKT' },
        { label: 'Limit', id: 'LMT' },
        { label: 'Stop', id: 'STP' },
        { label: 'Stop Limit', id: 'STP LMT' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Option order type
    {
      id: 'optionOrderType',
      title: 'Order Type',
      type: 'dropdown',
      options: [
        { label: 'Market', id: 'MKT' },
        { label: 'Limit', id: 'LMT' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_option_order'] },
    },
    // Time in force
    {
      id: 'timeInForce',
      title: 'Time in Force',
      type: 'dropdown',
      options: [
        { label: 'Day', id: 'DAY' },
        { label: 'Good Til Canceled', id: 'GTC' },
        { label: 'Immediate or Cancel', id: 'IOC' },
        { label: 'Fill or Kill', id: 'FOK' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Option time in force
    {
      id: 'optionTimeInForce',
      title: 'Time in Force',
      type: 'dropdown',
      options: [
        { label: 'Day', id: 'DAY' },
        { label: 'Good Til Canceled', id: 'GTC' },
      ],
      required: true,
      condition: { field: 'operation', value: ['submit_option_order'] },
    },
    // Quantity
    {
      id: 'quantity',
      title: 'Quantity',
      type: 'short-input',
      placeholder: 'Number of shares/contracts',
      required: true,
      condition: { field: 'operation', value: ['submit_order', 'submit_option_order'] },
    },
    // Limit price
    {
      id: 'lmtPrice',
      title: 'Limit Price',
      type: 'short-input',
      placeholder: 'Price for limit orders',
      condition: { field: 'operation', value: ['submit_order', 'submit_option_order'] },
    },
    // Stop price
    {
      id: 'auxPrice',
      title: 'Stop Price',
      type: 'short-input',
      placeholder: 'Trigger price for stop orders',
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Extended hours
    {
      id: 'outsideRegularTradingHour',
      title: 'Extended Hours',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      condition: { field: 'operation', value: ['submit_order'] },
    },
    // Order ID for cancel
    {
      id: 'orderId',
      title: 'Order ID',
      type: 'short-input',
      placeholder: 'Order ID to cancel',
      required: true,
      condition: { field: 'operation', value: ['cancel_order'] },
    },
    // Order status filter
    {
      id: 'orderStatus',
      title: 'Status Filter',
      type: 'dropdown',
      options: [
        { label: 'Working (Open)', id: 'working' },
        { label: 'Filled', id: 'filled' },
        { label: 'Cancelled', id: 'cancelled' },
        { label: 'All', id: 'all' },
      ],
      condition: { field: 'operation', value: ['list_orders'] },
    },
    // Option ticker ID
    {
      id: 'optionTickerId',
      title: 'Option Ticker ID',
      type: 'short-input',
      placeholder: 'Option contract ID from Option Chain',
      required: true,
      condition: { field: 'operation', value: ['submit_option_order'] },
    },
    // Option chain filters
    {
      id: 'expireDate',
      title: 'Expiration Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-19',
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
    {
      id: 'direction',
      title: 'Option Type',
      type: 'dropdown',
      options: [
        { label: 'All', id: 'all' },
        { label: 'Calls', id: 'call' },
        { label: 'Puts', id: 'put' },
      ],
      condition: { field: 'operation', value: ['get_option_chain'] },
    },
  ],
  tools: {
    access: [
      'webull_get_account',
      'webull_get_positions',
      'webull_get_quote',
      'webull_get_option_chain',
      'webull_submit_order',
      'webull_list_orders',
      'webull_cancel_order',
      'webull_submit_option_order',
    ],
    config: {
      tool: (params) => {
        const toolMap: Record<string, string> = {
          get_account: 'webull_get_account',
          get_positions: 'webull_get_positions',
          get_quote: 'webull_get_quote',
          get_option_chain: 'webull_get_option_chain',
          submit_order: 'webull_submit_order',
          list_orders: 'webull_list_orders',
          cancel_order: 'webull_cancel_order',
          submit_option_order: 'webull_submit_option_order',
        }
        return toolMap[params.operation] || 'webull_get_quote'
      },
      params: (params) => {
        const {
          operation,
          optionOrderType,
          optionTimeInForce,
          orderStatus,
          outsideRegularTradingHour,
          ...rest
        } = params
        const cleanParams: Record<string, any> = {}

        // Map option-specific fields
        if (operation === 'submit_option_order') {
          if (optionOrderType) cleanParams.orderType = optionOrderType
          if (optionTimeInForce) cleanParams.timeInForce = optionTimeInForce
        }

        // Map order status
        if (operation === 'list_orders' && orderStatus) {
          cleanParams.status = orderStatus
        }

        // Map extended hours
        if (outsideRegularTradingHour === 'true') {
          cleanParams.outsideRegularTradingHour = true
        }

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
    accessToken: { type: 'string', description: 'Webull OAuth access token' },
    deviceId: { type: 'string', description: 'Webull device ID' },
    accountId: { type: 'string', description: 'Webull account ID' },
    symbol: { type: 'string', description: 'Stock symbol' },
    tickerId: { type: 'string', description: 'Webull ticker ID' },
    optionTickerId: { type: 'string', description: 'Option contract ticker ID' },
    action: { type: 'string', description: 'Order action (BUY/SELL)' },
    orderType: { type: 'string', description: 'Order type' },
    timeInForce: { type: 'string', description: 'Time in force' },
    quantity: { type: 'string', description: 'Quantity' },
    lmtPrice: { type: 'string', description: 'Limit price' },
    auxPrice: { type: 'string', description: 'Stop price' },
    orderId: { type: 'string', description: 'Order ID' },
  },
  outputs: {
    account: { type: 'json', description: 'Account information' },
    positions: { type: 'json', description: 'Open positions' },
    quote: { type: 'json', description: 'Stock quote data' },
    tickerId: { type: 'string', description: 'Ticker ID for placing orders' },
    order: { type: 'json', description: 'Order details' },
    orders: { type: 'json', description: 'List of orders' },
    options: { type: 'json', description: 'Option contracts' },
    expirationDates: { type: 'json', description: 'Available expiration dates' },
    message: { type: 'string', description: 'Operation result message' },
  },
}
