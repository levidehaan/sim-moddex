import type { ToolConfig } from '@/tools/types'
import type {
  HackerNewsToolParams,
  HackerNewsToolResponse,
  HackerNewsItem,
  HackerNewsUser,
  HackerNewsUpdates,
} from './types'

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'

/**
 * Helper to make requests to Hacker News API
 */
async function hnRequest<T>(endpoint: string): Promise<T | null> {
  const url = `${HN_BASE_URL}${endpoint}.json`
  const response = await fetch(url)
  
  if (!response.ok) {
    return null
  }

  return response.json()
}

/**
 * Get story IDs for a specific category
 */
async function getStoryIds(
  category: string,
  limit: number
): Promise<number[]> {
  const ids = await hnRequest<number[]>(`/${category}`)
  if (!ids) return []
  return ids.slice(0, Math.min(limit, 500))
}

/**
 * Get item details by ID
 */
async function getItem(id: number): Promise<HackerNewsItem | null> {
  return hnRequest<HackerNewsItem>(`/item/${id}`)
}

/**
 * Get multiple items with details
 */
async function getItemsWithDetails(
  ids: number[],
  limit: number
): Promise<HackerNewsItem[]> {
  const limitedIds = ids.slice(0, Math.min(limit, 500))
  const items = await Promise.all(
    limitedIds.map((id) => getItem(id))
  )
  return items.filter((item): item is HackerNewsItem => item !== null)
}

/**
 * Get stories (with optional details)
 */
async function getStories(
  category: string,
  limit: number,
  includeDetails: boolean
): Promise<HackerNewsToolResponse> {
  const ids = await getStoryIds(category, limit)

  if (ids.length === 0) {
    return {
      success: false,
      output: {
        error: `Failed to fetch ${category}`,
      },
    }
  }

  if (!includeDetails) {
    return {
      success: true,
      output: {
        storyIds: ids,
      },
    }
  }

  const stories = await getItemsWithDetails(ids, limit)

  return {
    success: true,
    output: {
      stories,
      storyIds: ids,
    },
  }
}

/**
 * Get user profile
 */
async function getUser(username: string): Promise<HackerNewsToolResponse> {
  const user = await hnRequest<HackerNewsUser>(`/user/${username}`)

  if (!user) {
    return {
      success: false,
      output: {
        error: `User '${username}' not found`,
      },
    }
  }

  return {
    success: true,
    output: {
      user,
    },
  }
}

/**
 * Get max item ID
 */
async function getMaxItem(): Promise<HackerNewsToolResponse> {
  const maxItem = await hnRequest<number>('/maxitem')

  if (maxItem === null) {
    return {
      success: false,
      output: {
        error: 'Failed to fetch max item ID',
      },
    }
  }

  return {
    success: true,
    output: {
      maxItem,
    },
  }
}

/**
 * Get recent updates
 */
async function getUpdates(): Promise<HackerNewsToolResponse> {
  const updates = await hnRequest<HackerNewsUpdates>('/updates')

  if (!updates) {
    return {
      success: false,
      output: {
        error: 'Failed to fetch updates',
      },
    }
  }

  return {
    success: true,
    output: {
      updates,
    },
  }
}

export const hackerNewsTool: ToolConfig<HackerNewsToolParams, HackerNewsToolResponse> = {
  id: 'hackernews_api',
  name: 'Hacker News API',
  description:
    'Access Hacker News stories, comments, users, and updates. Completely free with no authentication required.',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description:
        'Operation: top_stories, new_stories, best_stories, ask_stories, show_stories, job_stories, get_item, get_user, max_item, updates',
    },
    itemId: {
      type: 'number',
      required: false,
      description: 'Item ID for get_item operation',
    },
    username: {
      type: 'string',
      required: false,
      description: 'Username for get_user operation',
    },
    limit: {
      type: 'number',
      required: false,
      description: 'Number of stories to fetch (default: 30, max: 500)',
    },
    includeDetails: {
      type: 'boolean',
      required: false,
      description: 'Whether to fetch full details for each story (default: true)',
    },
  },

  directExecution: async (params: HackerNewsToolParams): Promise<HackerNewsToolResponse> => {
    const { operation, itemId, username, limit = 30, includeDetails = true } = params

    try {
      switch (operation) {
        case 'top_stories':
          return await getStories('topstories', limit, includeDetails)

        case 'new_stories':
          return await getStories('newstories', limit, includeDetails)

        case 'best_stories':
          return await getStories('beststories', limit, includeDetails)

        case 'ask_stories':
          return await getStories('askstories', limit, includeDetails)

        case 'show_stories':
          return await getStories('showstories', limit, includeDetails)

        case 'job_stories':
          return await getStories('jobstories', limit, includeDetails)

        case 'get_item':
          if (itemId === undefined) {
            return {
              success: false,
              output: {
                error: 'Item ID is required for get_item operation',
              },
            }
          }
          const item = await getItem(itemId)
          if (!item) {
            return {
              success: false,
              output: {
                error: `Item ${itemId} not found`,
              },
            }
          }
          return {
            success: true,
            output: {
              item,
            },
          }

        case 'get_user':
          if (!username) {
            return {
              success: false,
              output: {
                error: 'Username is required for get_user operation',
              },
            }
          }
          return await getUser(username)

        case 'max_item':
          return await getMaxItem()

        case 'updates':
          return await getUpdates()

        default:
          return {
            success: false,
            output: {
              error: `Unknown operation: ${operation}`,
            },
          }
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    stories: { type: 'array', description: 'Array of stories with full details' },
    storyIds: { type: 'array', description: 'Array of story IDs' },
    item: { type: 'json', description: 'Story or comment details' },
    user: { type: 'json', description: 'User profile information' },
    maxItem: { type: 'number', description: 'Current maximum item ID' },
    updates: { type: 'json', description: 'Recent updates (items and profiles)' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
