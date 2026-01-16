import type { ToolConfig } from '@/tools/types'

export interface MathCalculateParams {
  operation: string
  value1: number
  value2?: number
  decimals?: number
}

export interface MathCalculateResponse {
  success: boolean
  output: {
    result: number
    formatted: string
  }
}

export const mathCalculateTool: ToolConfig<MathCalculateParams, MathCalculateResponse> = {
  id: 'math_calculate',
  name: 'Math Calculate',
  description: 'Perform mathematical calculations',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Mathematical operation',
    },
    value1: {
      type: 'number',
      required: true,
      visibility: 'user-only',
      description: 'First value',
    },
    value2: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Second value',
    },
    decimals: {
      type: 'number',
      required: false,
      visibility: 'user-only',
      description: 'Decimal places for rounding',
    },
  },

  request: {
    url: '',
    method: 'POST',
    headers: () => ({}),
  },

  directExecution: async (params: MathCalculateParams) => {
    try {
      const v1 = Number(params.value1)
      const v2 = params.value2 !== undefined ? Number(params.value2) : 0
      let result: number

      switch (params.operation) {
        case 'add':
          result = v1 + v2
          break
        case 'subtract':
          result = v1 - v2
          break
        case 'multiply':
          result = v1 * v2
          break
        case 'divide':
          if (v2 === 0) throw new Error('Division by zero')
          result = v1 / v2
          break
        case 'percentage':
          result = (v1 * v2) / 100
          break
        case 'percentage_change':
          if (v2 === 0) throw new Error('Cannot calculate percentage change from zero')
          result = ((v1 - v2) / v2) * 100
          break
        case 'round':
          const decimals = params.decimals !== undefined ? params.decimals : 0
          result = Number(v1.toFixed(decimals))
          break
        case 'floor':
          result = Math.floor(v1)
          break
        case 'ceiling':
          result = Math.ceil(v1)
          break
        case 'abs':
          result = Math.abs(v1)
          break
        case 'power':
          result = Math.pow(v1, v2)
          break
        case 'sqrt':
          if (v1 < 0) throw new Error('Cannot calculate square root of negative number')
          result = Math.sqrt(v1)
          break
        case 'min':
          result = Math.min(v1, v2)
          break
        case 'max':
          result = Math.max(v1, v2)
          break
        default:
          throw new Error(`Unknown operation: ${params.operation}`)
      }

      return {
        success: true,
        output: {
          result,
          formatted: result.toString(),
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Calculation failed',
        output: {
          result: 0,
          formatted: '0',
        },
      }
    }
  },

  outputs: {
    result: {
      type: 'number',
      description: 'Calculation result',
    },
    formatted: {
      type: 'string',
      description: 'Formatted result',
    },
  },
}
