import { db } from '@sim/db'
import { settings, userStats, workflow } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq, sql } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { getBYOKKey } from '@/lib/api-key/byok'
import { getSession } from '@/lib/auth'
import { logModelUsage } from '@/lib/billing/core/usage-log'
import { checkAndBillOverageThreshold } from '@/lib/billing/threshold-billing'
import { env } from '@/lib/core/config/env'
import { getCostMultiplier, isBillingEnabled } from '@/lib/core/config/feature-flags'
import { generateRequestId } from '@/lib/core/utils/request'
import { verifyWorkspaceMembership } from '@/app/api/workflows/utils'
import { getModelPricing } from '@/providers/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const logger = createLogger('WandGenerateAPI')

const wandModelName = 'meta-llama/llama-3.1-8b-instruct:free'

/**
 * Gets OpenRouter API key - first from user settings, then from environment
 */
async function getOpenRouterKey(userId: string): Promise<string | null> {
  try {
    const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1)

    if (result.length > 0) {
      const aiSettings = result[0].aiProviderSettings as Record<string, any> | null
      const openrouterSettings = aiSettings?.openrouter as { apiKey?: string; enabled?: boolean } | undefined

      if (openrouterSettings?.enabled !== false && openrouterSettings?.apiKey) {
        logger.info('Using user-configured OpenRouter API key for wand')
        return openrouterSettings.apiKey
      }
    }
  } catch (error) {
    logger.warn('Failed to fetch user OpenRouter settings', { error })
  }

  // Fall back to environment variable
  if (env.OPENROUTER_API_KEY) {
    return env.OPENROUTER_API_KEY
  }

  return null
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface RequestBody {
  prompt: string
  systemPrompt?: string
  stream?: boolean
  history?: ChatMessage[]
  workflowId?: string
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return '[unserializable]'
  }
}

