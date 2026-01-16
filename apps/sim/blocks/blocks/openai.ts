import { OpenAIIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import { useAIProviderSettingsStore } from '@/stores/settings/ai-providers'

export const OpenAIBlock: BlockConfig = {
  type: 'openai',
  name: 'Embeddings',
  description: 'Generate Open AI embeddings',
  authMode: AuthMode.ApiKey,
  longDescription: 'Integrate Embeddings into the workflow. Can generate embeddings from text.',
  category: 'tools',
  docsLink: 'https://docs.sim.ai/tools/openai',
  bgColor: '#10a37f',
  icon: OpenAIIcon,
  subBlocks: [
    {
      id: 'input',
      title: 'Input Text',
      type: 'long-input',
      placeholder: 'Enter text to generate embeddings for',
      required: true,
    },
    {
      id: 'model',
      title: 'Model',
      type: 'combobox',
      placeholder: 'Type or select an embedding model...',
      required: true,
      defaultValue: () => 'openai/text-embedding-3-small',
      options: () => [
        { label: 'openai/text-embedding-3-small', id: 'openai/text-embedding-3-small' },
        { label: 'openai/text-embedding-3-large', id: 'openai/text-embedding-3-large' },
        { label: 'openai/text-embedding-ada-002', id: 'openai/text-embedding-ada-002' },
        { label: 'voyage/voyage-3', id: 'voyage/voyage-3' },
        { label: 'voyage/voyage-3-lite', id: 'voyage/voyage-3-lite' },
        { label: 'cohere/embed-english-v3.0', id: 'cohere/embed-english-v3.0' },
        { label: 'cohere/embed-multilingual-v3.0', id: 'cohere/embed-multilingual-v3.0' },
      ],
    },
    {
      id: 'apiKey',
      title: 'OpenRouter API Key',
      type: 'short-input',
      placeholder: 'Enter your OpenRouter API key (optional if configured in settings)',
      password: true,
      required: false,
    },
  ],
  tools: {
    access: ['openai_embeddings'],
  },
  inputs: {
    input: { type: 'string', description: 'Text to embed' },
    model: { type: 'string', description: 'Embedding model' },
    apiKey: { type: 'string', description: 'OpenAI API key' },
  },
  outputs: {
    embeddings: { type: 'json', description: 'Generated embeddings' },
    model: { type: 'string', description: 'Model used' },
    usage: { type: 'json', description: 'Token usage' },
  },
}
