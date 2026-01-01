import { db } from '@sim/db'
import { workspaceBYOKKeys } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { and, eq } from 'drizzle-orm'
import { decryptSecret } from '@/lib/core/security/encryption'

const logger = createLogger('BYOKKeys')

export type BYOKProviderId = 'openai' | 'anthropic' | 'google' | 'mistral'

export interface BYOKKeyResult {
  apiKey: string
  isBYOK: true
}

export async function getBYOKKey(
  workspaceId: string | undefined | null,
  providerId: BYOKProviderId
): Promise<BYOKKeyResult | null> {
  if (!workspaceId) {
    return null
  }

  try {
    const result = await db
      .select({ encryptedApiKey: workspaceBYOKKeys.encryptedApiKey })
      .from(workspaceBYOKKeys)
      .where(
        and(
          eq(workspaceBYOKKeys.workspaceId, workspaceId),
          eq(workspaceBYOKKeys.providerId, providerId)
        )
      )
      .limit(1)

    if (!result.length) {
      return null
    }

    const { decrypted } = await decryptSecret(result[0].encryptedApiKey)
    return { apiKey: decrypted, isBYOK: true }
  } catch (error) {
    logger.error('Failed to get BYOK key', { workspaceId, providerId, error })
    return null
  }
}

/**
 * Gets the API key for self-hosted providers from AI Provider Settings.
 * This is used for OpenRouter, DeepSeek, vLLM, and llama.cpp in self-hosted deployments.
 */
async function getApiKeyFromSettings(
  provider: 'openrouter' | 'llamacpp' | 'vllm' | 'deepseek'
): Promise<string | undefined> {
  try {
    const { useAIProviderSettingsStore } = await import('@/stores/settings/ai-providers/store')
    const state = useAIProviderSettingsStore.getState()

    if (provider === 'openrouter' || provider === 'deepseek') {
      // DeepSeek uses OpenRouter as the gateway
      if (state.openrouter.enabled && state.openrouter.apiKey) {
        return state.openrouter.apiKey
      }
    } else if (provider === 'llamacpp') {
      // llama.cpp doesn't require an API key (optional auth token)
      if (state.llamacpp.enabled) {
        return state.llamacpp.apiKey || 'empty'
      }
    } else if (provider === 'vllm') {
      // vLLM doesn't require an API key (optional auth token)
      if (state.vllm.enabled) {
        return state.vllm.apiKey || 'empty'
      }
    }

    return undefined
  } catch (error) {
    logger.debug('Could not access AI Provider Settings store', { provider, error })
    return undefined
  }
}

export async function getApiKeyWithBYOK(
  provider: string,
  model: string,
  workspaceId: string | undefined | null,
  userProvidedKey?: string
): Promise<{ apiKey: string; isBYOK: boolean }> {
  const { isHosted } = await import('@/lib/core/config/feature-flags')
  const { useProvidersStore } = await import('@/stores/providers/store')

  // Handle local/self-hosted providers (llamacpp, vllm)
  const isLlamaCppModel =
    provider === 'llamacpp' ||
    useProvidersStore.getState().providers.llamacpp.models.includes(model)
  if (isLlamaCppModel) {
    const settingsKey = await getApiKeyFromSettings('llamacpp')
    return { apiKey: userProvidedKey || settingsKey || 'empty', isBYOK: false }
  }

  const isVllmModel =
    provider === 'vllm' || useProvidersStore.getState().providers.vllm.models.includes(model)
  if (isVllmModel) {
    const settingsKey = await getApiKeyFromSettings('vllm')
    return { apiKey: userProvidedKey || settingsKey || 'empty', isBYOK: false }
  }

  // Handle OpenRouter (includes DeepSeek which routes through OpenRouter)
  const isOpenRouterModel =
    provider === 'openrouter' ||
    provider === 'deepseek' ||
    model.toLowerCase().startsWith('openrouter/')
  if (isOpenRouterModel) {
    if (userProvidedKey) {
      return { apiKey: userProvidedKey, isBYOK: false }
    }
    const settingsKey = await getApiKeyFromSettings('openrouter')
    if (settingsKey) {
      logger.debug('Using OpenRouter API key from settings', { provider, model })
      return { apiKey: settingsKey, isBYOK: false }
    }
    logger.debug('No OpenRouter API key found in settings', { provider, model })
    throw new Error(
      `OpenRouter API key is required. Please configure it in Settings > AI Providers.`
    )
  }

  // Handle hosted providers (OpenAI, Anthropic, Google, Mistral)
  const isOpenAIModel = provider === 'openai'
  const isClaudeModel = provider === 'anthropic'
  const isGeminiModel = provider === 'google'
  const isMistralModel = provider === 'mistral'

  const byokProviderId = isGeminiModel ? 'google' : (provider as BYOKProviderId)

  if (
    isHosted &&
    workspaceId &&
    (isOpenAIModel || isClaudeModel || isGeminiModel || isMistralModel)
  ) {
    const { getHostedModels } = await import('@/providers/models')
    const hostedModels = getHostedModels()
    const isModelHosted = hostedModels.some((m) => m.toLowerCase() === model.toLowerCase())

    logger.debug('BYOK check', { provider, model, workspaceId, isHosted, isModelHosted })

    if (isModelHosted || isMistralModel) {
      const byokResult = await getBYOKKey(workspaceId, byokProviderId)
      if (byokResult) {
        logger.info('Using BYOK key', { provider, model, workspaceId })
        return byokResult
      }
      logger.debug('No BYOK key found, falling back', { provider, model, workspaceId })

      if (isModelHosted) {
        try {
          const { getRotatingApiKey } = await import('@/lib/core/config/api-keys')
          const serverKey = getRotatingApiKey(isGeminiModel ? 'gemini' : provider)
          return { apiKey: serverKey, isBYOK: false }
        } catch (_error) {
          if (userProvidedKey) {
            return { apiKey: userProvidedKey, isBYOK: false }
          }
          throw new Error(`No API key available for ${provider} ${model}`)
        }
      }
    }
  }

  if (!userProvidedKey) {
    logger.debug('BYOK not applicable, no user key provided', {
      provider,
      model,
      workspaceId,
      isHosted,
    })
    throw new Error(`API key is required for ${provider} ${model}`)
  }

  return { apiKey: userProvidedKey, isBYOK: false }
}
