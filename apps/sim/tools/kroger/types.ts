export type KrogerOperation = 
  | 'search_products'
  | 'get_product'
  | 'search_locations'
  | 'get_location'

export interface KrogerToolParams {
  operation: KrogerOperation
  clientId: string
  clientSecret: string
  query?: string
  productId?: string
  locationId?: string
  zipCode?: string
  latitude?: number
  longitude?: number
  radiusMiles?: number
  limit?: number
  brand?: string
}

export interface KrogerProduct {
  productId: string
  upc: string
  description: string
  brand: string
  categories: string[]
  images: Array<{
    perspective: string
    sizes: Array<{
      size: string
      url: string
    }>
  }>
  items: Array<{
    itemId: string
    price?: {
      regular: number
      promo?: number
    }
    size?: string
    soldBy?: string
    inventory?: {
      stockLevel: string
    }
  }>
  temperature?: {
    indicator: string
  }
}

export interface KrogerLocation {
  locationId: string
  chain: string
  name: string
  address: {
    addressLine1: string
    city: string
    state: string
    zipCode: string
    county: string
  }
  geolocation: {
    latitude: number
    longitude: number
  }
  phone: string
  departments: Array<{
    departmentId: string
    name: string
    phone?: string
    hours?: {
      open24: boolean
      monday?: { open: string; close: string }
      tuesday?: { open: string; close: string }
      wednesday?: { open: string; close: string }
      thursday?: { open: string; close: string }
      friday?: { open: string; close: string }
      saturday?: { open: string; close: string }
      sunday?: { open: string; close: string }
    }
  }>
  hours?: {
    open24: boolean
    monday?: { open: string; close: string }
    tuesday?: { open: string; close: string }
    wednesday?: { open: string; close: string }
    thursday?: { open: string; close: string }
    friday?: { open: string; close: string }
    saturday?: { open: string; close: string }
    sunday?: { open: string; close: string }
  }
}

export interface KrogerToolResponse {
  success: boolean
  output: {
    products?: KrogerProduct[]
    product?: KrogerProduct
    locations?: KrogerLocation[]
    location?: KrogerLocation
    total?: number
    error?: string
  }
}
