import { Coins } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const CoinGeckoBlock: BlockConfig = {
  type: 'coingecko',
  name: 'CoinGecko',
  description: 'Get cryptocurrency prices and market data',
  longDescription:
    'Access the CoinGecko API for cryptocurrency prices, market data, historical data, and trending coins. Free tier available with no API key required for basic endpoints. Great for crypto price tracking and market analysis.',
  category: 'tools',
  bgColor: '#8DC63F',
  icon: Coins,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Coin Price', id: 'price' },
        { label: 'Get Coin Details', id: 'coin' },
        { label: 'List All Coins', id: 'coins_list' },
        { label: 'Get Market Data', id: 'markets' },
        { label: 'Get Trending Coins', id: 'trending' },
        { label: 'Search Coins', id: 'search' },
        { label: 'Get Global Data', id: 'global' },
        { label: 'Get Historical Price', id: 'history' },
        { label: 'Get OHLC Data', id: 'ohlc' },
        { label: 'Get Exchange Rates', id: 'exchange_rates' },
      ],
      value: () => 'price',
    },
    {
      id: 'coinIds',
      title: 'Coin IDs',
      type: 'short-input',
      placeholder: 'e.g., bitcoin,ethereum,solana',
      description: 'Comma-separated coin IDs (use search to find IDs)',
      condition: { field: 'operation', value: 'price' },
    },
    {
      id: 'coinId',
      title: 'Coin ID',
      type: 'short-input',
      placeholder: 'e.g., bitcoin',
      description: 'Single coin ID',
    },
    {
      id: 'vsCurrencies',
      title: 'VS Currencies',
      type: 'short-input',
      placeholder: 'e.g., usd,eur,btc',
      description: 'Target currencies (default: usd)',
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., bitcoin, eth',
      description: 'Search term for coins',
      condition: { field: 'operation', value: 'search' },
    },
    {
      id: 'date',
      title: 'Date',
      type: 'short-input',
      placeholder: 'e.g., 30-12-2023 (dd-mm-yyyy)',
      description: 'Historical date',
      condition: { field: 'operation', value: 'history' },
    },
    {
      id: 'days',
      title: 'Days',
      type: 'short-input',
      placeholder: 'e.g., 7, 30, 365, max',
      description: 'Number of days for OHLC data',
      condition: { field: 'operation', value: 'ohlc' },
    },
    {
      id: 'perPage',
      title: 'Results Per Page',
      type: 'short-input',
      placeholder: '100',
      description: 'Number of results (max 250)',
      condition: { field: 'operation', value: 'markets' },
    },
    {
      id: 'page',
      title: 'Page',
      type: 'short-input',
      placeholder: '1',
      description: 'Page number for pagination',
      condition: { field: 'operation', value: 'markets' },
    },
    {
      id: 'order',
      title: 'Sort Order',
      type: 'dropdown',
      options: [
        { label: 'Market Cap (Desc)', id: 'market_cap_desc' },
        { label: 'Market Cap (Asc)', id: 'market_cap_asc' },
        { label: 'Volume (Desc)', id: 'volume_desc' },
        { label: 'Volume (Asc)', id: 'volume_asc' },
        { label: 'ID (Asc)', id: 'id_asc' },
        { label: 'ID (Desc)', id: 'id_desc' },
      ],
      value: () => 'market_cap_desc',
      condition: { field: 'operation', value: 'markets' },
    },
    {
      id: 'includeMarketCap',
      title: 'Include Market Cap',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'true',
      condition: { field: 'operation', value: 'price' },
    },
    {
      id: 'include24hrVol',
      title: 'Include 24h Volume',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'true',
      condition: { field: 'operation', value: 'price' },
    },
    {
      id: 'include24hrChange',
      title: 'Include 24h Change',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      value: () => 'true',
      condition: { field: 'operation', value: 'price' },
    },
  ],
  tools: {
    access: ['coingecko_api'],
    config: {
      tool: () => 'coingecko_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'price',
        }

        if (params.coinIds) result.coinIds = params.coinIds.split(',').map((id: string) => id.trim())
        if (params.coinId) result.coinId = params.coinId
        if (params.vsCurrencies) result.vsCurrencies = params.vsCurrencies.split(',').map((c: string) => c.trim())
        if (params.query) result.query = params.query
        if (params.date) result.date = params.date
        if (params.days) result.days = params.days
        if (params.perPage) result.perPage = Number(params.perPage)
        if (params.page) result.page = Number(params.page)
        if (params.order) result.order = params.order
        result.includeMarketCap = params.includeMarketCap !== 'false'
        result.include24hrVol = params.include24hrVol !== 'false'
        result.include24hrChange = params.include24hrChange !== 'false'

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    coinIds: { type: 'array', description: 'Coin IDs for price lookup' },
    coinId: { type: 'string', description: 'Single coin ID' },
    vsCurrencies: { type: 'array', description: 'Target currencies' },
    query: { type: 'string', description: 'Search query' },
    date: { type: 'string', description: 'Historical date (dd-mm-yyyy)' },
    days: { type: 'string', description: 'Number of days for OHLC' },
    perPage: { type: 'number', description: 'Results per page' },
    page: { type: 'number', description: 'Page number' },
    order: { type: 'string', description: 'Sort order' },
    includeMarketCap: { type: 'boolean', description: 'Include market cap' },
    include24hrVol: { type: 'boolean', description: 'Include 24h volume' },
    include24hrChange: { type: 'boolean', description: 'Include 24h change' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    prices: { type: 'json', description: 'Price data for coins' },
    coin: { type: 'json', description: 'Detailed coin information' },
    coins: { type: 'array', description: 'List of coins' },
    markets: { type: 'array', description: 'Market data for coins' },
    trending: { type: 'array', description: 'Trending coins' },
    searchResults: { type: 'json', description: 'Search results' },
    global: { type: 'json', description: 'Global market data' },
    history: { type: 'json', description: 'Historical price data' },
    ohlc: { type: 'array', description: 'OHLC candlestick data' },
    exchangeRates: { type: 'json', description: 'BTC exchange rates' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
