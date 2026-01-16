import { ImageIcon } from '@/components/icons'
import { AuthMode, type BlockConfig } from '@/blocks/types'
import type { DalleResponse } from '@/tools/openai/types'
import { useProvidersStore } from '@/stores/providers/store'
import { useAIProviderSettingsStore } from '@/stores/settings/ai-providers'
import { getProviderIcon } from '@/providers/utils'

export const ImageGeneratorBlock: BlockConfig<DalleResponse> = {
  type: 'image_generator',
  name: 'Image Generator',
  description: 'Generate images with AI',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Generate images using various AI models including DALL-E 3, Flux, Stable Diffusion, and more via OpenRouter. Supports text-to-image generation with customizable parameters.',
  docsLink: 'https://docs.sim.ai/tools/image_generator',
  category: 'tools',
  bgColor: '#4D5FFF',
  icon: ImageIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Text to Image', id: 'text_to_image' },
        { label: 'Image to Image (Modify)', id: 'image_to_image' },
        { label: 'Image + Text to Image (Reference)', id: 'image_reference' },
      ],
      value: () => 'text_to_image',
      description: 'Generation mode',
    },
    {
      id: 'model',
      title: 'Model',
      type: 'combobox',
      placeholder: 'Type or select an image model...',
      required: true,
      defaultValue: () => {
        const state = useAIProviderSettingsStore.getState()
        return state.defaultModel || 'black-forest-labs/flux-1.1-pro'
      },
      options: () => {
        const providersState = useProvidersStore.getState()
        const openrouterModels = providersState.providers.openrouter.models
        
        // Filter for image generation models
        const imageModels = openrouterModels.filter(model => {
          const lowerModel = model.toLowerCase()
          return lowerModel.includes('flux') ||
                 lowerModel.includes('dall-e') ||
                 lowerModel.includes('stable-diffusion') ||
                 lowerModel.includes('sdxl') ||
                 lowerModel.includes('midjourney') ||
                 lowerModel.includes('imagen') ||
                 lowerModel.includes('playground') ||
                 lowerModel.includes('ideogram') ||
                 lowerModel.includes('gemini')
        })

        return imageModels.map((model) => {
          const icon = getProviderIcon(model)
          return { label: model, id: model, ...(icon && { icon }) }
        })
      },
    },
    {
      id: 'inputImage',
      title: 'Input Image',
      type: 'long-input',
      required: true,
      placeholder: 'Image URL, base64, or data URI...',
      description: 'Source image to modify or use as reference',
      condition: { field: 'operation', value: ['image_to_image', 'image_reference'] },
    },
    {
      id: 'imageStrength',
      title: 'Image Strength',
      type: 'short-input',
      placeholder: '0.8',
      description: 'How much to preserve the input image (0.0-1.0, higher = more preservation)',
      condition: { field: 'operation', value: 'image_to_image' },
    },
    {
      id: 'prompt',
      title: 'Prompt',
      type: 'long-input',
      required: true,
      placeholder: 'Describe the image you want to generate in detail...',
      description: 'Be specific about style, composition, colors, lighting, etc.',
    },
    {
      id: 'negativePrompt',
      title: 'Negative Prompt (Optional)',
      type: 'long-input',
      placeholder: 'What to avoid in the image...',
      description: 'Describe elements you want to exclude (supported by some models)',
    },
    {
      id: 'width',
      title: 'Width',
      type: 'short-input',
      placeholder: '1024',
      description: 'Image width in pixels (model-dependent)',
    },
    {
      id: 'height',
      title: 'Height',
      type: 'short-input',
      placeholder: '1024',
      description: 'Image height in pixels (model-dependent)',
    },
    {
      id: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'dropdown',
      options: [
        { label: 'Square (1:1)', id: '1:1' },
        { label: 'Portrait (2:3)', id: '2:3' },
        { label: 'Portrait (9:16)', id: '9:16' },
        { label: 'Landscape (3:2)', id: '3:2' },
        { label: 'Landscape (16:9)', id: '16:9' },
        { label: 'Custom (use width/height)', id: 'custom' },
      ],
      value: () => '1:1',
      description: 'Aspect ratio (overrides width/height for some models)',
    },
    {
      id: 'steps',
      title: 'Steps',
      type: 'short-input',
      placeholder: '20',
      description: 'Number of diffusion steps (higher = better quality, slower)',
    },
    {
      id: 'seed',
      title: 'Seed (Optional)',
      type: 'short-input',
      placeholder: 'Random',
      description: 'Seed for reproducible results',
    },
    {
      id: 'apiKey',
      title: 'OpenRouter API Key',
      type: 'short-input',
      password: true,
      placeholder: 'Enter your OpenRouter API key (optional if configured in settings)',
      required: false,
      description: 'Get your API key from openrouter.ai',
    },
  ],
  tools: {
    access: ['openrouter_image_generation'],
    config: {
      tool: () => 'openrouter_image_generation',
      params: (params) => {
        if (!params.prompt) {
          throw new Error('Prompt is required')
        }

        const operation = params.operation || 'text_to_image'
        if ((operation === 'image_to_image' || operation === 'image_reference') && !params.inputImage) {
          throw new Error('Input image is required for image-to-image operations')
        }

        const result: Record<string, unknown> = {
          prompt: params.prompt,
          model: params.model || 'black-forest-labs/flux-1.1-pro',
          operation,
        }

        if (params.apiKey) result.apiKey = params.apiKey
        if (params.inputImage) result.inputImage = params.inputImage
        if (params.imageStrength) result.imageStrength = Number(params.imageStrength)
        if (params.negativePrompt) result.negativePrompt = params.negativePrompt
        if (params.width) result.width = Number(params.width)
        if (params.height) result.height = Number(params.height)
        if (params.aspectRatio && params.aspectRatio !== 'custom') {
          result.aspectRatio = params.aspectRatio
        }
        if (params.steps) result.steps = Number(params.steps)
        if (params.seed) result.seed = Number(params.seed)

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Generation operation mode' },
    inputImage: { type: 'string', description: 'Input image for image-to-image operations' },
    imageStrength: { type: 'number', description: 'Image preservation strength (0.0-1.0)' },
    prompt: { type: 'string', description: 'Image description prompt' },
    negativePrompt: { type: 'string', description: 'Negative prompt (what to avoid)' },
    model: { type: 'string', description: 'Image generation model' },
    width: { type: 'number', description: 'Image width in pixels' },
    height: { type: 'number', description: 'Image height in pixels' },
    aspectRatio: { type: 'string', description: 'Aspect ratio' },
    steps: { type: 'number', description: 'Number of diffusion steps' },
    seed: { type: 'number', description: 'Random seed for reproducibility' },
    apiKey: { type: 'string', description: 'OpenRouter API key' },
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
