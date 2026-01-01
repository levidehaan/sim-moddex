import { createLogger } from '@sim/logger'
import { env } from '@/lib/core/config/env'
import { isRetryableError, retryWithExponentialBackoff } from '@/lib/knowledge/documents/utils'
import { batchByTokenLimit, getTotalTokenCount } from '@/lib/tokenization'

const logger = createLogger('EmbeddingUtils')

const MAX_TOKENS_PER_REQUEST = 8000

export class EmbeddingAPIError extends Error {
  public status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'EmbeddingAPIError'
    this.status = status
  }
}

interface EmbeddingConfig {
  useAzure: boolean
  apiUrl: string
  headers: Record<string, string>
  modelName: string
}

async function getEmbeddingConfig(
  embeddingModel = 'text-embedding-3-small',
  workspaceId?: string | null
): Promise<EmbeddingConfig> {
  // Using OpenRouter for embeddings - proprietary API keys removed
  const openrouterApiKey = env.OPENROUTER_API_KEY

  if (!openrouterApiKey) {
    throw new Error('OPENROUTER_API_KEY must be configured for embeddings')
  }

  // OpenRouter supports OpenAI embedding models via their API
  const modelName = `openai/${embeddingModel}`

  return {
    useAzure: false,
    apiUrl: 'https://openrouter.ai/api/v1/embeddings',
    headers: {
      Authorization: `Bearer ${openrouterApiKey}`,
      'Content-Type': 'application/json',
    },
    modelName,
  }
}

async function callEmbeddingAPI(inputs: string[], config: EmbeddingConfig): Promise<number[][]> {
  return retryWithExponentialBackoff(
    async () => {
      const requestBody = {
        input: inputs,
        model: config.modelName,
        encoding_format: 'float',
      }

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new EmbeddingAPIError(
          `Embedding API failed: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        )
      }

      const data = await response.json()
      return data.data.map((item: any) => item.embedding)
    },
    {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      retryCondition: (error: any) => {
        if (error instanceof EmbeddingAPIError) {
          return error.status === 429 || error.status >= 500
        }
        return isRetryableError(error)
      },
    }
  )
}

/**
 * Generate embeddings for multiple texts with token-aware batching
 * Uses tiktoken for token counting
 */
export async function generateEmbeddings(
  texts: string[],
  embeddingModel = 'text-embedding-3-small',
  workspaceId?: string | null
): Promise<number[][]> {
  const config = await getEmbeddingConfig(embeddingModel, workspaceId)

  logger.info(`Using OpenRouter for embeddings generation (${texts.length} texts)`)

  const batches = batchByTokenLimit(texts, MAX_TOKENS_PER_REQUEST, embeddingModel)

  logger.info(
    `Split ${texts.length} texts into ${batches.length} batches (max ${MAX_TOKENS_PER_REQUEST} tokens per batch)`
  )

  const allEmbeddings: number[][] = []

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const batchTokenCount = getTotalTokenCount(batch, embeddingModel)

    logger.info(
      `Processing batch ${i + 1}/${batches.length}: ${batch.length} texts, ${batchTokenCount} tokens`
    )

    try {
      const batchEmbeddings = await callEmbeddingAPI(batch, config)
      allEmbeddings.push(...batchEmbeddings)

      logger.info(
        `Generated ${batchEmbeddings.length} embeddings for batch ${i + 1}/${batches.length}`
      )
    } catch (error) {
      logger.error(`Failed to generate embeddings for batch ${i + 1}:`, error)
      throw error
    }

    if (i + 1 < batches.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  logger.info(`Successfully generated ${allEmbeddings.length} embeddings total`)

  return allEmbeddings
}

/**
 * Generate embedding for a single search query
 */
export async function generateSearchEmbedding(
  query: string,
  embeddingModel = 'text-embedding-3-small',
  workspaceId?: string | null
): Promise<number[]> {
  const config = await getEmbeddingConfig(embeddingModel, workspaceId)

  logger.info('Using OpenRouter for search embedding generation')

  const embeddings = await callEmbeddingAPI([query], config)
  return embeddings[0]
}
