import type { ToolConfig } from '@/tools/types'

export interface JsonTransformParams {
  operation: string
  input: any
  path?: string
  value?: any
  mergeWith?: any
  mapExpression?: string
  filterExpression?: string
}

export interface JsonTransformResponse {
  success: boolean
  output: {
    result: any
  }
}

function getValueByPath(obj: any, path: string): any {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/)
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch
      current = current[arrayKey]?.[parseInt(index, 10)]
    } else {
      current = current?.[key]
    }
    
    if (current === undefined) return undefined
  }
  
  return current
}

function setValueByPath(obj: any, path: string, value: any): any {
  const keys = path.split('.')
  const result = JSON.parse(JSON.stringify(obj))
  let current = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/)
    
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch
      if (!current[arrayKey]) current[arrayKey] = []
      current = current[arrayKey][parseInt(index, 10)]
    } else {
      if (!current[key]) current[key] = {}
      current = current[key]
    }
  }
  
  const lastKey = keys[keys.length - 1]
  const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/)
  
  if (arrayMatch) {
    const [, arrayKey, index] = arrayMatch
    if (!current[arrayKey]) current[arrayKey] = []
    current[arrayKey][parseInt(index, 10)] = value
  } else {
    current[lastKey] = value
  }
  
  return result
}

function deleteByPath(obj: any, path: string): any {
  const keys = path.split('.')
  const result = JSON.parse(JSON.stringify(obj))
  let current = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/)
    
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch
      current = current[arrayKey]?.[parseInt(index, 10)]
    } else {
      current = current?.[key]
    }
    
    if (!current) return result
  }
  
  const lastKey = keys[keys.length - 1]
  const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/)
  
  if (arrayMatch) {
    const [, arrayKey, index] = arrayMatch
    current[arrayKey]?.splice(parseInt(index, 10), 1)
  } else {
    delete current[lastKey]
  }
  
  return result
}

export const jsonTransformTool: ToolConfig<JsonTransformParams, JsonTransformResponse> = {
  id: 'json_transform_execute',
  name: 'JSON Transform',
  description: 'Transform and manipulate JSON data',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Transformation operation',
    },
    input: {
      type: 'json',
      required: true,
      visibility: 'user-only',
      description: 'Input JSON data',
    },
    path: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'JSON path',
    },
    value: {
      type: 'json',
      required: false,
      visibility: 'user-only',
      description: 'Value to set',
    },
    mergeWith: {
      type: 'json',
      required: false,
      visibility: 'user-only',
      description: 'Object to merge',
    },
    mapExpression: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Map expression',
    },
    filterExpression: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'Filter expression',
    },
  },

  request: {
    url: '',
    method: 'POST',
    headers: () => ({}),
  },

  directExecution: async (params: JsonTransformParams) => {
    try {
      let input = params.input
      
      // Parse input if it's a string
      if (typeof input === 'string') {
        try {
          input = JSON.parse(input)
        } catch {
          // If parsing fails, keep as string
        }
      }

      let result: any

      switch (params.operation) {
        case 'extract':
          if (!params.path) throw new Error('Path is required for extract operation')
          result = getValueByPath(input, params.path)
          break

        case 'set':
          if (!params.path) throw new Error('Path is required for set operation')
          result = setValueByPath(input, params.path, params.value)
          break

        case 'delete':
          if (!params.path) throw new Error('Path is required for delete operation')
          result = deleteByPath(input, params.path)
          break

        case 'merge':
          if (!params.mergeWith) throw new Error('mergeWith is required for merge operation')
          result = { ...input, ...params.mergeWith }
          break

        case 'map':
          if (!Array.isArray(input)) throw new Error('Input must be an array for map operation')
          if (!params.mapExpression) throw new Error('mapExpression is required for map operation')
          // Simple expression evaluation (limited for security)
          result = input.map((item) => {
            try {
              // Very basic expression evaluation - can be enhanced
              const expr = params.mapExpression!.replace(/item\./g, 'item.')
              return eval(`(function(item) { return ${expr}; })`)(item)
            } catch {
              return item
            }
          })
          break

        case 'filter':
          if (!Array.isArray(input)) throw new Error('Input must be an array for filter operation')
          if (!params.filterExpression) throw new Error('filterExpression is required for filter operation')
          result = input.filter((item) => {
            try {
              return eval(`(function(item) { return ${params.filterExpression}; })`)(item)
            } catch {
              return false
            }
          })
          break

        case 'parse':
          if (typeof input !== 'string') throw new Error('Input must be a string for parse operation')
          result = JSON.parse(input)
          break

        case 'stringify':
          result = JSON.stringify(input, null, 2)
          break

        default:
          throw new Error(`Unknown operation: ${params.operation}`)
      }

      return {
        success: true,
        output: {
          result,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'JSON transformation failed',
        output: {
          result: null,
        },
      }
    }
  },

  outputs: {
    result: {
      type: 'json',
      description: 'Transformed result',
    },
  },
}
