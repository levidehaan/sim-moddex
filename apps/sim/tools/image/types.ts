export interface ImageHandlerParams {
  operation: 'display' | 'convert' | 'info' | 'passthrough'
  imageInput: string
  displayMode?: 'inline' | 'link' | 'hidden'
  outputFormat?: 'base64' | 'datauri' | 'url' | 'all'
  embedInOutput?: boolean
  maxWidth?: number
}

export interface ImageInfo {
  mimeType: string
  width?: number
  height?: number
  size: number
  format: string
}

export interface ImageHandlerResponse {
  success: boolean
  output: {
    imageUrl?: string
    imageBase64?: string
    imageDataUri?: string
    mimeType?: string
    width?: number
    height?: number
    size?: number
    format?: string
    error?: string
  }
}
