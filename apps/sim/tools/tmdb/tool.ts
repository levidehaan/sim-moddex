import type { ToolConfig } from '@/tools/types'
import type { TMDBToolParams, TMDBToolResponse } from './types'

const TMDB_API_BASE = 'https://api.themoviedb.org/3'

export const tmdbTool: ToolConfig<TMDBToolParams, TMDBToolResponse> = {
  id: 'tmdb_api',
  name: 'TMDB API',
  description: 'Access movie and TV show database',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Operation to perform',
    },
    apiKey: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'TMDB API key',
    },
    query: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Search query',
    },
    movieId: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Movie ID',
    },
    tvId: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'TV show ID',
    },
    personId: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Person ID',
    },
    mediaType: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Media type',
    },
    timeWindow: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Time window',
    },
    page: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Page number',
    },
  },

  request: {
    url: '',
    method: 'GET',
    headers: () => ({}),
  },

  directExecution: async (params: TMDBToolParams) => {
    try {
      let endpoint = ''
      const url = new URL(TMDB_API_BASE)

      switch (params.operation) {
        case 'search_movie':
          endpoint = '/search/movie'
          if (!params.query) throw new Error('query is required for search_movie')
          url.searchParams.append('query', params.query)
          break
        case 'search_tv':
          endpoint = '/search/tv'
          if (!params.query) throw new Error('query is required for search_tv')
          url.searchParams.append('query', params.query)
          break
        case 'search_person':
          endpoint = '/search/person'
          if (!params.query) throw new Error('query is required for search_person')
          url.searchParams.append('query', params.query)
          break
        case 'movie_details':
          if (!params.movieId) throw new Error('movieId is required for movie_details')
          endpoint = `/movie/${params.movieId}`
          break
        case 'tv_details':
          if (!params.tvId) throw new Error('tvId is required for tv_details')
          endpoint = `/tv/${params.tvId}`
          break
        case 'person_details':
          if (!params.personId) throw new Error('personId is required for person_details')
          endpoint = `/person/${params.personId}`
          break
        case 'popular_movies':
          endpoint = '/movie/popular'
          break
        case 'popular_tv':
          endpoint = '/tv/popular'
          break
        case 'trending':
          const mediaType = params.mediaType || 'all'
          const timeWindow = params.timeWindow || 'week'
          endpoint = `/trending/${mediaType}/${timeWindow}`
          break
        case 'movie_credits':
          if (!params.movieId) throw new Error('movieId is required for movie_credits')
          endpoint = `/movie/${params.movieId}/credits`
          break
        case 'tv_credits':
          if (!params.tvId) throw new Error('tvId is required for tv_credits')
          endpoint = `/tv/${params.tvId}/credits`
          break
        default:
          throw new Error(`Unknown operation: ${params.operation}`)
      }

      url.pathname = endpoint
      url.searchParams.append('api_key', params.apiKey)
      if (params.page) {
        url.searchParams.append('page', params.page.toString())
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`TMDB API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      return {
        success: true,
        output: {
          results: data.results,
          details: data.id ? data : undefined,
          page: data.page,
          total_pages: data.total_pages,
          total_results: data.total_results,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: {
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      }
    }
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
