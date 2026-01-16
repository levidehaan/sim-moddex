import { BrowserUseIcon } from '@/components/icons'
import { AuthMode, type BlockConfig } from '@/blocks/types'
import type { BrowserUseResponse } from '@/tools/browser_use/types'
import { useProvidersStore } from '@/stores/providers/store'
import { useAIProviderSettingsStore } from '@/stores/settings/ai-providers'
import { getProviderIcon } from '@/providers/utils'

export const BrowserUseBlock: BlockConfig<BrowserUseResponse> = {
  type: 'browser_use',
  name: 'Browser Use',
  description: 'Run browser automation tasks',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrate Browser Use into the workflow. Can navigate the web and perform actions as if a real user was interacting with the browser.',
  docsLink: 'https://docs.sim.ai/tools/browser_use',
  category: 'tools',
  bgColor: '#E0E0E0',
  icon: BrowserUseIcon,
  subBlocks: [
    {
      id: 'task',
      title: 'Task',
      type: 'long-input',
      placeholder: 'Describe what the browser agent should do...',
      required: true,
    },
    {
      id: 'variables',
      title: 'Variables (Secrets)',
      type: 'table',
      columns: ['Key', 'Value'],
    },
    {
      id: 'model',
      title: 'Model',
      type: 'combobox',
      placeholder: 'Type or select a model...',
      required: true,
      defaultValue: () => {
        const state = useAIProviderSettingsStore.getState()
        return state.defaultModel || 'anthropic/claude-3.5-sonnet'
      },
      options: () => {
        const providersState = useProvidersStore.getState()
        const openrouterModels = providersState.providers.openrouter.models
        const llamacppModels = providersState.providers.llamacpp.models
        const vllmModels = providersState.providers.vllm.models

        const allModels = Array.from(
          new Set([...openrouterModels, ...llamacppModels, ...vllmModels])
        )

        return allModels.map((model) => {
          const icon = getProviderIcon(model)
          return { label: model, id: model, ...(icon && { icon }) }
        })
      },
    },
    {
      id: 'save_browser_data',
      title: 'Save Browser Data',
      type: 'switch',
      placeholder: 'Save browser data',
    },
    {
      id: 'apiKey',
      title: 'OpenRouter API Key',
      type: 'short-input',
      password: true,
      placeholder: 'Enter your OpenRouter API key (optional if configured in settings)',
      required: false,
    },
  ],
  tools: {
    access: ['browser_use_run_task'],
  },
  inputs: {
    task: { type: 'string', description: 'Browser automation task' },
    apiKey: { type: 'string', description: 'BrowserUse API key' },
    variables: { type: 'json', description: 'Task variables' },
    model: { type: 'string', description: 'AI model to use' },
    save_browser_data: { type: 'boolean', description: 'Save browser data' },
  },
  outputs: {
    id: { type: 'string', description: 'Task execution identifier' },
    success: { type: 'boolean', description: 'Task completion status' },
    output: { type: 'json', description: 'Task output data' },
    steps: { type: 'json', description: 'Execution steps taken' },
  },
}
