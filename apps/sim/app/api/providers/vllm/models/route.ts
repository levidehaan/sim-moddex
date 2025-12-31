import { db } from '@sim/db'
import { settings } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { env } from '@/lib/core/config/env'

const logger = createLogger('VLLMModelsAPI')

interface VLLMSettings {
  baseUrl?: string
  apiKey?: string
  enabled?: boolean
}

/**
 * Fetches vLLM settings from user's database record
 */
async function getUserVLLMSettings(): Promise<VLLMSettings | null> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return null

    const result = await db.select().from(settings).where(eq(settings.userId, session.user.id)).limit(1)

    if (!result.length) return null

    const aiSettings = result[0].aiProviderSettings as Record<string, any> | null
    return aiSettings?.vllm || null
  } catch (error) {
    logger.warn('Failed to fetch user vLLM settings', { error })
    return null
  }
}

/**
 * Get available vLLM models
 */
export async function GET(request: NextRequest) {
  // First try user settings from database
  const userSettings = await getUserVLLMSettings()

  // Use user settings if available and enabled, otherwise fall back to env vars
  let baseUrl: string
  let apiKey: string | undefined

  if (userSettings?.enabled && userSettings?.baseUrl) {
    baseUrl = userSettings.baseUrl.replace(/\/$/, '')
    apiKey = userSettings.apiKey
    logger.info('Using user-configured vLLM settings')
  } else {
    baseUrl = (env.VLLM_BASE_URL || '').replace(/\/$/, '')
    apiKey = env.VLLM_API_KEY
  }

  if (!baseUrl) {
    logger.info('vLLM server URL not configured')
    return NextResponse.json({ models: [] })
  }

  try {
    logger.info('Fetching vLLM models', {
      baseUrl,
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`
    }

    const response = await fetch(`${baseUrl}/v1/models`, {
      headers,
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      logger.warn('vLLM service is not available', {
        status: response.status,
        statusText: response.statusText,
      })
      return NextResponse.json({ models: [] })
    }

    const data = (await response.json()) as { data: Array<{ id: string }> }
    const models = data.data.map((model) => `vllm/${model.id}`)

    logger.info('Successfully fetched vLLM models', {
      count: models.length,
      models,
    })

    return NextResponse.json({ models })
  } catch (error) {
    logger.error('Failed to fetch vLLM models', {
      error: error instanceof Error ? error.message : 'Unknown error',
      baseUrl,
    })

    return NextResponse.json({ models: [] })
  }
}
