import { Store } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const BestBuyBlock: BlockConfig = {
  type: 'bestbuy',
  name: 'Best Buy',
  description: 'Search products, stores, and open box deals',
  longDescription:
    'Access the Best Buy API for product search, store locations, categories, and open box inventory. Free tier available with API key registration. Great for price tracking, inventory monitoring, and retail automation.',
  category: 'tools',
  bgColor: '#0046BE',
  icon: Store,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Search Products', id: 'search_products' },
        { label: 'Get Product by SKU', id: 'get_product' },
        { label: 'Search Stores', id: 'search_stores' },
        { label: 'Get Store Details', id: 'get_store' },
        { label: 'Get Categories', id: 'get_categories' },
        { label: 'Get Open Box Products', id: 'open_box' },
      ],
      value: () => 'search_products',
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your Best Buy API key',
      password: true,
      connectionDroppable: false,
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., laptop, iPhone, Samsung TV',
      description: 'Search term for products',
      condition: { field: 'operation', value: 'search_products' },
    },
    {
      id: 'sku',
      title: 'Product SKU',
      type: 'short-input',
      placeholder: 'e.g., 6505727',
      description: 'Best Buy product SKU',
      condition: { field: 'operation', value: 'get_product' },
    },
    {
      id: 'skus',
      title: 'Product SKUs',
      type: 'short-input',
      placeholder: 'e.g., 6505727,6505728',
      description: 'Comma-separated SKUs for open box search',
      condition: { field: 'operation', value: 'open_box' },
    },
    {
      id: 'storeId',
      title: 'Store ID',
      type: 'short-input',
      placeholder: 'e.g., 1118',
      description: 'Best Buy store ID',
      condition: { field: 'operation', value: 'get_store' },
    },
    {
      id: 'zipCode',
      title: 'ZIP Code',
      type: 'short-input',
      placeholder: 'e.g., 90210',
      description: 'ZIP code for store search',
      condition: { field: 'operation', value: 'search_stores' },
    },
    {
      id: 'distance',
      title: 'Distance (Miles)',
      type: 'short-input',
      placeholder: '25',
      description: 'Search radius in miles (default: 25)',
      condition: { field: 'operation', value: 'search_stores' },
    },
    {
      id: 'categoryId',
      title: 'Category ID',
      type: 'short-input',
      placeholder: 'e.g., abcat0502000',
      description: 'Filter by category ID',
    },
    {
      id: 'minPrice',
      title: 'Min Price',
      type: 'short-input',
      placeholder: 'e.g., 100',
      description: 'Minimum price filter',
      condition: { field: 'operation', value: 'search_products' },
    },
    {
      id: 'maxPrice',
      title: 'Max Price',
      type: 'short-input',
      placeholder: 'e.g., 500',
      description: 'Maximum price filter',
      condition: { field: 'operation', value: 'search_products' },
    },
    {
      id: 'onSale',
      title: 'On Sale Only',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      value: () => 'false',
      condition: { field: 'operation', value: 'search_products' },
    },
    {
      id: 'pageSize',
      title: 'Results Per Page',
      type: 'short-input',
      placeholder: '10',
      description: 'Number of results (max 100)',
    },
    {
      id: 'page',
      title: 'Page',
      type: 'short-input',
      placeholder: '1',
      description: 'Page number for pagination',
    },
    {
      id: 'sort',
      title: 'Sort By',
      type: 'dropdown',
      options: [
        { label: 'Best Selling', id: 'bestSellingRank.asc' },
        { label: 'Price: Low to High', id: 'salePrice.asc' },
        { label: 'Price: High to Low', id: 'salePrice.dsc' },
        { label: 'Customer Rating', id: 'customerReviewAverage.dsc' },
        { label: 'Name A-Z', id: 'name.asc' },
      ],
      value: () => 'bestSellingRank.asc',
      condition: { field: 'operation', value: 'search_products' },
    },
  ],
  tools: {
    access: ['bestbuy_api'],
    config: {
      tool: () => 'bestbuy_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'search_products',
          apiKey: params.apiKey,
        }

        if (params.query) result.query = params.query
        if (params.sku) result.sku = params.sku
        if (params.skus) result.skus = params.skus.split(',').map((s: string) => s.trim())
        if (params.storeId) result.storeId = params.storeId
        if (params.zipCode) result.zipCode = params.zipCode
        if (params.distance) result.distance = Number(params.distance)
        if (params.categoryId) result.categoryId = params.categoryId
        if (params.minPrice) result.minPrice = Number(params.minPrice)
        if (params.maxPrice) result.maxPrice = Number(params.maxPrice)
        if (params.onSale) result.onSale = params.onSale === 'true'
        if (params.pageSize) result.pageSize = Number(params.pageSize)
        if (params.page) result.page = Number(params.page)
        if (params.sort) result.sort = params.sort

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'Best Buy API key' },
    query: { type: 'string', description: 'Product search query' },
    sku: { type: 'string', description: 'Product SKU' },
    skus: { type: 'array', description: 'Product SKUs for open box search' },
    storeId: { type: 'string', description: 'Store ID' },
    zipCode: { type: 'string', description: 'ZIP code for store search' },
    distance: { type: 'number', description: 'Search radius in miles' },
    categoryId: { type: 'string', description: 'Category ID filter' },
    minPrice: { type: 'number', description: 'Minimum price filter' },
    maxPrice: { type: 'number', description: 'Maximum price filter' },
    onSale: { type: 'boolean', description: 'Filter for on-sale items only' },
    pageSize: { type: 'number', description: 'Results per page' },
    page: { type: 'number', description: 'Page number' },
    sort: { type: 'string', description: 'Sort order' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    products: { type: 'array', description: 'List of products' },
    product: { type: 'json', description: 'Product details' },
    stores: { type: 'array', description: 'List of stores' },
    store: { type: 'json', description: 'Store details' },
    categories: { type: 'array', description: 'List of categories' },
    openBoxProducts: { type: 'array', description: 'Open box product offers' },
    total: { type: 'number', description: 'Total number of results' },
    totalPages: { type: 'number', description: 'Total number of pages' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
