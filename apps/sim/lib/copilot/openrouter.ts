import { db } from '@sim/db'
import { settings } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { env } from '@/lib/core/config/env'

const logger = createLogger('CopilotOpenRouter')

export interface OpenRouterSettings {
  apiKey?: string
  enabled?: boolean
}

/**
 * Gets the OpenRouter API key for a user
 * First checks user settings, then falls back to environment variable
 */
export async function getOpenRouterApiKey(userId: string): Promise<string | null> {
  try {
    // First try user settings
    const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1)

    if (result.length > 0) {
      const aiSettings = result[0].aiProviderSettings as Record<string, any> | null
      const openrouterSettings = aiSettings?.openrouter as OpenRouterSettings | undefined

      if (openrouterSettings?.enabled !== false && openrouterSettings?.apiKey) {
        logger.info('Using user-configured OpenRouter API key for copilot')
        return openrouterSettings.apiKey
      }
    }
  } catch (error) {
    logger.warn('Failed to fetch user OpenRouter settings', { error })
  }

  // Fall back to environment variable
  if (env.OPENROUTER_API_KEY) {
    logger.info('Using environment OpenRouter API key for copilot')
    return env.OPENROUTER_API_KEY
  }

  return null
}

/**
 * Default model for copilot chat
 */
export const COPILOT_DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet'

/**
 * Free model fallback for when no API key is available
 */
export const COPILOT_FREE_MODEL = 'meta-llama/llama-3.1-8b-instruct:free'

export interface OpenRouterChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

export interface OpenRouterChatRequest {
  model: string
  messages: OpenRouterChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  stream_options?: { include_usage: boolean }
}

/**
 * Makes a streaming chat completion request to OpenRouter
 */
export async function streamOpenRouterChat(
  apiKey: string,
  request: OpenRouterChatRequest
): Promise<Response> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://sim.ai',
      'X-Title': 'Sim Copilot',
    },
    body: JSON.stringify({
      ...request,
      stream: true,
      stream_options: { include_usage: true },
    }),
  })

  return response
}

/**
 * Makes a non-streaming chat completion request to OpenRouter
 */
export async function chatOpenRouter(
  apiKey: string,
  request: OpenRouterChatRequest
): Promise<any> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://sim.ai',
      'X-Title': 'Sim Copilot',
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  return response.json()
}
