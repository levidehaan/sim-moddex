import { Cpu } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const ComfyUIBlock: BlockConfig = {
  type: 'comfyui',
  name: 'ComfyUI',
  description: 'Generate images using ComfyUI workflows',
  longDescription:
    'Connect to a ComfyUI server to generate images using custom workflows. ComfyUI is a powerful node-based interface for Stable Diffusion that allows complex image generation pipelines. Send workflow JSON, queue prompts, and retrieve generated images.',
  category: 'tools',
  bgColor: '#2D5A27',
  icon: Cpu,
  subBlocks: [
    {
      id: 'serverUrl',
      title: 'Server URL',
      type: 'short-input',
      required: true,
      placeholder: 'http://127.0.0.1:8188',
      description: 'ComfyUI server address (default: http://127.0.0.1:8188)',
    },
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Queue Prompt (Generate)', id: 'queue_prompt' },
        { label: 'Get History', id: 'get_history' },
        { label: 'Get Queue Status', id: 'get_queue' },
        { label: 'Get System Stats', id: 'get_system_stats' },
        { label: 'Upload Image', id: 'upload_image' },
        { label: 'Get Image', id: 'get_image' },
        { label: 'Interrupt Generation', id: 'interrupt' },
      ],
      value: () => 'queue_prompt',
    },
    {
      id: 'workflow',
      title: 'Workflow JSON',
      type: 'code',
      placeholder: 'Paste your ComfyUI workflow JSON here (API format)...',
      description: 'Export workflow from ComfyUI using "Save (API Format)" option',
      condition: { field: 'operation', value: 'queue_prompt' },
    },
    {
      id: 'promptId',
      title: 'Prompt ID',
      type: 'short-input',
      placeholder: 'Enter prompt ID from queue response',
      condition: { field: 'operation', value: 'get_history' },
    },
    {
      id: 'imageData',
      title: 'Image Data',
      type: 'long-input',
      placeholder: 'Base64 encoded image or image URL',
      condition: { field: 'operation', value: 'upload_image' },
    },
    {
      id: 'imageName',
      title: 'Image Filename',
      type: 'short-input',
      placeholder: 'e.g., input.png',
      condition: { field: 'operation', value: 'upload_image' },
    },
    {
      id: 'filename',
      title: 'Filename',
      type: 'short-input',
      placeholder: 'e.g., ComfyUI_00001_.png',
      condition: { field: 'operation', value: 'get_image' },
    },
    {
      id: 'subfolder',
      title: 'Subfolder',
      type: 'short-input',
      placeholder: 'Leave empty for root output folder',
      condition: { field: 'operation', value: 'get_image' },
    },
    {
      id: 'imageType',
      title: 'Image Type',
      type: 'dropdown',
      options: [
        { label: 'Output', id: 'output' },
        { label: 'Input', id: 'input' },
        { label: 'Temp', id: 'temp' },
      ],
      value: () => 'output',
      condition: { field: 'operation', value: 'get_image' },
    },
    {
      id: 'waitForCompletion',
      title: 'Wait for Completion',
      type: 'dropdown',
      options: [
        { label: 'Yes - Wait and return images', id: 'true' },
        { label: 'No - Return prompt ID immediately', id: 'false' },
      ],
      value: () => 'true',
      description: 'Wait for generation to complete before returning',
      condition: { field: 'operation', value: 'queue_prompt' },
    },
    {
      id: 'timeout',
      title: 'Timeout (seconds)',
      type: 'short-input',
      placeholder: '300',
      description: 'Maximum time to wait for generation (default: 300s)',
      condition: { field: 'operation', value: 'queue_prompt' },
    },
  ],
  tools: {
    access: ['comfyui_request'],
    config: {
      tool: () => 'comfyui_request',
      params: (params) => {
        const result: Record<string, unknown> = {
          serverUrl: params.serverUrl || 'http://127.0.0.1:8188',
          operation: params.operation || 'queue_prompt',
        }

        if (params.operation === 'queue_prompt') {
          if (params.workflow) {
            try {
              result.workflow = typeof params.workflow === 'string' 
                ? JSON.parse(params.workflow) 
                : params.workflow
            } catch {
              result.workflow = params.workflow
            }
          }
          result.waitForCompletion = params.waitForCompletion !== 'false'
          if (params.timeout) {
            result.timeout = Number(params.timeout)
          }
        }

        if (params.operation === 'get_history' && params.promptId) {
          result.promptId = params.promptId
        }

        if (params.operation === 'upload_image') {
          result.imageData = params.imageData
          result.imageName = params.imageName || 'input.png'
        }

        if (params.operation === 'get_image') {
          result.filename = params.filename
          result.subfolder = params.subfolder || ''
          result.imageType = params.imageType || 'output'
        }

        return result
      },
    },
  },
  inputs: {
    serverUrl: { type: 'string', description: 'ComfyUI server URL' },
    operation: { type: 'string', description: 'Operation to perform' },
    workflow: { type: 'json', description: 'ComfyUI workflow JSON (API format)' },
    promptId: { type: 'string', description: 'Prompt ID for history lookup' },
    imageData: { type: 'string', description: 'Image data for upload (base64 or URL)' },
    imageName: { type: 'string', description: 'Filename for uploaded image' },
    filename: { type: 'string', description: 'Filename to retrieve' },
    subfolder: { type: 'string', description: 'Subfolder path' },
    imageType: { type: 'string', description: 'Image type (output, input, temp)' },
    waitForCompletion: { type: 'boolean', description: 'Wait for generation to complete' },
    timeout: { type: 'number', description: 'Timeout in seconds' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the operation succeeded' },
    promptId: { type: 'string', description: 'Prompt ID from queue operation' },
    images: { type: 'array', description: 'Array of generated image URLs or data' },
    status: { type: 'json', description: 'Queue or system status information' },
    history: { type: 'json', description: 'Prompt execution history' },
    error: { type: 'string', description: 'Error message if operation failed' },
  },
}
