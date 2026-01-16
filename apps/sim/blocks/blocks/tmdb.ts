import { createElement } from 'react'
import type { SVGProps } from 'react'
import { Film } from 'lucide-react'
import type { BlockConfig } from '@/blocks/types'

const TMDBIcon = (props: SVGProps<SVGSVGElement>) => createElement(Film, props)

export const TMDBBlock: BlockConfig = {
  type: 'tmdb',
  name: 'TMDB',
  description: 'Movies and TV show database',
  longDescription:
    'Access The Movie Database (TMDB) API for movies, TV shows, actors, reviews, ratings, and more. Free tier offers 1,000 requests/day. Essential for entertainment content automation and recommendations.',
  category: 'tools',
  bgColor: '#01B4E4',
  icon: TMDBIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Search Movies', id: 'search_movie' },
        { label: 'Search TV Shows', id: 'search_tv' },
        { label: 'Search People', id: 'search_person' },
        { label: 'Get Movie Details', id: 'movie_details' },
        { label: 'Get TV Show Details', id: 'tv_details' },
        { label: 'Get Person Details', id: 'person_details' },
        { label: 'Get Popular Movies', id: 'popular_movies' },
        { label: 'Get Popular TV Shows', id: 'popular_tv' },
        { label: 'Get Trending', id: 'trending' },
        { label: 'Get Movie Credits', id: 'movie_credits' },
        { label: 'Get TV Credits', id: 'tv_credits' },
      ],
      value: () => 'search_movie',
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Enter your TMDB API key',
      password: true,
      required: true,
      connectionDroppable: false,
    },
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'e.g., Inception, Breaking Bad',
      description: 'Search terms',
      condition: {
        field: 'operation',
        value: ['search_movie', 'search_tv', 'search_person'],
      },
    },
    {
      id: 'movieId',
      title: 'Movie ID',
      type: 'short-input',
      placeholder: 'e.g., 550',
      description: 'TMDB movie ID',
      condition: {
        field: 'operation',
        value: ['movie_details', 'movie_credits'],
      },
    },
    {
      id: 'tvId',
      title: 'TV Show ID',
      type: 'short-input',
      placeholder: 'e.g., 1396',
      description: 'TMDB TV show ID',
      condition: {
        field: 'operation',
        value: ['tv_details', 'tv_credits'],
      },
    },
    {
      id: 'personId',
      title: 'Person ID',
      type: 'short-input',
      placeholder: 'e.g., 287',
      description: 'TMDB person ID',
      condition: {
        field: 'operation',
        value: ['person_details'],
      },
    },
    {
      id: 'mediaType',
      title: 'Media Type',
      type: 'dropdown',
      options: [
        { label: 'All', id: 'all' },
        { label: 'Movie', id: 'movie' },
        { label: 'TV', id: 'tv' },
        { label: 'Person', id: 'person' },
      ],
      value: () => 'all',
      condition: {
        field: 'operation',
        value: ['trending'],
      },
    },
    {
      id: 'timeWindow',
      title: 'Time Window',
      type: 'dropdown',
      options: [
        { label: 'Day', id: 'day' },
        { label: 'Week', id: 'week' },
      ],
      value: () => 'week',
      condition: {
        field: 'operation',
        value: ['trending'],
      },
    },
    {
      id: 'page',
      title: 'Page',
      type: 'short-input',
      placeholder: '1',
      description: 'Page number for pagination',
    },
  ],
  tools: {
    access: ['tmdb_api'],
    config: {
      tool: () => 'tmdb_api',
      params: (params) => {
        const result: Record<string, unknown> = {
          operation: params.operation || 'search_movie',
          apiKey: params.apiKey,
        }

        if (params.query) result.query = params.query
        if (params.movieId) result.movieId = params.movieId
        if (params.tvId) result.tvId = params.tvId
        if (params.personId) result.personId = params.personId
        if (params.mediaType) result.mediaType = params.mediaType
        if (params.timeWindow) result.timeWindow = params.timeWindow
        if (params.page) result.page = Number(params.page)

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    apiKey: { type: 'string', description: 'TMDB API key' },
    query: { type: 'string', description: 'Search query' },
    movieId: { type: 'string', description: 'Movie ID' },
    tvId: { type: 'string', description: 'TV show ID' },
    personId: { type: 'string', description: 'Person ID' },
    mediaType: { type: 'string', description: 'Media type for trending' },
    timeWindow: { type: 'string', description: 'Time window for trending' },
    page: { type: 'number', description: 'Page number' },
  },
  outputs: {
    success: { type: 'boolean', description: 'Whether the request succeeded' },
    results: { type: 'array', description: 'Search results' },
    details: { type: 'json', description: 'Item details' },
    page: { type: 'number', description: 'Current page' },
    total_pages: { type: 'number', description: 'Total pages' },
    total_results: { type: 'number', description: 'Total results' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
