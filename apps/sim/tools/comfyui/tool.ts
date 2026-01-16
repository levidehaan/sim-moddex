import type { ToolConfig } from '@/tools/types'
import type {
  ComfyUIToolParams,
  ComfyUIToolResponse,
  ComfyUIImage,
  ComfyUIHistoryItem,
} from './types'

/**
 * Helper to make HTTP requests to ComfyUI server
 */
async function comfyRequest(
  serverUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${serverUrl.replace(/\/$/, '')}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  })
  return response
}

/**
 * Queue a prompt and optionally wait for completion
 */
async function queuePrompt(
  serverUrl: string,
  workflow: Record<string, unknown>,
  waitForCompletion: boolean,
  timeout: number
): Promise<ComfyUIToolResponse> {
  // Queue the prompt
  const queueResponse = await comfyRequest(serverUrl, '/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: workflow }),
  })

  if (!queueResponse.ok) {
    const errorText = await queueResponse.text()
    return {
      success: false,
      output: {
        error: `Failed to queue prompt: ${queueResponse.status} ${errorText}`,
      },
    }
  }

  const queueResult = await queueResponse.json()
  const promptId = queueResult.prompt_id

  if (!waitForCompletion) {
    return {
      success: true,
      output: {
        promptId,
      },
    }
  }

  // Poll for completion
  const startTime = Date.now()
  const timeoutMs = timeout * 1000

  while (Date.now() - startTime < timeoutMs) {
    const historyResponse = await comfyRequest(serverUrl, `/history/${promptId}`)
    
    if (historyResponse.ok) {
      const history = await historyResponse.json()
      const promptHistory = history[promptId] as ComfyUIHistoryItem | undefined

      if (promptHistory?.status?.completed) {
        // Extract images from outputs
        const images: ComfyUIImage[] = []
        
        for (const nodeOutput of Object.values(promptHistory.outputs)) {
          if (nodeOutput.images) {
            for (const img of nodeOutput.images) {
              images.push({
                filename: img.filename,
                subfolder: img.subfolder || '',
                type: img.type || 'output',
                url: `${serverUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${encodeURIComponent(img.type || 'output')}`,
              })
            }
          }
        }

        return {
          success: true,
          output: {
            promptId,
            images,
            history: { [promptId]: promptHistory },
          },
        }
      }
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return {
    success: false,
    output: {
      promptId,
      error: `Timeout waiting for generation to complete after ${timeout} seconds`,
    },
  }
}

/**
 * Get history for a specific prompt or all prompts
 */
async function getHistory(
  serverUrl: string,
  promptId?: string
): Promise<ComfyUIToolResponse> {
  const endpoint = promptId ? `/history/${promptId}` : '/history'
  const response = await comfyRequest(serverUrl, endpoint)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get history: ${response.status}`,
      },
    }
  }

  const history = await response.json()
  return {
    success: true,
    output: {
      history,
    },
  }
}

/**
 * Get queue status
 */
async function getQueue(serverUrl: string): Promise<ComfyUIToolResponse> {
  const response = await comfyRequest(serverUrl, '/queue')

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get queue: ${response.status}`,
      },
    }
  }

  const status = await response.json()
  return {
    success: true,
    output: {
      status,
    },
  }
}

/**
 * Get system stats
 */
async function getSystemStats(serverUrl: string): Promise<ComfyUIToolResponse> {
  const response = await comfyRequest(serverUrl, '/system_stats')

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get system stats: ${response.status}`,
      },
    }
  }

  const status = await response.json()
  return {
    success: true,
    output: {
      status,
    },
  }
}

/**
 * Upload an image to ComfyUI
 */
async function uploadImage(
  serverUrl: string,
  imageData: string,
  imageName: string
): Promise<ComfyUIToolResponse> {
  let imageBuffer: Buffer
  let contentType = 'image/png'

  // Check if it's a URL
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    const imageResponse = await fetch(imageData)
    if (!imageResponse.ok) {
      return {
        success: false,
        output: {
          error: `Failed to fetch image from URL: ${imageResponse.status}`,
        },
      }
    }
    const arrayBuffer = await imageResponse.arrayBuffer()
    imageBuffer = Buffer.from(arrayBuffer)
    contentType = imageResponse.headers.get('content-type') || 'image/png'
  } else if (imageData.startsWith('data:')) {
    // Data URL
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      return {
        success: false,
        output: {
          error: 'Invalid data URL format',
        },
      }
    }
    contentType = matches[1]
    imageBuffer = Buffer.from(matches[2], 'base64')
  } else {
    // Assume base64
    imageBuffer = Buffer.from(imageData, 'base64')
  }

  // Create form data
  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2)
  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="image"; filename="${imageName}"`,
    `Content-Type: ${contentType}`,
    '',
    '',
  ].join('\r\n')

  const formEnd = `\r\n--${boundary}--\r\n`

  const formBuffer = Buffer.concat([
    Buffer.from(formData),
    imageBuffer,
    Buffer.from(formEnd),
  ])

  const response = await comfyRequest(serverUrl, '/upload/image', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: formBuffer,
  })

  if (!response.ok) {
    const errorText = await response.text()
    return {
      success: false,
      output: {
        error: `Failed to upload image: ${response.status} ${errorText}`,
      },
    }
  }

  const result = await response.json()
  return {
    success: true,
    output: {
      uploadedFile: {
        name: result.name,
        subfolder: result.subfolder || '',
        type: result.type || 'input',
      },
    },
  }
}