async function updateUserStatsForWand(
  userId: string,
  usage: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  },
  requestId: string,
  isBYOK = false
): Promise<void> {
  if (!isBillingEnabled) {
    logger.debug(`[${requestId}] Billing is disabled, skipping wand usage cost update`)
    return
  }

  if (!usage.total_tokens || usage.total_tokens <= 0) {
    logger.debug(`[${requestId}] No tokens to update in user stats`)
    return
  }

  try {
    const totalTokens = usage.total_tokens || 0
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0

    const modelName = wandModelName
    let costToStore = 0

    if (!isBYOK) {
      const pricing = getModelPricing(modelName)
      const costMultiplier = getCostMultiplier()
      let modelCost = 0

      if (pricing) {
        const inputCost = (promptTokens / 1000000) * pricing.input
        const outputCost = (completionTokens / 1000000) * pricing.output
        modelCost = inputCost + outputCost
      } else {
        modelCost = (promptTokens / 1000000) * 0.005 + (completionTokens / 1000000) * 0.015
      }

      costToStore = modelCost * costMultiplier
    }

    await db
      .update(userStats)
      .set({
        totalTokensUsed: sql`total_tokens_used + ${totalTokens}`,
        totalCost: sql`total_cost + ${costToStore}`,
        currentPeriodCost: sql`current_period_cost + ${costToStore}`,
        lastActive: new Date(),
      })
      .where(eq(userStats.userId, userId))

    logger.debug(`[${requestId}] Updated user stats for wand usage`, {
      userId,
      tokensUsed: totalTokens,
      costAdded: costToStore,
      isBYOK,
    })

    await logModelUsage({
      userId,
      source: 'wand',
      model: modelName,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      cost: costToStore,
    })

    await checkAndBillOverageThreshold(userId)
  } catch (error) {
    logger.error(`[${requestId}] Failed to update user stats for wand usage`, error)
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  logger.info(`[${requestId}] Received wand generation request`)

  const session = await getSession()
  if (!session?.user?.id) {
    logger.warn(`[${requestId}] Unauthorized wand generation attempt`)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as RequestBody

    const { prompt, systemPrompt, stream = false, history = [], workflowId } = body

    if (!prompt) {
      logger.warn(`[${requestId}] Invalid request: Missing prompt.`)
      return NextResponse.json(
        { success: false, error: 'Missing required field: prompt.' },
        { status: 400 }
      )
    }

    let workspaceId: string | null = null
    if (workflowId) {
      const [workflowRecord] = await db
        .select({ workspaceId: workflow.workspaceId, userId: workflow.userId })
        .from(workflow)
        .where(eq(workflow.id, workflowId))
        .limit(1)

      if (!workflowRecord) {
        logger.warn(`[${requestId}] Workflow not found: ${workflowId}`)
        return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 })
      }

      workspaceId = workflowRecord.workspaceId

      if (workflowRecord.workspaceId) {
        const permission = await verifyWorkspaceMembership(
          session.user.id,
          workflowRecord.workspaceId
        )
        if (!permission || (permission !== 'admin' && permission !== 'write')) {
          logger.warn(
            `[${requestId}] User ${session.user.id} does not have write access to workspace for workflow ${workflowId}`
          )
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
        }
      } else if (workflowRecord.userId !== session.user.id) {
        logger.warn(`[${requestId}] User ${session.user.id} does not own workflow ${workflowId}`)
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Get OpenRouter API key from user settings or environment
    const openrouterApiKey = await getOpenRouterKey(session.user.id)
    if (!openrouterApiKey) {
      logger.error(`[${requestId}] OpenRouter API key not configured.`)
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured. Please configure it in Settings > AI Providers.' },
        { status: 503 }
      )
    }

    const finalSystemPrompt =
      systemPrompt ||
      'You are a helpful AI assistant. Generate content exactly as requested by the user.'

    const messages: ChatMessage[] = [{ role: 'system', content: finalSystemPrompt }]

    messages.push(...history.filter((msg) => msg.role !== 'system'))

    messages.push({ role: 'user', content: prompt })

    logger.debug(`[${requestId}] Calling OpenRouter API for wand generation`, {
      stream,
      historyLength: history.length,
      endpoint: 'openrouter.ai',
      model: wandModelName,
    })

    if (stream) {
      try {
        logger.debug(`[${requestId}] Starting streaming request to OpenRouter`)

        logger.info(`[${requestId}] About to create stream with model: ${wandModelName}`)

        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterApiKey}`,
        }

        logger.debug(`[${requestId}] Making streaming request to: ${apiUrl}`)

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: wandModelName,
            messages: messages,
            temperature: 0.2,
            max_tokens: 10000,
            stream: true,
            stream_options: { include_usage: true },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          logger.error(`[${requestId}] API request failed`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          })
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        logger.info(`[${requestId}] Stream response received, starting processing`)

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        const readable = new ReadableStream({
          async start(controller) {
            const reader = response.body?.getReader()
            if (!reader) {
              controller.close()
              return
            }

            try {
              let buffer = ''
              let chunkCount = 0
              let finalUsage: any = null

              while (true) {
                const { done, value } = await reader.read()

                if (done) {
                  logger.info(`[${requestId}] Stream completed. Total chunks: ${chunkCount}`)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
                  controller.close()
                  break
                }

                buffer += decoder.decode(value, { stream: true })

                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim()

                    if (data === '[DONE]') {
                      logger.info(`[${requestId}] Received [DONE] signal`)

                      if (finalUsage) {
                        await updateUserStatsForWand(session.user.id, finalUsage, requestId, false)
                      }

                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
                      )
                      controller.close()
                      return
                    }

                    try {
                      const parsed = JSON.parse(data)
                      const content = parsed.choices?.[0]?.delta?.content

                      if (content) {
                        chunkCount++
                        if (chunkCount === 1) {
                          logger.info(`[${requestId}] Received first content chunk`)
                        }

                        controller.enqueue(
                          encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`)
                        )
                      }

                      if (parsed.usage) {
                        finalUsage = parsed.usage
                        logger.info(
                          `[${requestId}] Received usage data: ${JSON.stringify(parsed.usage)}`
                        )
                      }
                    } catch (parseError) {
                      logger.debug(
                        `[${requestId}] Skipped non-JSON line: ${data.substring(0, 100)}`
                      )
                    }
                  }
                }
              }
            } catch (streamError: any) {
              logger.error(`[${requestId}] Streaming error`, {
                name: streamError?.name,
                message: streamError?.message || 'Unknown error',
                stack: streamError?.stack,
              })

              const errorData = `data: ${JSON.stringify({ error: 'Streaming failed', done: true })}\n\n`
              controller.enqueue(encoder.encode(errorData))
              controller.close()
            } finally {
              reader.releaseLock()
            }
          },
        })

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
          },
        })
      } catch (error: any) {
        logger.error(`[${requestId}] Failed to create stream`, {
          name: error?.name,
          message: error?.message || 'Unknown error',
          code: error?.code,
          status: error?.status,
          responseStatus: error?.response?.status,
          responseData: error?.response?.data ? safeStringify(error.response.data) : undefined,
          stack: error?.stack,
          model: wandModelName,
          endpoint: 'openrouter.ai',
        })

        return NextResponse.json(
          { success: false, error: 'An error occurred during wand generation streaming.' },
          { status: 500 }
        )
      }
    }

    // Non-streaming request
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openrouterApiKey}`,
      },
      body: JSON.stringify({
        model: wandModelName,
        messages: messages,
        temperature: 0.3,
        max_tokens: 10000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`[${requestId}] OpenRouter API request failed`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        { success: false, error: 'Failed to generate content from OpenRouter API.' },
        { status: response.status }
      )
    }

    const completion = await response.json()
    const generatedContent = completion.choices[0]?.message?.content?.trim()

    if (!generatedContent) {
      logger.error(`[${requestId}] OpenRouter response was empty or invalid.`)
      return NextResponse.json(
        { success: false, error: 'Failed to generate content. AI response was empty.' },
        { status: 500 }
      )
    }

    logger.info(`[${requestId}] Wand generation successful`)

    if (completion.usage) {
      await updateUserStatsForWand(session.user.id, completion.usage, requestId, false)
    }

    return NextResponse.json({ success: true, content: generatedContent })
  } catch (error: any) {
    logger.error(`[${requestId}] Wand generation failed`, {
      name: error?.name,
      message: error?.message || 'Unknown error',
      code: error?.code,
      status: error?.status,
      responseStatus: error?.response?.status,
      responseData: (error as any)?.response?.data
        ? safeStringify((error as any).response.data)
        : undefined,
      stack: error?.stack,
      model: wandModelName,
      endpoint: 'openrouter.ai',
    })

    let clientErrorMessage = 'Wand generation failed. Please try again later.'
    let status = 500

    if (error?.status) {
      status = error.status
      if (status === 401) {
        clientErrorMessage = 'Authentication failed. Please check your API key configuration.'
      } else if (status === 429) {
        clientErrorMessage = 'Rate limit exceeded. Please try again later.'
      } else if (status >= 500) {
        clientErrorMessage =
          'The wand generation service is currently unavailable. Please try again later.'
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: clientErrorMessage,
      },
      { status }
    )
  }
}
