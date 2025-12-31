import type { ToolResponse } from '@/tools/types'

/**
 * PostHog API response output
 */
export interface PostHogOutput {
  success: boolean
  data?: Record<string, any>
  error?: string
}

/**
 * PostHog tool response type
 */
export interface PostHogResponse extends ToolResponse {
  output: PostHogOutput
}
