import type { ToolConfig } from '@/tools/types'
import { buildAlpacaTradingUrl, getAlpacaHeaders, handleAlpacaError } from './types'

export interface AlpacaExerciseOptionParams {
  apiKey: string
  apiSecret: string
  symbol_or_contract_id: string
  paper?: boolean
}

export interface AlpacaExerciseOptionResponse {
  success: boolean
  output: {
    message: string
    symbol: string
  }
}

export const alpacaExerciseOptionTool: ToolConfig<
  AlpacaExerciseOptionParams,
  AlpacaExerciseOptionResponse
> = {
  id: 'alpaca_exercise_option',
  name: 'Exercise Option',
  description:
    'Exercise an option contract. Note: Requests submitted between market close and midnight are rejected.',
  version: '1.0.0',

  params: {
    apiKey: {
      type: 'string',
      required: true,
      description: 'Alpaca API Key ID',
    },
    apiSecret: {
      type: 'string',
      required: true,
      description: 'Alpaca API Secret Key',
    },
    symbol_or_contract_id: {
      type: 'string',
      required: true,
      description: 'OCC option symbol or contract ID to exercise',
    },
    paper: {
      type: 'boolean',
      required: false,
      description: 'Use paper trading environment',
    },
  },

  request: {
    url: (params) =>
      buildAlpacaTradingUrl(
        `/v2/positions/${encodeURIComponent(params.symbol_or_contract_id)}/exercise`,
        params.paper
      ),
    method: 'POST',
    headers: (params) => getAlpacaHeaders(params.apiKey, params.apiSecret),
  },

  transformResponse: async (response: Response, params) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      handleAlpacaError(data, response.status, 'exercise_option')
    }

    return {
      success: true,
      output: {
        message: 'Option exercise request submitted successfully',
        symbol: params?.symbol_or_contract_id || '',
      },
    }
  },

  outputs: {
    message: {
      type: 'string',
      description: 'Success message',
    },
    symbol: {
      type: 'string',
      description: 'The exercised option symbol',
    },
  },
}
