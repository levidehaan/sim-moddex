/**
 * This file contained proprietary API key rotation logic for OpenAI, Anthropic, and Gemini.
 * It has been disabled as part of removing proprietary AI service dependencies.
 *
 * If you need API key rotation for open-source providers, implement it here.
 */

/**
 * Rotates through available API keys for a provider
 * @param provider - The provider to get a key for
 * @returns The selected API key
 * @throws Error - This function is currently disabled
 */
export function getRotatingApiKey(provider: string): string {
  throw new Error(
    `API key rotation is not currently implemented. Provider: ${provider}. Please configure API keys directly.`
  )
}

// Commented out proprietary API key rotation logic:
/*
import { env } from '@/lib/core/config/env'

export function getRotatingApiKey(provider: string): string {
  if (provider !== 'openai' && provider !== 'anthropic' && provider !== 'gemini') {
    throw new Error(`No rotation implemented for provider: ${provider}`)
  }

  const keys = []

  if (provider === 'openai') {
    if (env.OPENAI_API_KEY_1) keys.push(env.OPENAI_API_KEY_1)
    if (env.OPENAI_API_KEY_2) keys.push(env.OPENAI_API_KEY_2)
    if (env.OPENAI_API_KEY_3) keys.push(env.OPENAI_API_KEY_3)
  } else if (provider === 'anthropic') {
    if (env.ANTHROPIC_API_KEY_1) keys.push(env.ANTHROPIC_API_KEY_1)
    if (env.ANTHROPIC_API_KEY_2) keys.push(env.ANTHROPIC_API_KEY_2)
    if (env.ANTHROPIC_API_KEY_3) keys.push(env.ANTHROPIC_API_KEY_3)
  } else if (provider === 'gemini') {
    if (env.GEMINI_API_KEY_1) keys.push(env.GEMINI_API_KEY_1)
    if (env.GEMINI_API_KEY_2) keys.push(env.GEMINI_API_KEY_2)
    if (env.GEMINI_API_KEY_3) keys.push(env.GEMINI_API_KEY_3)
  }

  if (keys.length === 0) {
    throw new Error(
      `No API keys configured for rotation. Please configure ${provider.toUpperCase()}_API_KEY_1, ${provider.toUpperCase()}_API_KEY_2, or ${provider.toUpperCase()}_API_KEY_3.`
    )
  }

  const currentMinute = new Date().getMinutes()
  const keyIndex = currentMinute % keys.length

  return keys[keyIndex]
}
*/
