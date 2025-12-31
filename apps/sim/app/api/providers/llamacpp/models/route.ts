import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/core/config/env'

const logger = createLogger('LlamaCppModelsAPI')

export const revalidate = 60

export async function GET(request: NextRequest) {
  const baseUrl = (env.LLAMACPP_BASE_URL || '').replace(/\/$/, '')

  if (!baseUrl) {
    logger.info('LLAMACPP_BASE_URL not configured')
    return NextResponse.json({ models: [] })
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (env.LLAMACPP_API_KEY) {
      headers.Authorization = `Bearer ${env.LLAMACPP_API_KEY}`
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
