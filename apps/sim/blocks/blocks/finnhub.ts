import { TrendingUp } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const FinnhubBlock: BlockConfig = {
  type: 'finnhub',
  name: 'Finnhub',
  description: 'Real-time stock data, news, and market info',
  longDescription:
    'Access the Finnhub API for real-time stock quotes, company news, earnings calendars, insider transactions, and market data. Free tier offers 60 calls/minute with real-time US stock data. Great for financial automation and market monitoring.',
  category: 'tools',
  bgColor: '#00C805',
  icon: TrendingUp,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Quote', id: 'quote' },
        { label: 'Get Company Profile', id: 'profile' },
        { label: 'Get Company News', id: 'news' },
        { label: 'Get Stock Candles', id: 'candles' },
        { label: 'Get Earnings Calendar', id: 'earnings' },
        { label: 'Get Insider Transactions', id: 'insider' },
        { label: 'Get Recommendation Trends', id: 'recommendations' },
        { label: 'Get Price Target', id: 'price_target' },
        { label: 'Search Symbols', id: 'search' },
        { label: 'Get Market Status', id: 'market_status' },
      ],
      value: () => 'quote',
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your Finnhub API key',
      password: true,
      connectionDroppable: false,
    },
    {
      id: 'symbol',
      title: 'Symbol',
      type: 'short-input',
      placeholder: 'e.g., AAPL, MSFT, GOOGL',
      description: 'Stock ticker symbol',
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., apple, microsoft',
      description: 'Search term for symbol lookup',
      condition: { field: 'operation', value: 'search' },
    },
    {
      id: 'fromDate',
      title: 'From Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-01',
      description: 'Start date (YYYY-MM-DD)',
      condition: { field: 'operation', value: 'candles' },
    },
    {
      id: 'toDate',
      title: 'To Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-12-31',
      description: 'End date (YYYY-MM-DD)',
      condition: { field: 'operation', value: 'candles' },
    },
    {
      id: 'resolution',
      title: 'Resolution',
      type: 'dropdown',
      options: [
        { label: '1 Minute', id: '1' },
        { label: '5 Minutes', id: '5' },
        { label: '15 Minutes', id: '15' },
        { label: '30 Minutes', id: '30' },
        { label: '60 Minutes', id: '60' },
        { label: 'Daily', id: 'D' },
        { label: 'Weekly', id: 'W' },
        { label: 'Monthly', id: 'M' },
      ],
      value: () => 'D',
      condition: { field: 'operation', value: 'candles' },
    },
    {
      id: 'newsFromDate',
      title: 'From Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-01-01',
      description: 'Start date for news (YYYY-MM-DD)',
      condition: { field: 'operation', value: 'news' },
    },
    {
      id: 'newsToDate',
      title: 'To Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-12-31',
      description: 'End date for news (YYYY-MM-DD)',
      condition: { field: 'operation', value: 'news' },
    },
    {
      id: 'exchange',
      title: 'Exchange',
      type: 'short-input',
      placeholder: 'e.g., US',
      description: 'Exchange code for market status',
      condition: { field: 'operation', value: 'market_status' },
    },
  ],
  tools: {
    access: ['finnhub_api'],
    config: {
      tool: () => 'finnhub_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'quote',
          apiKey: params.apiKey,
        }

        if (params.symbol) result.symbol = params.symbol.toUpperCase()
        if (params.query) result.query = params.query
        if (params.fromDate) result.fromDate = params.fromDate
        if (params.toDate) result.toDate = params.toDate
        if (params.resolution) result.resolution = params.resolution
        if (params.newsFromDate) result.newsFromDate = params.newsFromDate
        if (params.newsToDate) result.newsToDate = params.newsToDate
        if (params.exchange) result.exchange = params.exchange

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'Finnhub API key' },
    symbol: { type: 'string', description: 'Stock ticker symbol' },
    query: { type: 'string', description: 'Search query' },
    fromDate: { type: 'string', description: 'Start date for candles' },
    toDate: { type: 'string', description: 'End date for candles' },
    resolution: { type: 'string', description: 'Candle resolution' },
    newsFromDate: { type: 'string', description: 'Start date for news' },
    newsToDate: { type: 'string', description: 'End date for news' },
    exchange: { type: 'string', description: 'Exchange code' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    quote: { type: 'json', description: 'Stock quote data' },
    profile: { type: 'json', description: 'Company profile' },
    news: { type: 'array', description: 'Company news articles' },
    candles: { type: 'json', description: 'Stock candle data' },
    earnings: { type: 'array', description: 'Earnings calendar' },
    insiderTransactions: { type: 'array', description: 'Insider transactions' },
    recommendations: { type: 'array', description: 'Analyst recommendations' },
    priceTarget: { type: 'json', description: 'Price target consensus' },
    searchResults: { type: 'array', description: 'Symbol search results' },
    marketStatus: { type: 'json', description: 'Market status' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
