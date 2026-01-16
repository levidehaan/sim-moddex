export interface OpenRouterImageGenerationParams {
  model: string
  prompt: string
  operation?: 'text_to_image' | 'image_to_image' | 'image_reference'
  inputImage?: string
  imageStrength?: number
  negativePrompt?: string
  width?: number
  height?: number
  aspectRatio?: string
  steps?: number
  seed?: number
  apiKey?: string
}

export interface OpenRouterImageGenerationResponse {
  success: boolean
  output: {
    imageUrl?: string
    imageBase64?: string
    imageDataUri?: string
    model?: string
    seed?: number
    error?: string
  }
}
