import { db } from '@sim/db'
import { settings } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { env } from '@/lib/core/config/env'

const logger = createLogger('LlamaCppModelsAPI')

export const revalidate = 60

interface LlamaCppSettings {
  baseUrl?: string
  apiKey?: string
  enabled?: boolean
}

/**
 * Fetches llama.cpp settings from user's database record
 */
async function getUserLlamaCppSettings(): Promise<LlamaCppSettings | null> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return null

    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, session.user.id))
      .limit(1)

    if (!result.length) return null

    const aiSettings = result[0].aiProviderSettings as Record<string, any> | null
    return aiSettings?.llamacpp || null
  } catch (error) {
    logger.warn('Failed to fetch user llama.cpp settings', { error })
    return null
  }
}

export async function GET(request: NextRequest) {
  // First try user settings from database
  const userSettings = await getUserLlamaCppSettings()

  // Use user settings if available and enabled, otherwise fall back to env vars
  let baseUrl: string
  let apiKey: string | undefined

  if (userSettings?.enabled && userSettings?.baseUrl) {
    baseUrl = userSettings.baseUrl.replace(/\/$/, '')
    apiKey = userSettings.apiKey
    logger.info('Using user-configured llama.cpp settings')
  } else {
    baseUrl = (env.LLAMACPP_BASE_URL || '').replace(/\/$/, '')
    apiKey = env.LLAMACPP_API_KEY
  }

  if (!baseUrl) {
    logger.info('llama.cpp server URL not configured')
    return NextResponse.json({ models: [] })
  }

  try {
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
      logger.warn('Failed to fetch models from llama.cpp server', {
        status: response.status,
        statusText: response.statusText,
      })
      return NextResponse.json({ models: [] })
    }

    const data = (await response.json()) as { data: Array<{ id: string }> }
    const models = data.data.map((model) => `llamacpp/${model.id}`)

    logger.info('Fetched llama.cpp models', { count: models.length })

    return NextResponse.json({ models })
  } catch (error) {
    logger.error('Error fetching llama.cpp models', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ models: [] })
  }
}
