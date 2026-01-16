import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type { OpenRouterImageGenerationParams, OpenRouterImageGenerationResponse } from './image_generation_types'
import { getApiKey } from '@/providers/utils'

const logger = createLogger('OpenRouterImageGeneration')

export const openrouterImageGenerationTool: ToolConfig<
  OpenRouterImageGenerationParams,
  OpenRouterImageGenerationResponse
> = {
  id: 'openrouter_image_generation',
  name: 'OpenRouter Image Generation',
  description: 'Generate images using various AI models via OpenRouter',
  version: '1.0.0',

  request: {
    url: 'https://openrouter.ai/api/v1/images/generations',
    method: 'POST',
    headers: (params) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey || ''}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://sim.ai',
      'X-Title': 'Sim Studio',
    }),
    body: (params) => {
      const body: Record<string, unknown> = {
        model: params.model,
        prompt: params.prompt,
      }
      if (params.negativePrompt) body.negative_prompt = params.negativePrompt
      if (params.width) body.width = params.width
      if (params.height) body.height = params.height
      if (params.aspectRatio) body.aspect_ratio = params.aspectRatio
      if (params.steps) body.steps = params.steps
      if (params.seed) body.seed = params.seed
      return body
    },
  },

  params: {
    model: {
      type: 'string',
      required: true,
      description: 'Image generation model to use',
    },
    prompt: {
      type: 'string',
      required: true,
      description: 'Text description of the image to generate',
    },
    operation: {
      type: 'string',
      required: false,
      description: 'Operation mode: text_to_image, image_to_image, or image_reference',
    },
    inputImage: {
      type: 'string',
      required: false,
      description: 'Input image for image-to-image operations (URL, base64, or data URI)',
    },
    imageStrength: {
      type: 'number',
      required: false,
      description: 'Image preservation strength for image-to-image (0.0-1.0)',
    },
    negativePrompt: {
      type: 'string',
      required: false,
      description: 'What to avoid in the generated image',
    },
    width: {
      type: 'number',
      required: false,
      description: 'Image width in pixels',
    },
    height: {
      type: 'number',
      required: false,
      description: 'Image height in pixels',
    },
    aspectRatio: {
      type: 'string',
      required: false,
      description: 'Aspect ratio (e.g., 1:1, 16:9)',
    },
    steps: {
      type: 'number',
      required: false,
      description: 'Number of diffusion steps',
    },
    seed: {
      type: 'number',
      required: false,
      description: 'Random seed for reproducibility',
    },
    apiKey: {
      type: 'string',
      required: false,
      description: 'OpenRouter API key',
    },
  },

  directExecution: async (
    params: OpenRouterImageGenerationParams
  ): Promise<OpenRouterImageGenerationResponse> => {
    try {
      const { model, prompt, operation = 'text_to_image', inputImage, imageStrength, negativePrompt, width, height, aspectRatio, steps, seed } = params

      // Get API key
      const apiKey = params.apiKey || getApiKey('openrouter', model, params.apiKey)
      if (!apiKey) {
        return {
          success: false,
          output: {
            error: 'OpenRouter API key is required. Configure it in Settings > AI Providers.',
          },
        }
      }

      // Parse input image if provided
      let imageBase64: string | undefined
      if (inputImage && (operation === 'image_to_image' || operation === 'image_reference')) {
        try {
          // Handle data URI
          if (inputImage.startsWith('data:')) {
            const matches = inputImage.match(/^data:[^;]+;base64,(.+)$/)
            if (matches) {
              imageBase64 = matches[1]
            }
          }
          // Handle URL
          else if (inputImage.startsWith('http://') || inputImage.startsWith('https://')) {
            const response = await fetch(inputImage)
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer()
              imageBase64 = Buffer.from(arrayBuffer).toString('base64')
            }
          }
          // Assume raw base64
          else {
            imageBase64 = inputImage
          }
        } catch (error) {
          logger.warn('Failed to parse input image:', error)
        }
      }

      // Build request body
      const requestBody: Record<string, unknown> = {
        model,
        prompt,
      }

      // Add image for image-to-image operations
      if (imageBase64) {
        if (operation === 'image_to_image') {
          requestBody.image = imageBase64
          if (imageStrength !== undefined) {
            requestBody.strength = imageStrength
          }
        } else if (operation === 'image_reference') {
          requestBody.image_url = `data:image/png;base64,${imageBase64}`
        }
      }

      if (negativePrompt) requestBody.negative_prompt = negativePrompt
      if (width) requestBody.width = width
      if (height) requestBody.height = height
      if (aspectRatio) requestBody.aspect_ratio = aspectRatio
      if (steps) requestBody.steps = steps
      if (seed) requestBody.seed = seed

      logger.info(`Generating image with model: ${model}`)

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://sim.ai',
          'X-Title': 'Sim Studio',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`OpenRouter API error: ${response.status} ${errorText}`)
        return {
          success: false,
          output: {
            error: `OpenRouter API error: ${response.status} ${errorText}`,
          },
        }
      }

      const data = await response.json()

      // Extract image data
      let imageUrl: string | undefined
      let outputImageBase64: string | undefined

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const imageData = data.data[0]

        if (imageData.url) {
          imageUrl = imageData.url
          logger.info('Received image URL from OpenRouter')

          // Fetch and convert to base64
          try {
            const imageResponse = await fetch(imageUrl!)
            if (imageResponse.ok) {
              const arrayBuffer = await imageResponse.arrayBuffer()
              outputImageBase64 = Buffer.from(arrayBuffer).toString('base64')
              logger.info(`Converted image to base64, size: ${outputImageBase64.length} chars`)
            }
          } catch (error) {
            logger.warn('Failed to convert image to base64:', error)
          }
        } else if (imageData.b64_json) {
          outputImageBase64 = imageData.b64_json
          logger.info('Received base64 image from OpenRouter')
        }
      }

      if (!imageUrl && !outputImageBase64) {
        return {
          success: false,
          output: {
            error: 'No image data received from OpenRouter',
          },
        }
      }

      // Build data URI
      const imageDataUri = outputImageBase64 ? `data:image/png;base64,${outputImageBase64}` : undefined

      return {
        success: true,
        output: {
          imageUrl,
          imageBase64: outputImageBase64,
          imageDataUri,
          model,
          seed,
        },
      }
    } catch (error) {
      logger.error('Image generation error:', error)
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether generation succeeded' },
    imageUrl: { type: 'string', description: 'Generated image URL' },
    imageBase64: { type: 'string', description: 'Base64 encoded image data' },
    imageDataUri: { type: 'string', description: 'Data URI format' },
    model: { type: 'string', description: 'Model used for generation' },
    seed: { type: 'number', description: 'Seed used (if specified)' },
    error: { type: 'string', description: 'Error message if generation failed' },
  },
}
