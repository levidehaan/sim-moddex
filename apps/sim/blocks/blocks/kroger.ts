import { ShoppingCart } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const KrogerBlock: BlockConfig = {
  type: 'kroger',
  name: 'Kroger',
  description: 'Search products and find store locations',
  longDescription:
    'Access the Kroger API for grocery product search, store locations, and product details. Requires OAuth 2.0 authentication with Client ID and Secret. Great for price tracking, inventory monitoring, and grocery automation.',
  category: 'tools',
  bgColor: '#0066B2',
  icon: ShoppingCart,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Search Products', id: 'search_products' },
        { label: 'Get Product Details', id: 'get_product' },
        { label: 'Search Locations', id: 'search_locations' },
        { label: 'Get Location Details', id: 'get_location' },
      ],
      value: () => 'search_products',
    },
    {
      id: 'clientId',
      title: 'Client ID',
      type: 'short-input',
      placeholder: 'Enter your Kroger Client ID',
      password: true,
      connectionDroppable: false,
    },
    {
      id: 'clientSecret',
      title: 'Client Secret',
      type: 'short-input',
      placeholder: 'Enter your Kroger Client Secret',
      password: true,
      connectionDroppable: false,
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., milk, bread, organic apples',
      description: 'Search term for products',
      condition: { field: 'operation', value: 'search_products' },
    },
    {
      id: 'productId',
      title: 'Product ID',
      type: 'short-input',
      placeholder: 'e.g., 0001111041700',
      description: 'UPC or product ID',
      condition: { field: 'operation', value: 'get_product' },
    },
    {
      id: 'locationId',
      title: 'Location ID',
      type: 'short-input',
      placeholder: 'e.g., 01400376',
      description: 'Store location ID for product availability',
    },
    {
      id: 'zipCode',
      title: 'ZIP Code',
      type: 'short-input',
      placeholder: 'e.g., 45202',
      description: 'ZIP code for store search',
      condition: { field: 'operation', value: 'search_locations' },
    },
    {
      id: 'latitude',
      title: 'Latitude',
      type: 'short-input',
      placeholder: 'e.g., 39.1031',
      description: 'Latitude for location search',
      condition: { field: 'operation', value: 'search_locations' },
    },
    {
      id: 'longitude',
      title: 'Longitude',
      type: 'short-input',
      placeholder: 'e.g., -84.5120',
      description: 'Longitude for location search',
      condition: { field: 'operation', value: 'search_locations' },
    },
    {
      id: 'radiusMiles',
      title: 'Radius (Miles)',
      type: 'short-input',
      placeholder: '10',
      description: 'Search radius in miles (default: 10)',
      condition: { field: 'operation', value: 'search_locations' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '10',
      description: 'Maximum number of results',
    },
    {
      id: 'brand',
      title: 'Brand Filter',
      type: 'short-input',
      placeholder: 'e.g., Kroger, Simple Truth',
      description: 'Filter by brand name',
      condition: { field: 'operation', value: 'search_products' },
    },
  ],
  tools: {
    access: ['kroger_api'],
    config: {
      tool: () => 'kroger_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'search_products',
          clientId: params.clientId,
          clientSecret: params.clientSecret,
        }

        if (params.query) result.query = params.query
        if (params.productId) result.productId = params.productId
        if (params.locationId) result.locationId = params.locationId
        if (params.zipCode) result.zipCode = params.zipCode
        if (params.latitude) result.latitude = Number(params.latitude)
        if (params.longitude) result.longitude = Number(params.longitude)
        if (params.radiusMiles) result.radiusMiles = Number(params.radiusMiles)
        if (params.limit) result.limit = Number(params.limit)
        if (params.brand) result.brand = params.brand

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    clientId: { type: 'string', description: 'Kroger API Client ID' },
    clientSecret: { type: 'string', description: 'Kroger API Client Secret' },
    query: { type: 'string', description: 'Product search query' },
    productId: { type: 'string', description: 'Product ID or UPC' },
    locationId: { type: 'string', description: 'Store location ID' },
    zipCode: { type: 'string', description: 'ZIP code for store search' },
    latitude: { type: 'number', description: 'Latitude for location search' },
    longitude: { type: 'number', description: 'Longitude for location search' },
    radiusMiles: { type: 'number', description: 'Search radius in miles' },
    limit: { type: 'number', description: 'Maximum results to return' },
    brand: { type: 'string', description: 'Brand filter' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    products: { type: 'array', description: 'List of products' },
    product: { type: 'json', description: 'Product details' },
    locations: { type: 'array', description: 'List of store locations' },
    location: { type: 'json', description: 'Store location details' },
    total: { type: 'number', description: 'Total number of results' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
