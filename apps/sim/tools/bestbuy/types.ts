export type BestBuyOperation =
  | 'search_products'
  | 'get_product'
  | 'search_stores'
  | 'get_store'
  | 'get_categories'
  | 'open_box'

export interface BestBuyToolParams {
  operation: BestBuyOperation
  apiKey: string
  query?: string
  sku?: string
  skus?: string[]
  storeId?: string
  zipCode?: string
  distance?: number
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  pageSize?: number
  page?: number
  sort?: string
}

export interface BestBuyProduct {
  sku: number
  name: string
  type: string
  regularPrice: number
  salePrice: number
  onSale: boolean
  url: string
  addToCartUrl: string
  image: string
  thumbnailImage: string
  largeFrontImage?: string
  mediumImage?: string
  shortDescription?: string
  longDescription?: string
  manufacturer?: string
  modelNumber?: string
  upc?: string
  categoryPath: Array<{
    id: string
    name: string
  }>
  customerReviewAverage?: number
  customerReviewCount?: number
  inStoreAvailability: boolean
  onlineAvailability: boolean
  freeShipping: boolean
  shippingCost?: number
  condition?: string
  color?: string
  features?: Array<{
    feature: string
  }>
  details?: Array<{
    name: string
    value: string
  }>
}

export interface BestBuyStore {
  storeId: number
  storeType: string
  name: string
  longName: string
  address: string
  address2?: string
  city: string
  region: string
  fullPostalCode: string
  country: string
  lat: number
  lng: number
  phone: string
  hours: string
  hoursAmPm: string
  gmtOffset: number
  services: string[]
  distance?: number
}

export interface BestBuyCategory {
  id: string
  name: string
  active: boolean
  url: string
  path: Array<{
    id: string
    name: string
  }>
  subCategories?: BestBuyCategory[]
}

export interface BestBuyOpenBoxOffer {
  sku: number
  customerReviews: {
    averageScore: number
    count: number
  }
  descriptions: {
    short: string
  }
  images: {
    standard: string
  }
  links: {
    product: string
    web: string
    addToCart: string
  }
  names: {
    title: string
  }
  offers: Array<{
    condition: string
    prices: {
      current: number
      regular: number
    }
  }>
  prices: {
    current: number
    regular: number
  }
}

export interface BestBuyToolResponse {
  success: boolean
  output: {
    products?: BestBuyProduct[]
    product?: BestBuyProduct
    stores?: BestBuyStore[]
    store?: BestBuyStore
    categories?: BestBuyCategory[]
    openBoxProducts?: BestBuyOpenBoxOffer[]
    total?: number
    totalPages?: number
    currentPage?: number
    error?: string
  }
}
