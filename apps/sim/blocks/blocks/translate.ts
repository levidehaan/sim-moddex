import { TranslateIcon } from '@/components/icons'
import { isHosted } from '@/lib/core/config/feature-flags'
import { AuthMode, type BlockConfig } from '@/blocks/types'
import { getHostedModels, getProviderIcon } from '@/providers/utils'
import { useProvidersStore } from '@/stores/providers/store'

const getCurrentLlamaCppModels = () => {
  return useProvidersStore.getState().providers.llamacpp.models
}

const getCurrentVLLMModels = () => {
  return useProvidersStore.getState().providers.vllm.models
}

const getTranslationPrompt = (targetLanguage: string) =>
  `Translate the following text into ${targetLanguage || 'English'}. Output ONLY the translated text with no additional commentary, explanations, or notes.`

export const TranslateBlock: BlockConfig = {
  type: 'translate',
  name: 'Translate',
  description: 'Translate text to any language',
  authMode: AuthMode.ApiKey,
  longDescription: 'Integrate Translate into the workflow. Can translate text to any language.',
  docsLink: 'https://docs.sim.ai/tools/translate',
  category: 'tools',
  bgColor: '#FF4B4B',
  icon: TranslateIcon,
  subBlocks: [
    {
      id: 'context',
      title: 'Text to Translate',
      type: 'long-input',
      placeholder: 'Enter the text you want to translate',
      required: true,
    },
    {
      id: 'targetLanguage',
      title: 'Translate To',
      type: 'short-input',
      placeholder: 'Enter language (e.g. Spanish, French, etc.)',
      required: true,
    },
    {
      id: 'model',
      title: 'Model',
      type: 'combobox',
      placeholder: 'Type or select a model...',
      required: true,
      options: () => {
        const providersState = useProvidersStore.getState()
        const baseModels = providersState.providers.base.models
        const llamacppModels = providersState.providers.llamacpp.models
        const openrouterModels = providersState.providers.openrouter.models
        const allModels = Array.from(new Set([...baseModels, ...llamacppModels, ...openrouterModels]))

        return allModels.map((model) => {
          const icon = getProviderIcon(model)
          return { label: model, id: model, ...(icon && { icon }) }
        })
      },
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your API key',
      password: true,
      connectionDroppable: false,
      required: true,
      // Hide API key for hosted models, llama.cpp models, and vLLM models
      condition: isHosted
        ? {
            field: 'model',
            value: getHostedModels(),
            not: true, // Show for all models EXCEPT hosted models
          }
        : () => ({
            field: 'model',
            value: [...getCurrentLlamaCppModels(), ...getCurrentVLLMModels()],
            not: true, // Show for all models EXCEPT llama.cpp and vLLM models
          }),
    },
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'code',
      hidden: true,
      value: (params: Record<string, any>) => {
        return getTranslationPrompt(params.targetLanguage || 'English')
      },
    },
  ],
  tools: {
    access: ['llm_chat'],
    config: {
      tool: () => 'llm_chat',
      params: (params: Record<string, any>) => ({
        model: params.model,
        systemPrompt: getTranslationPrompt(params.targetLanguage || 'English'),
        context: params.context,
        apiKey: params.apiKey,
      }),
    },
  },
  inputs: {
    context: { type: 'string', description: 'Text to translate' },
    targetLanguage: { type: 'string', description: 'Target language' },
    apiKey: { type: 'string', description: 'Provider API key' },
    systemPrompt: { type: 'string', description: 'Translation instructions' },
  },
  outputs: {
    content: { type: 'string', description: 'Translated text' },
    model: { type: 'string', description: 'Model used' },
    tokens: { type: 'json', description: 'Token usage' },
  },
}
