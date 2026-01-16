import { ImageIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const ImageBlock: BlockConfig = {
  type: 'image',
  name: 'Image',
  description: 'Display, embed, or pass images through workflows',
  longDescription:
    'Handle images in various formats. Display images inline, embed them as base64, convert between formats (URL, base64, data URI), or pass them to other blocks like vision models or ComfyUI. Supports receiving images from ComfyUI, Image Generator, or external URLs.',
  category: 'tools',
  bgColor: '#9333EA',
  icon: ImageIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Display Image', id: 'display' },
        { label: 'Convert Format', id: 'convert' },
        { label: 'Get Image Info', id: 'info' },
        { label: 'Pass Through', id: 'passthrough' },
      ],
      value: () => 'display',
    },
    {
      id: 'imageInput',
      title: 'Image Input',
      type: 'long-input',
      required: true,
      placeholder: 'Image URL, base64 data, or data URI...',
      description: 'Accepts URL, base64 string, or data URI (data:image/...)',
    },
    {
      id: 'displayMode',
      title: 'Display Mode',
      type: 'dropdown',
      options: [
        { label: 'Inline Preview', id: 'inline' },
        { label: 'Link Only', id: 'link' },
        { label: 'Hidden (Pass Data)', id: 'hidden' },
      ],
      value: () => 'inline',
      condition: { field: 'operation', value: 'display' },
    },
    {
      id: 'outputFormat',
      title: 'Output Format',
      type: 'dropdown',
      options: [
        { label: 'Base64 String', id: 'base64' },
        { label: 'Data URI', id: 'datauri' },
        { label: 'URL (if available)', id: 'url' },
        { label: 'All Formats', id: 'all' },
      ],
      value: () => 'all',
      condition: { field: 'operation', value: 'convert' },
    },
    {
      id: 'embedInOutput',
      title: 'Embed in Output',
      type: 'dropdown',
      options: [
        { label: 'Yes - Include base64 data', id: 'true' },
        { label: 'No - Reference only', id: 'false' },
      ],
      value: () => 'true',
      description: 'Include full image data in output for downstream blocks',
    },
    {
      id: 'maxWidth',
      title: 'Max Display Width (px)',
      type: 'short-input',
      placeholder: '800',
      description: 'Maximum width for inline display (default: 800px)',
      condition: { field: 'displayMode', value: 'inline' },
    },
  ],
  tools: {
    access: ['image_handler'],
    config: {
      tool: () => 'image_handler',
      params: (params) => ({
        operation: params.operation || 'display',
        imageInput: params.imageInput,
        displayMode: params.displayMode || 'inline',
        outputFormat: params.outputFormat || 'all',
        embedInOutput: params.embedInOutput !== 'false',
        maxWidth: params.maxWidth ? Number(params.maxWidth) : 800,
      }),
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    imageInput: { type: 'string', description: 'Image data (URL, base64, or data URI)' },
    displayMode: { type: 'string', description: 'How to display the image' },
    outputFormat: { type: 'string', description: 'Output format for conversion' },
    embedInOutput: { type: 'boolean', description: 'Include full image data in output' },
    maxWidth: { type: 'number', description: 'Maximum display width in pixels' },
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
