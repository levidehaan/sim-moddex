import type { ToolConfig } from '@/tools/types'
import type { BestBuyToolParams, BestBuyToolResponse } from './types'

const BESTBUY_API_BASE = 'https://api.bestbuy.com/v1'

// Default fields to return for products
const PRODUCT_FIELDS = [
  'sku',
  'name',
  'type',
  'regularPrice',
  'salePrice',
  'onSale',
  'url',
  'addToCartUrl',
  'image',
  'thumbnailImage',
  'largeFrontImage',
  'mediumImage',
  'shortDescription',
  'longDescription',
  'manufacturer',
  'modelNumber',
  'upc',
  'categoryPath.id',
  'categoryPath.name',
  'customerReviewAverage',
  'customerReviewCount',
  'inStoreAvailability',
  'onlineAvailability',
  'freeShipping',
  'shippingCost',
  'condition',
  'color',
].join(',')

// Default fields for stores
const STORE_FIELDS = [
  'storeId',
  'storeType',
  'name',
  'longName',
  'address',
  'address2',
  'city',
  'region',
  'fullPostalCode',
  'country',
  'lat',
  'lng',
  'phone',
  'hours',
  'hoursAmPm',
  'gmtOffset',
  'services',
  'distance',
].join(',')

async function searchProducts(
  apiKey: string,
  query: string,
  options: {
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    onSale?: boolean
    pageSize?: number
    page?: number
    sort?: string
  }
): Promise<{ products: unknown[]; total: number; totalPages: number; currentPage: number }> {
  const filters: string[] = []
  
  // Search query
  if (query) {
    filters.push(`(search=${encodeURIComponent(query)})`)
  }
  
  // Category filter
  if (options.categoryId) {
    filters.push(`(categoryPath.id=${options.categoryId})`)
  }
  
  // Price filters
  if (options.minPrice !== undefined) {
    filters.push(`(salePrice>=${options.minPrice})`)
  }
  if (options.maxPrice !== undefined) {
    filters.push(`(salePrice<=${options.maxPrice})`)
  }
  
  // On sale filter
  if (options.onSale) {
    filters.push('(onSale=true)')
  }

  const filterString = filters.join('&')
  const pageSize = options.pageSize || 10
  const page = options.page || 1
  const sort = options.sort || 'bestSellingRank.asc'

  const url = `${BESTBUY_API_BASE}/products${filterString ? `(${filterString})` : ''}?apiKey=${apiKey}&show=${PRODUCT_FIELDS}&pageSize=${pageSize}&page=${page}&sort=${sort}&format=json`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to search products: ${error}`)
  }

  const data = await response.json()
  return {
    products: data.products || [],
    total: data.total || 0,
    totalPages: data.totalPages || 0,
    currentPage: data.currentPage || page,
  }
}

async function getProduct(apiKey: string, sku: string): Promise<unknown> {
  const url = `${BESTBUY_API_BASE}/products/${sku}.json?apiKey=${apiKey}&show=${PRODUCT_FIELDS}`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get product: ${error}`)
  }

  return response.json()
}

async function searchStores(
  apiKey: string,
  zipCode: string,
  distance?: number,
  pageSize?: number,
  page?: number
): Promise<{ stores: unknown[]; total: number; totalPages: number; currentPage: number }> {
  const dist = distance || 25
  const size = pageSize || 10
  const pg = page || 1

  const url = `${BESTBUY_API_BASE}/stores(area(${zipCode},${dist}))?apiKey=${apiKey}&show=${STORE_FIELDS}&pageSize=${size}&page=${pg}&format=json`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to search stores: ${error}`)
  }

  const data = await response.json()
  return {
    stores: data.stores || [],
    total: data.total || 0,
    totalPages: data.totalPages || 0,
    currentPage: data.currentPage || pg,
  }
}

async function getStore(apiKey: string, storeId: string): Promise<unknown> {
  const url = `${BESTBUY_API_BASE}/stores/${storeId}.json?apiKey=${apiKey}&show=${STORE_FIELDS}`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get store: ${error}`)
  }

  return response.json()
}

async function getCategories(apiKey: string, categoryId?: string): Promise<unknown[]> {
  let url: string
  if (categoryId) {
    url = `${BESTBUY_API_BASE}/categories(id=${categoryId})?apiKey=${apiKey}&format=json`
  } else {
    url = `${BESTBUY_API_BASE}/categories?apiKey=${apiKey}&format=json&pageSize=100`
  }

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get categories: ${error}`)
  }

  const data = await response.json()
  return data.categories || []
}

async function getOpenBoxProducts(apiKey: string, skus: string[]): Promise<unknown[]> {
  const skuList = skus.join(',')
  const url = `${BESTBUY_API_BASE}/products/openBox(sku%20in(${skuList}))?apiKey=${apiKey}&format=json`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get open box products: ${error}`)
  }

  const data = await response.json()
  return data.results || []
}

