import type { ToolConfig } from '@/tools/types'
import type { DeFiLlamaToolParams, DeFiLlamaToolResponse } from './types'

const DEFILLAMA_API_BASE = 'https://api.llama.fi'
const DEFILLAMA_YIELDS_API = 'https://yields.llama.fi'
const DEFILLAMA_STABLECOINS_API = 'https://stablecoins.llama.fi'
const DEFILLAMA_BRIDGES_API = 'https://bridges.llama.fi'

async function makeRequest(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeFiLlama API error: ${error}`)
  }

  return response.json()
}

export const defillamaTool: ToolConfig<DeFiLlamaToolParams, DeFiLlamaToolResponse> = {
  id: 'defillama_api',
  name: 'DeFiLlama API',
  description: 'Access DeFi protocol data, TVL, yields, and more',
  version: '1.0.0',

  params: {
    operation: {
      type: 'string',
      required: true,
      description: 'Operation to perform',
    },
    protocol: {
      type: 'string',
      required: false,
      description: 'Protocol slug',
    },
    chain: {
      type: 'string',
      required: false,
      description: 'Blockchain name',
    },
    stablecoinId: {
      type: 'string',
      required: false,
      description: 'Stablecoin ID',
    },
    bridgeId: {
      type: 'string',
      required: false,
      description: 'Bridge ID',
    },
  },

  directExecution: async (params: DeFiLlamaToolParams): Promise<DeFiLlamaToolResponse> => {
    try {
      const { operation } = params

      switch (operation) {
        case 'protocols': {
          const protocols = await makeRequest(`${DEFILLAMA_API_BASE}/protocols`)
          return {
            success: true,
            output: { protocols: protocols as DeFiLlamaToolResponse['output']['protocols'] },
          }
        }

        case 'protocol_tvl': {
          if (!params.protocol) {
            return {
              success: false,
              output: { error: 'Protocol slug is required' },
            }
          }
          const protocol = await makeRequest(`${DEFILLAMA_API_BASE}/protocol/${params.protocol}`)
          return {
            success: true,
            output: { protocol: protocol as DeFiLlamaToolResponse['output']['protocol'] },
          }
        }

        case 'chain_tvl': {
          if (!params.chain) {
            return {
              success: false,
              output: { error: 'Chain name is required' },
            }
          }
          const tvl = await makeRequest(`${DEFILLAMA_API_BASE}/v2/historicalChainTvl/${params.chain}`)
          const tvlData = tvl as Array<{ date: number; tvl: number }>
          const latestTvl = tvlData.length > 0 ? tvlData[tvlData.length - 1].tvl : 0
          return {
            success: true,
            output: { 
              chainTvl: { tvl: latestTvl, name: params.chain },
              chainHistory: tvlData,
            },
          }
        }

        case 'chains': {
          const chains = await makeRequest(`${DEFILLAMA_API_BASE}/v2/chains`)
          return {
            success: true,
            output: { chains: chains as DeFiLlamaToolResponse['output']['chains'] },
          }
        }

        case 'chain_history': {
          if (!params.chain) {
            return {
              success: false,
              output: { error: 'Chain name is required' },
            }
          }
          const history = await makeRequest(`${DEFILLAMA_API_BASE}/v2/historicalChainTvl/${params.chain}`)
          return {
            success: true,
            output: { chainHistory: history as DeFiLlamaToolResponse['output']['chainHistory'] },
          }
        }

        case 'yields': {
          const yields = await makeRequest(`${DEFILLAMA_YIELDS_API}/pools`)
          const data = yields as { data?: unknown[] }
          return {
            success: true,
            output: { yields: (data.data || []) as DeFiLlamaToolResponse['output']['yields'] },
          }
        }

        case 'stablecoins': {
          if (params.stablecoinId) {
            const stablecoin = await makeRequest(`${DEFILLAMA_STABLECOINS_API}/stablecoin/${params.stablecoinId}`)
            return {
              success: true,
              output: { stablecoins: [stablecoin] as DeFiLlamaToolResponse['output']['stablecoins'] },
            }
          }
          const stablecoins = await makeRequest(`${DEFILLAMA_STABLECOINS_API}/stablecoins`)
          const data = stablecoins as { peggedAssets?: unknown[] }
          return {
            success: true,
            output: { stablecoins: (data.peggedAssets || []) as DeFiLlamaToolResponse['output']['stablecoins'] },
          }
        }

        case 'bridges': {
          if (params.bridgeId) {
            const bridge = await makeRequest(`${DEFILLAMA_BRIDGES_API}/bridge/${params.bridgeId}`)
            return {
              success: true,
              output: { bridges: [bridge] as DeFiLlamaToolResponse['output']['bridges'] },
            }
          }
          const bridges = await makeRequest(`${DEFILLAMA_BRIDGES_API}/bridges`)
          const data = bridges as { bridges?: unknown[] }
          return {
            success: true,
            output: { bridges: (data.bridges || []) as DeFiLlamaToolResponse['output']['bridges'] },
          }
        }

        case 'dex_volumes': {
          let url = `${DEFILLAMA_API_BASE}/overview/dexs`
          if (params.chain) {
            url += `/${params.chain}`
          }
          const dexVolumes = await makeRequest(url)
          return {
            success: true,
            output: { dexVolumes: dexVolumes as DeFiLlamaToolResponse['output']['dexVolumes'] },
          }
        }

        case 'fees': {
          let url = `${DEFILLAMA_API_BASE}/overview/fees`
          if (params.chain) {
            url += `/${params.chain}`
          }
          const fees = await makeRequest(url)
          return {
            success: true,
            output: { fees: fees as DeFiLlamaToolResponse['output']['fees'] },
          }
        }

        default:
          return {
            success: false,
            output: { error: `Unknown operation: ${operation}` },
          }
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
    protocols: { type: 'array', description: 'List of DeFi protocols' },
    protocol: { type: 'json', description: 'Protocol details with TVL' },
    chains: { type: 'array', description: 'List of chains' },
    chainTvl: { type: 'json', description: 'Chain TVL data' },
    chainHistory: { type: 'array', description: 'Historical chain TVL' },
    yields: { type: 'array', description: 'Yield farming pools' },
    stablecoins: { type: 'array', description: 'Stablecoin data' },
    bridges: { type: 'array', description: 'Bridge data' },
    dexVolumes: { type: 'json', description: 'DEX volume data' },
    fees: { type: 'json', description: 'Protocol fees and revenue' },
    error: { type: 'string', description: 'Error message if request failed' },
  },
}
