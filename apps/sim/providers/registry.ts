import { createLogger } from '@sim/logger'
import { deepseekProvider } from '@/providers/deepseek'
import { llamacppProvider } from '@/providers/llamacpp'
import { openRouterProvider } from '@/providers/openrouter'
import type { ProviderConfig, ProviderId } from '@/providers/types'
import { vllmProvider } from '@/providers/vllm'

const logger = createLogger('ProviderRegistry')

/**
 * Provider registry with only local and open-source friendly providers:
 * - llamacpp: Local llama.cpp server (llama-server/llama-cli)
 * - vllm: Self-hosted vLLM with OpenAI-compatible API
 * - openrouter: Open gateway to many models
 * - deepseek: DeepSeek AI models
 */
const providerRegistry: Partial<Record<ProviderId, ProviderConfig>> = {
  deepseek: deepseekProvider,
  vllm: vllmProvider,
  openrouter: openRouterProvider,
  llamacpp: llamacppProvider,
}

export async function getProviderExecutor(
  providerId: ProviderId
): Promise<ProviderConfig | undefined> {
  const provider = providerRegistry[providerId]
  if (!provider) {
    logger.error(`Provider not found: ${providerId}`)
    return undefined
  }
  return provider
}

export async function initializeProviders(): Promise<void> {
  for (const [id, provider] of Object.entries(providerRegistry)) {
    if (provider.initialize) {
      try {
        await provider.initialize()
        logger.info(`Initialized provider: ${id}`)
      } catch (error) {
        logger.error(`Failed to initialize ${id} provider`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }
}
