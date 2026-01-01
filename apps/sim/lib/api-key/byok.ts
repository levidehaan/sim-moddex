import { db } from '@sim/db'
import { settings, workspaceBYOKKeys } from '@sim/db/schema'
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
 * AI Provider settings structure stored in the database
 */
interface AIProviderSettings {
  openrouter?: {
    apiKey?: string
    enabled?: boolean
  }
  llamacpp?: {
    baseUrl?: string
    apiKey?: string
    enabled?: boolean
  }
  vllm?: {
    baseUrl?: string
    apiKey?: string
    enabled?: boolean
  }
  defaultModel?: string
}

/**
 * Gets AI provider settings from the database.
 * This is the server-side method that reads directly from the settings table.
 */
async function getAIProviderSettingsFromDB(userId: string): Promise<AIProviderSettings | null> {
  try {
    const result = await db
      .select({ aiProviderSettings: settings.aiProviderSettings })
      .from(settings)
      .where(eq(settings.userId, userId))
      .limit(1)

    if (!result.length) {
      return null
    }

    return result[0].aiProviderSettings as AIProviderSettings | null
  } catch (error) {
    logger.error('Failed to get AI provider settings from DB', { userId, error })
    return null
  }
}

/**
 * Gets the API key for self-hosted providers from AI Provider Settings.
 * This is used for OpenRouter, DeepSeek, vLLM, and llama.cpp in self-hosted deployments.
 *
 * On the server side, it reads from the database.
 * On the client side, it reads from the Zustand store.
 */
async function getApiKeyFromSettings(
  provider: 'openrouter' | 'llamacpp' | 'vllm' | 'deepseek',
  userId?: string
): Promise<string | undefined> {
  // Server-side: read from database
  if (typeof window === 'undefined' && userId) {
    const dbSettings = await getAIProviderSettingsFromDB(userId)
    if (!dbSettings) {
      logger.debug('No AI provider settings found in database', { userId, provider })
      return undefined
    }

    if (provider === 'openrouter' || provider === 'deepseek') {
      if (dbSettings.openrouter?.enabled && dbSettings.openrouter?.apiKey) {
        logger.debug('Found OpenRouter API key in database settings')
        return dbSettings.openrouter.apiKey
      }
    } else if (provider === 'llamacpp') {
      if (dbSettings.llamacpp?.enabled) {
        return dbSettings.llamacpp?.apiKey || 'empty'
      }
    } else if (provider === 'vllm') {
      if (dbSettings.vllm?.enabled) {
        return dbSettings.vllm?.apiKey || 'empty'
      }
    }

    return undefined
  }

  // Client-side: read from Zustand store
  try {
    const { useAIProviderSettingsStore } = await import('@/stores/settings/ai-providers/store')
    const state = useAIProviderSettingsStore.getState()

    if (provider === 'openrouter' || provider === 'deepseek') {
      if (state.openrouter.enabled && state.openrouter.apiKey) {
        return state.openrouter.apiKey
      }
    } else if (provider === 'llamacpp') {
      if (state.llamacpp.enabled) {
        return state.llamacpp.apiKey || 'empty'
      }
    } else if (provider === 'vllm') {
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

/**
 * Gets the user ID from the session for server-side API key resolution.
 */
async function getUserIdFromSession(): Promise<string | undefined> {
  try {
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    return session?.user?.id
  } catch (error) {
    logger.debug('Could not get user session', { error })
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

  // Get user ID for database lookups (server-side)
  const userId = await getUserIdFromSession()

  // Handle local/self-hosted providers (llamacpp, vllm)
  const isLlamaCppModel =
    provider === 'llamacpp' ||
    useProvidersStore.getState().providers.llamacpp.models.includes(model)
  if (isLlamaCppModel) {
    const settingsKey = await getApiKeyFromSettings('llamacpp', userId)
    return { apiKey: userProvidedKey || settingsKey || 'empty', isBYOK: false }
  }

  const isVllmModel =
    provider === 'vllm' || useProvidersStore.getState().providers.vllm.models.includes(model)
  if (isVllmModel) {
    const settingsKey = await getApiKeyFromSettings('vllm', userId)
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
    const settingsKey = await getApiKeyFromSettings('openrouter', userId)
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
