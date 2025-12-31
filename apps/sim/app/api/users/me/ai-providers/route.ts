import { db } from '@sim/db'
import { settings } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { generateRequestId } from '@/lib/core/utils/request'

const logger = createLogger('AIProvidersAPI')

/**
 * Schema for AI provider settings
 */
const AIProviderSettingsSchema = z.object({
  openrouter: z
    .object({
      apiKey: z.string().optional(),
      enabled: z.boolean().optional(),
    })
    .optional(),
  llamacpp: z
    .object({
      baseUrl: z.string().optional(),
      apiKey: z.string().optional(),
      enabled: z.boolean().optional(),
    })
    .optional(),
  vllm: z
    .object({
      baseUrl: z.string().optional(),
      apiKey: z.string().optional(),
      enabled: z.boolean().optional(),
    })
    .optional(),
})

export type AIProviderSettings = z.infer<typeof AIProviderSettingsSchema>

const defaultSettings: AIProviderSettings = {
  openrouter: {
    apiKey: '',
    enabled: true,
  },
  llamacpp: {
    baseUrl: '',
    apiKey: '',
    enabled: false,
  },
  vllm: {
    baseUrl: '',
    apiKey: '',
    enabled: false,
  },
}

/**
 * GET /api/users/me/ai-providers
 * Fetch user's AI provider settings
 */
export async function GET() {
  const requestId = generateRequestId()

  try {
    const session = await getSession()

    if (!session?.user?.id) {
      logger.info(`[${requestId}] Returning default AI provider settings for unauthenticated user`)
      return NextResponse.json({ data: defaultSettings }, { status: 200 })
    }

    const userId = session.user.id
    const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1)

    if (!result.length) {
      return NextResponse.json({ data: defaultSettings }, { status: 200 })
    }

    const userSettings = result[0]
    const aiProviderSettings = (userSettings.aiProviderSettings as AIProviderSettings) || {}

    // Merge with defaults to ensure all fields exist
    const mergedSettings: AIProviderSettings = {
      openrouter: {
        ...defaultSettings.openrouter,
        ...aiProviderSettings.openrouter,
      },
      llamacpp: {
        ...defaultSettings.llamacpp,
        ...aiProviderSettings.llamacpp,
      },
      vllm: {
        ...defaultSettings.vllm,
        ...aiProviderSettings.vllm,
      },
    }

    return NextResponse.json({ data: mergedSettings }, { status: 200 })
  } catch (error: any) {
    logger.error(`[${requestId}] AI provider settings fetch error`, error)
    return NextResponse.json({ data: defaultSettings }, { status: 200 })
  }
}

/**
 * PATCH /api/users/me/ai-providers
 * Update user's AI provider settings
 */
export async function PATCH(request: Request) {
  const requestId = generateRequestId()

  try {
    const session = await getSession()

    if (!session?.user?.id) {
      logger.info(`[${requestId}] AI provider settings update attempted by unauthenticated user`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    try {
      const validatedData = AIProviderSettingsSchema.parse(body)

      // Get existing settings to merge
      const existingResult = await db
        .select()
        .from(settings)
        .where(eq(settings.userId, userId))
        .limit(1)

      const existingAiSettings =
        (existingResult[0]?.aiProviderSettings as AIProviderSettings) || {}

      // Merge new settings with existing ones
      const mergedSettings: AIProviderSettings = {
        openrouter: {
          ...existingAiSettings.openrouter,
          ...validatedData.openrouter,
        },
        llamacpp: {
          ...existingAiSettings.llamacpp,
          ...validatedData.llamacpp,
        },
        vllm: {
          ...existingAiSettings.vllm,
          ...validatedData.vllm,
        },
      }

      await db
        .insert(settings)
        .values({
          id: nanoid(),
          userId,
          aiProviderSettings: mergedSettings,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [settings.userId],
          set: {
            aiProviderSettings: mergedSettings,
            updatedAt: new Date(),
          },
        })

      logger.info(`[${requestId}] AI provider settings updated for user ${userId}`)
      return NextResponse.json({ success: true, data: mergedSettings }, { status: 200 })
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        logger.warn(`[${requestId}] Invalid AI provider settings data`, {
          errors: validationError.errors,
        })
        return NextResponse.json(
          { error: 'Invalid settings data', details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }
  } catch (error: any) {
    logger.error(`[${requestId}] AI provider settings update error`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
