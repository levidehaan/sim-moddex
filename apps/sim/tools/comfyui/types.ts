/**
 * ComfyUI Tool Types
 */

export type ComfyUIOperation =
  | 'queue_prompt'
  | 'get_history'
  | 'get_queue'
  | 'get_system_stats'
  | 'upload_image'
  | 'get_image'
  | 'interrupt'

export interface ComfyUIToolParams {
  /** ComfyUI server URL */
  serverUrl: string
  /** Operation to perform */
  operation: ComfyUIOperation
  /** Workflow JSON for queue_prompt operation */
  workflow?: Record<string, unknown>
  /** Prompt ID for get_history operation */
  promptId?: string
  /** Image data (base64 or URL) for upload_image operation */
  imageData?: string
  /** Filename for uploaded image */
  imageName?: string
  /** Filename for get_image operation */
  filename?: string
  /** Subfolder for get_image operation */
  subfolder?: string
  /** Image type for get_image operation */
  imageType?: 'output' | 'input' | 'temp'
  /** Whether to wait for generation to complete */
  waitForCompletion?: boolean
  /** Timeout in seconds for waiting */
  timeout?: number
}

export interface ComfyUIImage {
  filename: string
  subfolder: string
  type: string
  url?: string
  data?: string
}

export interface ComfyUIQueueStatus {
  queue_running: Array<[string, number, Record<string, unknown>, Record<string, unknown>]>
  queue_pending: Array<[string, number, Record<string, unknown>, Record<string, unknown>]>
}

export interface ComfyUISystemStats {
  system: {
    os: string
    python_version: string
    embedded_python: boolean
  }
  devices: Array<{
    name: string
    type: string
    index: number
    vram_total: number
    vram_free: number
    torch_vram_total: number
    torch_vram_free: number
  }>
}

export interface ComfyUIHistoryItem {
  prompt: [number, string, Record<string, unknown>, Record<string, unknown>]
  outputs: Record<string, { images?: ComfyUIImage[] }>
  status: {
    status_str: string
    completed: boolean
    messages: Array<[string, Record<string, unknown>]>
  }
}

export interface ComfyUIToolResponse {
  success: boolean
  output: {
    promptId?: string
    images?: ComfyUIImage[]
    status?: ComfyUIQueueStatus | ComfyUISystemStats
    history?: Record<string, ComfyUIHistoryItem>
    error?: string
    uploadedFile?: {
      name: string
      subfolder: string
      type: string
    }
    imageData?: string
  }
}
