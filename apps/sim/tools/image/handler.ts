import { createLogger } from '@sim/logger'
import type { ToolConfig } from '@/tools/types'
import type { ImageHandlerParams, ImageHandlerResponse, ImageInfo } from './types'

const logger = createLogger('ImageHandler')

/**
 * Parse image input and extract metadata
 */
async function parseImageInput(input: string): Promise<{
  base64: string
  mimeType: string
  url?: string
}> {
  // Data URI format: data:image/png;base64,iVBORw0KG...
  if (input.startsWith('data:')) {
    const matches = input.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid data URI format')
    }
    return {
      base64: matches[2],
      mimeType: matches[1],
    }
  }

  // URL format
  if (input.startsWith('http://') || input.startsWith('https://')) {
    try {
      const response = await fetch(input)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = response.headers.get('content-type') || 'image/png'
      return {
        base64,
        mimeType,
        url: input,
      }
    } catch (error) {
      throw new Error(`Failed to fetch image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Assume raw base64
  // Try to detect image type from magic bytes
  let mimeType = 'image/png'
  try {
    const buffer = Buffer.from(input, 'base64')
    const header = buffer.slice(0, 4).toString('hex')
    
    if (header.startsWith('89504e47')) {
      mimeType = 'image/png'
    } else if (header.startsWith('ffd8ff')) {
      mimeType = 'image/jpeg'
    } else if (header.startsWith('47494638')) {
      mimeType = 'image/gif'
    } else if (header.startsWith('52494646')) {
      mimeType = 'image/webp'
    }
  } catch {
    // Keep default
  }

  return {
    base64: input,
    mimeType,
  }
}

/**
 * Get image dimensions and metadata
 */
async function getImageInfo(base64: string, mimeType: string): Promise<ImageInfo> {
  const buffer = Buffer.from(base64, 'base64')
  const size = buffer.length
  const format = mimeType.split('/')[1] || 'unknown'

  const info: ImageInfo = {
    mimeType,
    size,
    format,
  }

  // Try to extract dimensions (simplified - would need proper image parsing library for production)
  try {
    if (mimeType === 'image/png') {
      // PNG dimensions are at bytes 16-23
      if (buffer.length >= 24) {
        info.width = buffer.readUInt32BE(16)
        info.height = buffer.readUInt32BE(20)
      }
    } else if (mimeType === 'image/jpeg') {
      // JPEG is more complex, skip for now
      // Would need proper JPEG parser
    }
  } catch (error) {
    logger.warn('Could not extract image dimensions:', error)
  }

  return info
}

export const imageHandlerTool: ToolConfig<ImageHandlerParams, ImageHandlerResponse> = {
  id: 'image_handler',
  name: 'Image Handler',
  description: 'Handle images in various formats - display, convert, or extract metadata',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform: display, convert, info, or passthrough',
    },
    imageInput: {
      type: 'string',
      required: true,
      description: 'Image data (URL, base64, or data URI)',
    },
    displayMode: {
      type: 'string',
      required: false,
      description: 'Display mode: inline, link, or hidden',
    },
    outputFormat: {
      type: 'string',
      required: false,
      description: 'Output format: base64, datauri, url, or all',
    },
    embedInOutput: {
      type: 'boolean',
      required: false,
      description: 'Include full image data in output',
    },
    maxWidth: {
      type: 'number',
      required: false,
      description: 'Maximum display width in pixels',
    },
  },

  directExecution: async (params: ImageHandlerParams): Promise<ImageHandlerResponse> => {
    try {
      const { imageInput, operation, outputFormat = 'all', embedInOutput = true } = params

      // Parse input
      const parsed = await parseImageInput(imageInput)
      const info = await getImageInfo(parsed.base64, parsed.mimeType)

      // Build data URI
      const dataUri = `data:${parsed.mimeType};base64,${parsed.base64}`

      // Build response based on operation
      const output: ImageHandlerResponse['output'] = {
        mimeType: parsed.mimeType,
        size: info.size,
        format: info.format,
      }

      if (info.width) output.width = info.width
      if (info.height) output.height = info.height

      // Add image data based on format and embed settings
      if (embedInOutput || operation === 'convert' || operation === 'passthrough') {
        if (outputFormat === 'base64' || outputFormat === 'all') {
          output.imageBase64 = parsed.base64
        }
        if (outputFormat === 'datauri' || outputFormat === 'all') {
          output.imageDataUri = dataUri
        }
        if ((outputFormat === 'url' || outputFormat === 'all') && parsed.url) {
          output.imageUrl = parsed.url
        }
      }

      // For display operation, always include data URI for rendering
      if (operation === 'display') {
        output.imageDataUri = dataUri
        if (parsed.url) {
          output.imageUrl = parsed.url
        }
      }

      logger.info(`Image handler completed: ${operation}, format: ${info.format}, size: ${info.size} bytes`)

      return {
        success: true,
        output,
      }
    } catch (error) {
      logger.error('Image handler error:', error)
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether operation succeeded' },
    imageUrl: { type: 'string', description: 'Image URL (if available)' },
    imageBase64: { type: 'string', description: 'Base64 encoded image data' },
    imageDataUri: { type: 'string', description: 'Data URI format' },
    mimeType: { type: 'string', description: 'Image MIME type' },
    width: { type: 'number', description: 'Image width in pixels' },
    height: { type: 'number', description: 'Image height in pixels' },
    size: { type: 'number', description: 'Image size in bytes' },
    format: { type: 'string', description: 'Image format (png, jpg, etc.)' },
    error: { type: 'string', description: 'Error message if operation failed' },
  },
}
