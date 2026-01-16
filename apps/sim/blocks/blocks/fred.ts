import { LineChart } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const FREDBlock: BlockConfig = {
  type: 'fred',
  name: 'FRED',
  description: 'Federal Reserve economic data',
  longDescription:
    'Access the FRED (Federal Reserve Economic Data) API for macroeconomic data including GDP, inflation, interest rates, employment, and 800,000+ economic time series. Free API key required with unlimited requests. The gold standard for economic research.',
  category: 'tools',
  bgColor: '#003366',
  icon: LineChart,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Series Observations', id: 'observations' },
        { label: 'Get Series Info', id: 'series' },
        { label: 'Search Series', id: 'search' },
        { label: 'Get Category', id: 'category' },
        { label: 'Get Category Series', id: 'category_series' },
        { label: 'Get Releases', id: 'releases' },
        { label: 'Get Release Dates', id: 'release_dates' },
      ],
      value: () => 'observations',
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your FRED API key',
      password: true,
      connectionDroppable: false,
    },
    {
      id: 'seriesId',
      title: 'Series ID',
      type: 'short-input',
      placeholder: 'e.g., GDP, UNRATE, CPIAUCSL, FEDFUNDS',
      description: 'FRED series identifier',
    },
    {
      id: 'searchText',
      title: 'Search Text',
      type: 'short-input',
      placeholder: 'e.g., unemployment rate, inflation',
      description: 'Search term for series',
      condition: { field: 'operation', value: 'search' },
    },
    {
      id: 'categoryId',
      title: 'Category ID',
      type: 'short-input',
      placeholder: 'e.g., 32991 (Money, Banking)',
      description: 'FRED category ID',
    },
    {
      id: 'releaseId',
      title: 'Release ID',
      type: 'short-input',
      placeholder: 'e.g., 53 (GDP)',
      description: 'FRED release ID',
      condition: { field: 'operation', value: 'release_dates' },
    },
    {
      id: 'startDate',
      title: 'Start Date',
      type: 'short-input',
      placeholder: 'e.g., 2020-01-01',
      description: 'Start date (YYYY-MM-DD)',
    },
    {
      id: 'endDate',
      title: 'End Date',
      type: 'short-input',
      placeholder: 'e.g., 2024-12-31',
      description: 'End date (YYYY-MM-DD)',
    },
    {
      id: 'frequency',
      title: 'Frequency',
      type: 'dropdown',
      options: [
        { label: 'Default', id: '' },
        { label: 'Daily', id: 'd' },
        { label: 'Weekly', id: 'w' },
        { label: 'Bi-Weekly', id: 'bw' },
        { label: 'Monthly', id: 'm' },
        { label: 'Quarterly', id: 'q' },
        { label: 'Semi-Annual', id: 'sa' },
        { label: 'Annual', id: 'a' },
      ],
      value: () => '',
      condition: { field: 'operation', value: 'observations' },
    },
    {
      id: 'units',
      title: 'Units',
      type: 'dropdown',
      options: [
        { label: 'Levels (Default)', id: 'lin' },
        { label: 'Change', id: 'chg' },
        { label: 'Change from Year Ago', id: 'ch1' },
        { label: 'Percent Change', id: 'pch' },
        { label: 'Percent Change from Year Ago', id: 'pc1' },
        { label: 'Compounded Annual Rate of Change', id: 'pca' },
        { label: 'Continuously Compounded Rate of Change', id: 'cch' },
        { label: 'Continuously Compounded Annual Rate of Change', id: 'cca' },
        { label: 'Natural Log', id: 'log' },
      ],
      value: () => 'lin',
      condition: { field: 'operation', value: 'observations' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '100',
      description: 'Maximum number of results',
    },
    {
      id: 'sortOrder',
      title: 'Sort Order',
      type: 'dropdown',
      options: [
        { label: 'Ascending', id: 'asc' },
        { label: 'Descending', id: 'desc' },
      ],
      value: () => 'asc',
    },
  ],
  tools: {
    access: ['fred_api'],
    config: {
      tool: () => 'fred_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'observations',
          apiKey: params.apiKey,
        }

        if (params.seriesId) result.seriesId = params.seriesId
        if (params.searchText) result.searchText = params.searchText
        if (params.categoryId) result.categoryId = params.categoryId
        if (params.releaseId) result.releaseId = params.releaseId
        if (params.startDate) result.startDate = params.startDate
        if (params.endDate) result.endDate = params.endDate
        if (params.frequency) result.frequency = params.frequency
        if (params.units) result.units = params.units
        if (params.limit) result.limit = Number(params.limit)
        if (params.sortOrder) result.sortOrder = params.sortOrder

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'FRED API key' },
    seriesId: { type: 'string', description: 'Series ID' },
    searchText: { type: 'string', description: 'Search text' },
    categoryId: { type: 'string', description: 'Category ID' },
    releaseId: { type: 'string', description: 'Release ID' },
    startDate: { type: 'string', description: 'Start date' },
    endDate: { type: 'string', description: 'End date' },
    frequency: { type: 'string', description: 'Data frequency' },
    units: { type: 'string', description: 'Data units transformation' },
    limit: { type: 'number', description: 'Maximum results' },
    sortOrder: { type: 'string', description: 'Sort order' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    observations: { type: 'array', description: 'Time series observations' },
    series: { type: 'json', description: 'Series metadata' },
    searchResults: { type: 'array', description: 'Search results' },
    category: { type: 'json', description: 'Category information' },
    categorySeries: { type: 'array', description: 'Series in category' },
    releases: { type: 'array', description: 'Data releases' },
    releaseDates: { type: 'array', description: 'Release dates' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
