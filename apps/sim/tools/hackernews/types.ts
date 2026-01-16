/**
 * Hacker News API Tool Types
 */

export type HackerNewsOperation =
  | 'top_stories'
  | 'new_stories'
  | 'best_stories'
  | 'ask_stories'
  | 'show_stories'
  | 'job_stories'
  | 'get_item'
  | 'get_user'
  | 'max_item'
  | 'updates'

export interface HackerNewsToolParams {
  operation: HackerNewsOperation
  itemId?: number
  username?: string
  limit?: number
  includeDetails?: boolean
}

export interface HackerNewsItem {
  id: number
  type: 'story' | 'comment' | 'job' | 'poll' | 'pollopt'
  by?: string
  time?: number
  text?: string
  dead?: boolean
  parent?: number
  poll?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  parts?: number[]
  descendants?: number
  deleted?: boolean
}

export interface HackerNewsUser {
  id: string
  created: number
  karma: number
  about?: string
  submitted?: number[]
}

export interface HackerNewsUpdates {
  items: number[]
  profiles: string[]
}

export interface HackerNewsToolResponse {
  success: boolean
  output: {
    stories?: HackerNewsItem[]
    storyIds?: number[]
    item?: HackerNewsItem
    user?: HackerNewsUser
    maxItem?: number
    updates?: HackerNewsUpdates
    error?: string
  }
}
