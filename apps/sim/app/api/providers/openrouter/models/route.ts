import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { filterBlacklistedModels } from '@/providers/utils'

const logger = createLogger('OpenRouterModelsAPI')

interface OpenRouterModel {
  id: string
  name?: string
  description?: string
  context_length?: number
  architecture?: {
    modality?: string
    tokenizer?: string
    instruct_type?: string
  }
  top_provider?: {
    is_moderated?: boolean
  }
  supported_parameters?: string[]
  pricing?: {
    prompt?: string
    completion?: string
  }
}

interface OpenRouterResponse {
  data: OpenRouterModel[]
}

export interface OpenRouterModelInfo {
  id: string
  name?: string
  description?: string
  contextLength?: number
  modality?: string
  isModerated?: boolean
  supportsStructuredOutputs?: boolean
  supportsTools?: boolean
  pricing?: {
    input: number
    output: number
  }
}

export type SortField = 'name' | 'context' | 'price_input' | 'price_output'
export type SortOrder = 'asc' | 'desc'

/**
 * OpenRouter Models API
 *
 * Query Parameters:
 * - search: Filter models by name/id (case-insensitive)
 * - sort: Sort by field (name, context, price_input, price_output)
 * - order: Sort order (asc, desc) - default: asc
 * - modality: Filter by modality (text, multimodal, etc.)
 * - tools: Filter for tool support (true/false)
 * - structured: Filter for structured output support (true/false)
 * - minContext: Minimum context length
 * - maxPrice: Maximum input price per million tokens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')?.toLowerCase() ?? ''
    const sortField = (searchParams.get('sort') as SortField) ?? 'name'
    const sortOrder = (searchParams.get('order') as SortOrder) ?? 'asc'
    const modality = searchParams.get('modality')?.toLowerCase()
    const toolsFilter = searchParams.get('tools')
    const structuredFilter = searchParams.get('structured')
    const minContext = searchParams.get('minContext')
      ? Number.parseInt(searchParams.get('minContext')!, 10)
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? Number.parseFloat(searchParams.get('maxPrice')!)
      : undefined

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      logger.warn('Failed to fetch OpenRouter models', {
        status: response.status,
        statusText: response.statusText,
      })
      return NextResponse.json({ models: [], modelInfo: {} })
    }

    const data = (await response.json()) as OpenRouterResponse

    let modelInfo: Record<string, OpenRouterModelInfo> = {}
    let allModels: string[] = []

    for (const model of data.data ?? []) {
      const modelId = `openrouter/${model.id}`
      const supportedParams = model.supported_parameters ?? []

      const info: OpenRouterModelInfo = {
        id: modelId,
        name: model.name || model.id,
        description: model.description,
        contextLength: model.context_length,
        modality: model.architecture?.modality,
        isModerated: model.top_provider?.is_moderated,
        supportsStructuredOutputs: supportedParams.includes('structured_outputs'),
        supportsTools: supportedParams.includes('tools'),
        pricing: model.pricing
          ? {
              input: Number.parseFloat(model.pricing.prompt ?? '0') * 1000000,
              output: Number.parseFloat(model.pricing.completion ?? '0') * 1000000,
            }
          : undefined,
      }

      let include = true

      if (search) {
        const searchable = `${info.name} ${info.id} ${info.description ?? ''}`.toLowerCase()
        include = searchable.includes(search)
      }

      if (include && modality) {
        include = info.modality?.toLowerCase().includes(modality) ?? false
      }

      if (include && toolsFilter !== null) {
        const wantsTools = toolsFilter === 'true'
        include = info.supportsTools === wantsTools
      }

      if (include && structuredFilter !== null) {
        const wantsStructured = structuredFilter === 'true'
        include = info.supportsStructuredOutputs === wantsStructured
      }

      if (include && minContext !== undefined) {
        include = (info.contextLength ?? 0) >= minContext
      }

      if (include && maxPrice !== undefined) {
        include = (info.pricing?.input ?? 0) <= maxPrice
      }

      if (include) {
        allModels.push(modelId)
        modelInfo[modelId] = info
      }
    }

    const compareFn = (a: string, b: string): number => {
      const infoA = modelInfo[a]
      const infoB = modelInfo[b]

      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = (infoA.name ?? '').localeCompare(infoB.name ?? '')
          break
        case 'context':
          comparison = (infoA.contextLength ?? 0) - (infoB.contextLength ?? 0)
          break
        case 'price_input':
          comparison = (infoA.pricing?.input ?? 0) - (infoB.pricing?.input ?? 0)
          break
        case 'price_output':
          comparison = (infoA.pricing?.output ?? 0) - (infoB.pricing?.output ?? 0)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    }

    allModels.sort(compareFn)

    const uniqueModels = Array.from(new Set(allModels))
    const models = filterBlacklistedModels(uniqueModels)

    const filteredModelInfo: Record<string, OpenRouterModelInfo> = {}
    for (const modelId of models) {
      if (modelInfo[modelId]) {
        filteredModelInfo[modelId] = modelInfo[modelId]
      }
    }

    const structuredOutputCount = Object.values(filteredModelInfo).filter(
      (m) => m.supportsStructuredOutputs
    ).length
    const toolsCount = Object.values(filteredModelInfo).filter((m) => m.supportsTools).length

    logger.info('Successfully fetched OpenRouter models', {
      total: data.data?.length ?? 0,
      filtered: models.length,
      search: search || undefined,
      sort: sortField,
      order: sortOrder,
      withStructuredOutputs: structuredOutputCount,
      withTools: toolsCount,
    })

    return NextResponse.json({
      models,
      modelInfo: filteredModelInfo,
      meta: {
        total: data.data?.length ?? 0,
        filtered: models.length,
        withStructuredOutputs: structuredOutputCount,
        withTools: toolsCount,
      },
    })
  } catch (error) {
    logger.error('Error fetching OpenRouter models', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ models: [], modelInfo: {}, meta: { total: 0, filtered: 0 } })
  }
}
