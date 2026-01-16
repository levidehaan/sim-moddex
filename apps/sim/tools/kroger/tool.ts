import type { ToolConfig } from '@/tools/types'
import type { KrogerToolParams, KrogerToolResponse } from './types'

const KROGER_API_BASE = 'https://api.kroger.com/v1'
const KROGER_AUTH_URL = 'https://api.kroger.com/v1/connect/oauth2/token'

// Cache for access tokens
const tokenCache: Map<string, { token: string; expiresAt: number }> = new Map()

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const cacheKey = `${clientId}:${clientSecret}`
  const cached = tokenCache.get(cacheKey)
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(KROGER_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await response.json()
  const token = data.access_token
  const expiresIn = data.expires_in || 1800 // Default 30 minutes
  
  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + (expiresIn - 60) * 1000, // Expire 1 minute early
  })

  return token
}

async function searchProducts(
  token: string,
  query: string,
  locationId?: string,
  limit?: number,
  brand?: string
): Promise<{ products: unknown[]; total: number }> {
  const params = new URLSearchParams()
  params.append('filter.term', query)
  if (locationId) params.append('filter.locationId', locationId)
  if (limit) params.append('filter.limit', limit.toString())
  if (brand) params.append('filter.brand', brand)

  const response = await fetch(`${KROGER_API_BASE}/products?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to search products: ${error}`)
  }

  const data = await response.json()
  return {
    products: data.data || [],
    total: data.meta?.pagination?.total || data.data?.length || 0,
  }
}

async function getProduct(
  token: string,
  productId: string,
  locationId?: string
): Promise<unknown> {
  const params = new URLSearchParams()
  if (locationId) params.append('filter.locationId', locationId)

  const url = `${KROGER_API_BASE}/products/${productId}${params.toString() ? `?${params.toString()}` : ''}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get product: ${error}`)
  }

  const data = await response.json()
  return data.data
}

async function searchLocations(
  token: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number,
  radiusMiles?: number,
  limit?: number
): Promise<{ locations: unknown[]; total: number }> {
  const params = new URLSearchParams()
  if (zipCode) params.append('filter.zipCode.near', zipCode)
  if (latitude && longitude) {
    params.append('filter.lat.near', latitude.toString())
    params.append('filter.lon.near', longitude.toString())
  }
  if (radiusMiles) params.append('filter.radiusInMiles', radiusMiles.toString())
  if (limit) params.append('filter.limit', limit.toString())

  const response = await fetch(`${KROGER_API_BASE}/locations?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to search locations: ${error}`)
  }

  const data = await response.json()
  return {
    locations: data.data || [],
    total: data.meta?.pagination?.total || data.data?.length || 0,
  }
}

async function getLocation(token: string, locationId: string): Promise<unknown> {
  const response = await fetch(`${KROGER_API_BASE}/locations/${locationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get location: ${error}`)
  }

  const data = await response.json()
  return data.data
}

export const krogerTool: ToolConfig<KrogerToolParams, KrogerToolResponse> = {
  id: 'kroger_api',
  name: 'Kroger API',
  description: 'Search products and find store locations using the Kroger API',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform: search_products, get_product, search_locations, get_location',
    },
    clientId: {
      type: 'string',
      required: true,
      description: 'Kroger API Client ID',
    },
    clientSecret: {
      type: 'string',
      required: true,
      description: 'Kroger API Client Secret',
    },
    query: {
      type: 'string',
      required: false,
      description: 'Search query for products',
    },
    productId: {
      type: 'string',
      required: false,
      description: 'Product ID or UPC',
    },
    locationId: {
      type: 'string',
      required: false,
      description: 'Store location ID',
    },
    zipCode: {
      type: 'string',
      required: false,
      description: 'ZIP code for location search',
    },
    latitude: {
      type: 'number',
      required: false,
      description: 'Latitude for location search',
    },
    longitude: {
      type: 'number',
      required: false,
      description: 'Longitude for location search',
    },
    radiusMiles: {
      type: 'number',
      required: false,
      description: 'Search radius in miles',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Maximum number of results',
    },
    brand: {
      type: 'string',
      required: false,
      description: 'Brand filter for product search',
    },
  },

  directExecution: async (params: KrogerToolParams): Promise<KrogerToolResponse> => {
    try {
      const { operation, clientId, clientSecret } = params

      if (!clientId || !clientSecret) {
        return {
          success: false,
          output: {
            error: 'Client ID and Client Secret are required',
          },
        }
      }

      const token = await getAccessToken(clientId, clientSecret)

      switch (operation) {
        case 'search_products': {
          if (!params.query) {
            return {
              success: false,
              output: { error: 'Query is required for product search' },
            }
          }
          const result = await searchProducts(
            token,
            params.query,
            params.locationId,
            params.limit,
            params.brand
          )
          return {
            success: true,
            output: {
              products: result.products as KrogerToolResponse['output']['products'],
              total: result.total,
            },
          }
        }

        case 'get_product': {
          if (!params.productId) {
            return {
              success: false,
              output: { error: 'Product ID is required' },
            }
          }
          const product = await getProduct(token, params.productId, params.locationId)
          return {
            success: true,
            output: {
              product: product as KrogerToolResponse['output']['product'],
            },
          }
        }

        case 'search_locations': {
          if (!params.zipCode && !(params.latitude && params.longitude)) {
            return {
              success: false,
              output: { error: 'ZIP code or coordinates (latitude/longitude) are required' },
            }
          }
          const result = await searchLocations(
            token,
            params.zipCode,
            params.latitude,
            params.longitude,
            params.radiusMiles,
            params.limit
          )
          return {
            success: true,
            output: {
              locations: result.locations as KrogerToolResponse['output']['locations'],
              total: result.total,
            },
          }
        }

        case 'get_location': {
          if (!params.locationId) {
            return {
              success: false,
              output: { error: 'Location ID is required' },
            }
          }
          const location = await getLocation(token, params.locationId)
          return {
            success: true,
            output: {
              location: location as KrogerToolResponse['output']['location'],
            },
          }
        }

        default:
          return {
            success: false,
            output: { error: `Unknown operation: ${operation}` },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      }
    }
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