/**
 * Get an image from ComfyUI
 */
async function getImage(
  serverUrl: string,
  filename: string,
  subfolder: string,
  imageType: string
): Promise<ComfyUIToolResponse> {
  const params = new URLSearchParams({
    filename,
    subfolder,
    type: imageType,
  })

  const response = await comfyRequest(serverUrl, `/view?${params.toString()}`)

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to get image: ${response.status}`,
      },
    }
  }

  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const contentType = response.headers.get('content-type') || 'image/png'

  return {
    success: true,
    output: {
      imageData: `data:${contentType};base64,${base64}`,
      images: [
        {
          filename,
          subfolder,
          type: imageType,
          url: `${serverUrl}/view?${params.toString()}`,
          data: `data:${contentType};base64,${base64}`,
        },
      ],
    },
  }
}

/**
 * Interrupt current generation
 */
async function interrupt(serverUrl: string): Promise<ComfyUIToolResponse> {
  const response = await comfyRequest(serverUrl, '/interrupt', {
    method: 'POST',
  })

  if (!response.ok) {
    return {
      success: false,
      output: {
        error: `Failed to interrupt: ${response.status}`,
      },
    }
  }

  return {
    success: true,
    output: {},
  }
}

export const comfyuiTool: ToolConfig<ComfyUIToolParams, ComfyUIToolResponse> = {
  id: 'comfyui_request',
  name: 'ComfyUI Request',
  description:
    'Send requests to a ComfyUI server to generate images, check status, upload images, and more',
  version: '1.0.0',

  params: {
    serverUrl: {
      type: 'string',
      required: true,
      description: 'ComfyUI server URL (e.g., http://127.0.0.1:8188)',
    },
    operation: {
      type: 'string',
      required: true,
      description:
        'Operation to perform: queue_prompt, get_history, get_queue, get_system_stats, upload_image, get_image, interrupt',
    },
    workflow: {
      type: 'json',
      required: false,
      description: 'ComfyUI workflow JSON (API format) for queue_prompt operation',
    },
    promptId: {
      type: 'string',
      required: false,
      description: 'Prompt ID for get_history operation',
    },
    imageData: {
      type: 'string',
      required: false,
      description: 'Image data (base64 or URL) for upload_image operation',
    },
    imageName: {
      type: 'string',
      required: false,
      description: 'Filename for uploaded image',
    },
    filename: {
      type: 'string',
      required: false,
      description: 'Filename for get_image operation',
    },
    subfolder: {
      type: 'string',
      required: false,
      description: 'Subfolder for get_image operation',
    },
    imageType: {
      type: 'string',
      required: false,
      description: 'Image type for get_image operation (output, input, temp)',
    },
    waitForCompletion: {
      type: 'boolean',
      required: false,
      description: 'Whether to wait for generation to complete (default: true)',
    },
    timeout: {
      type: 'number',
      required: false,
      description: 'Timeout in seconds for waiting (default: 300)',
    },
  },

  directExecution: async (params: ComfyUIToolParams): Promise<ComfyUIToolResponse> => {
    const { serverUrl, operation } = params

    try {
      switch (operation) {
        case 'queue_prompt':
          if (!params.workflow) {
            return {
              success: false,
              output: {
                error: 'Workflow is required for queue_prompt operation',
              },
            }
          }
          return await queuePrompt(
            serverUrl,
            params.workflow,
            params.waitForCompletion !== false,
            params.timeout || 300
          )

        case 'get_history':
          return await getHistory(serverUrl, params.promptId)

        case 'get_queue':
          return await getQueue(serverUrl)

        case 'get_system_stats':
          return await getSystemStats(serverUrl)

        case 'upload_image':
          if (!params.imageData) {
            return {
              success: false,
              output: {
                error: 'Image data is required for upload_image operation',
              },
            }
          }
          return await uploadImage(
            serverUrl,
            params.imageData,
            params.imageName || 'input.png'
          )

        case 'get_image':
          if (!params.filename) {
            return {
              success: false,
              output: {
                error: 'Filename is required for get_image operation',
              },
            }
          }
          return await getImage(
            serverUrl,
            params.filename,
            params.subfolder || '',
            params.imageType || 'output'
          )

        case 'interrupt':
          return await interrupt(serverUrl)

        default:
          return {
            success: false,
            output: {
              error: `Unknown operation: ${operation}`,
            },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation succeeded' },
    promptId: { type: 'string', description: 'Prompt ID from queue operation' },
    images: { type: 'array', description: 'Array of generated images with URLs and metadata' },
    status: { type: 'json', description: 'Queue or system status information' },
    history: { type: 'json', description: 'Prompt execution history' },
    error: { type: 'string', description: 'Error message if operation failed' },
    uploadedFile: { type: 'json', description: 'Uploaded file information' },
    imageData: { type: 'string', description: 'Base64 encoded image data' },
  },
}