export const bestbuyTool: ToolConfig<BestBuyToolParams, BestBuyToolResponse> = {
  id: 'bestbuy_api',
  name: 'Best Buy API',
  description: 'Search products, stores, and open box deals using the Best Buy API',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform: search_products, get_product, search_stores, get_store, get_categories, open_box',
    },
    apiKey: {
      type: 'string',
      required: true,
      description: 'Best Buy API key',
    },
    query: {
      type: 'string',
      required: false,
      description: 'Search query for products',
    },
    sku: {
      type: 'string',
      required: false,
      description: 'Product SKU',
    },
    skus: {
      type: 'array',
      required: false,
      description: 'Product SKUs for open box search',
    },
    storeId: {
      type: 'string',
      required: false,
      description: 'Store ID',
    },
    zipCode: {
      type: 'string',
      required: false,
      description: 'ZIP code for store search',
    },
    distance: {
      type: 'number',
      required: false,
      description: 'Search radius in miles',
    },
    categoryId: {
      type: 'string',
      required: false,
      description: 'Category ID filter',
    },
    minPrice: {
      type: 'number',
      required: false,
      description: 'Minimum price filter',
    },
    maxPrice: {
      type: 'number',
      required: false,
      description: 'Maximum price filter',
    },
    onSale: {
      type: 'boolean',
      required: false,
      description: 'Filter for on-sale items only',
    },
    pageSize: {
      type: 'number',
      required: false,
      description: 'Results per page (max 100)',
    },
    page: {
      type: 'number',
      required: false,
      description: 'Page number',
    },
    sort: {
      type: 'string',
      required: false,
      description: 'Sort order',
    },
  },

  directExecution: async (params: BestBuyToolParams): Promise<BestBuyToolResponse> => {
    try {
      const { operation, apiKey } = params

      if (!apiKey) {
        return {
          success: false,
          output: {
            error: 'API key is required',
          },
        }
      }

      switch (operation) {
        case 'search_products': {
          if (!params.query && !params.categoryId) {
            return {
              success: false,
              output: { error: 'Query or category ID is required for product search' },
            }
          }
          const result = await searchProducts(apiKey, params.query || '', {
            categoryId: params.categoryId,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            onSale: params.onSale,
            pageSize: params.pageSize,
            page: params.page,
            sort: params.sort,
          })
          return {
            success: true,
            output: {
              products: result.products as BestBuyToolResponse['output']['products'],
              total: result.total,
              totalPages: result.totalPages,
              currentPage: result.currentPage,
            },
          }
        }

        case 'get_product': {
          if (!params.sku) {
            return {
              success: false,
              output: { error: 'SKU is required' },
            }
          }
          const product = await getProduct(apiKey, params.sku)
          return {
            success: true,
            output: {
              product: product as BestBuyToolResponse['output']['product'],
            },
          }
        }

        case 'search_stores': {
          if (!params.zipCode) {
            return {
              success: false,
              output: { error: 'ZIP code is required for store search' },
            }
          }
          const result = await searchStores(
            apiKey,
            params.zipCode,
            params.distance,
            params.pageSize,
            params.page
          )
          return {
            success: true,
            output: {
              stores: result.stores as BestBuyToolResponse['output']['stores'],
              total: result.total,
              totalPages: result.totalPages,
              currentPage: result.currentPage,
            },
          }
        }

        case 'get_store': {
          if (!params.storeId) {
            return {
              success: false,
              output: { error: 'Store ID is required' },
            }
          }
          const store = await getStore(apiKey, params.storeId)
          return {
            success: true,
            output: {
              store: store as BestBuyToolResponse['output']['store'],
            },
          }
        }

        case 'get_categories': {
          const categories = await getCategories(apiKey, params.categoryId)
          return {
            success: true,
            output: {
              categories: categories as BestBuyToolResponse['output']['categories'],
            },
          }
        }

        case 'open_box': {
          if (!params.skus || params.skus.length === 0) {
            return {
              success: false,
              output: { error: 'SKUs are required for open box search' },
            }
          }
          const openBoxProducts = await getOpenBoxProducts(apiKey, params.skus)
          return {
            success: true,
            output: {
              openBoxProducts: openBoxProducts as BestBuyToolResponse['output']['openBoxProducts'],
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
    stores: { type: 'array', description: 'List of stores' },
    store: { type: 'json', description: 'Store details' },
    categories: { type: 'array', description: 'List of categories' },
    openBoxProducts: { type: 'array', description: 'Open box product offers' },
    total: { type: 'number', description: 'Total number of results' },
    totalPages: { type: 'number', description: 'Total number of pages' },
    currentPage: { type: 'number', description: 'Current page number' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
