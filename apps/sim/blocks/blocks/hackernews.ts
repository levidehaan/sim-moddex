import { Newspaper } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

export const HackerNewsBlock: BlockConfig = {
  type: 'hackernews',
  name: 'Hacker News',
  description: 'Get stories, comments, and users from Hacker News',
  longDescription:
    'Access the Hacker News API to fetch top stories, new stories, best stories, ask/show/job posts, comments, and user profiles. Completely free with no authentication required. Great for tech news monitoring and trend analysis.',
  category: 'tools',
  bgColor: '#FF6600',
  icon: Newspaper,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Get Top Stories', id: 'top_stories' },
        { label: 'Get New Stories', id: 'new_stories' },
        { label: 'Get Best Stories', id: 'best_stories' },
        { label: 'Get Ask HN Stories', id: 'ask_stories' },
        { label: 'Get Show HN Stories', id: 'show_stories' },
        { label: 'Get Job Stories', id: 'job_stories' },
        { label: 'Get Story Details', id: 'get_item' },
        { label: 'Get User Profile', id: 'get_user' },
        { label: 'Get Max Item ID', id: 'max_item' },
        { label: 'Get Updates', id: 'updates' },
      ],
      value: () => 'top_stories',
    },
    {
      id: 'itemId',
      title: 'Item ID',
      type: 'short-input',
      placeholder: 'e.g., 8863',
      description: 'Story or comment ID',
      condition: { field: 'operation', value: 'get_item' },
    },
    {
      id: 'username',
      title: 'Username',
      type: 'short-input',
      placeholder: 'e.g., pg',
      description: 'Hacker News username',
      condition: { field: 'operation', value: 'get_user' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '30',
      description: 'Number of stories to fetch (default: 30, max: 500)',
    },
    {
      id: 'includeDetails',
      title: 'Include Full Details',
      type: 'dropdown',
      options: [
        { label: 'Yes - Fetch full story details', id: 'true' },
        { label: 'No - Return IDs only', id: 'false' },
      ],
      value: () => 'true',
      description: 'Fetch full details for each story (slower but more data)',
    },
  ],
  tools: {
    access: ['hackernews_api'],
    config: {
      tool: () => 'hackernews_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'top_stories',
        }

        if (params.itemId) result.itemId = Number(params.itemId)
        if (params.username) result.username = params.username
        if (params.limit) result.limit = Number(params.limit)
        result.includeDetails = params.includeDetails !== 'false'

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    itemId: { type: 'number', description: 'Story or comment ID' },
    username: { type: 'string', description: 'Hacker News username' },
    limit: { type: 'number', description: 'Number of stories to fetch' },
    includeDetails: { type: 'boolean', description: 'Include full story details' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    stories: { type: 'array', description: 'Array of stories with details' },
    storyIds: { type: 'array', description: 'Array of story IDs' },
    item: { type: 'json', description: 'Story or comment details' },
    user: { type: 'json', description: 'User profile information' },
    maxItem: { type: 'number', description: 'Current maximum item ID' },
    updates: { type: 'json', description: 'Recent updates (items and profiles)' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
